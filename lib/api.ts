import type { Account, Domain, Message, MessageDetail } from "@/types"

const API_BASE_URL = "/api/mail"

// 根据API文档改进错误处理
function getErrorMessage(status: number, errorData: any): string {
  switch (status) {
    case 400:
      return "请求参数错误或缺失必要信息"
    case 401:
      return "认证失败，请检查登录状态"
    case 404:
      return "请求的资源不存在"
    case 405:
      return "请求方法不被允许"
    case 418:
      return "服务器暂时不可用"
    case 422:
      return errorData?.message || "请求数据格式错误，请检查用户名长度或域名格式"
    case 429:
      return "请求过于频繁，请稍后再试"
    default:
      return errorData?.message || errorData?.details || errorData?.error || `请求失败 (${status})`
  }
}

// 重试函数，改进对429错误的处理
async function retryFetch(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
  try {
    const response = await fn()

    // 检查是否是Response对象且有429状态码
    if (response && typeof response.status === 'number' && response.status === 429 && retries > 0) {
      console.log(`Rate limited, retrying... ${retries} attempts left`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryFetch(fn, retries - 1, delay)
    }

    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryFetch(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// 修改 fetchDomains 函数，移除备用域名
export async function fetchDomains(): Promise<Domain[]> {
  try {
    const response = await retryFetch(async () => {
      const res = await fetch(`${API_BASE_URL}?endpoint=/domains`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      return res
    })

    const data = await response.json()

    if (data && data["hydra:member"] && Array.isArray(data["hydra:member"])) {
      return data["hydra:member"]
    } else {
      console.error("Invalid domains data format:", data)
      return []
    }
  } catch (error) {
    console.error("Error fetching domains:", error)
    throw error
  }
}

export async function createAccount(address: string, password: string): Promise<Account> {
  const response = await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    return res
  })

  return response.json()
}

export async function getToken(address: string, password: string): Promise<{ token: string; id: string }> {
  const response = await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    return res
  })

  return response.json()
}

export async function getAccount(token: string): Promise<Account> {
  const response = await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    return res
  })

  return response.json()
}

export async function getMessages(token: string, page = 1): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
  const timestamp = new Date().toISOString()
  console.log(`📡 [API] getMessages called at ${timestamp} - page: ${page}`)

  const response = await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/messages&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      console.log(`❌ [API] getMessages failed - Status: ${res.status}`)
      throw new Error(getErrorMessage(res.status, error))
    }

    console.log(`✅ [API] getMessages success - Status: ${res.status}`)
    return res
  })

  const data = await response.json()
  const messages = data["hydra:member"] || []
  const total = data["hydra:totalItems"] || 0

  // 根据API文档，每页最多30条消息
  const hasMore = messages.length === 30 && (page * 30) < total

  console.log(`📊 [API] getMessages result - Messages: ${messages.length}, Total: ${total}, HasMore: ${hasMore}`)

  return {
    messages,
    total,
    hasMore,
  }
}

export async function getMessage(token: string, id: string): Promise<MessageDetail> {
  const response = await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/messages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    return res
  })

  return response.json()
}

export async function markMessageAsRead(token: string, id: string): Promise<{ seen: boolean }> {
  const response = await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/messages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/merge-patch+json",
      },
      body: JSON.stringify({ seen: true }), // 需要发送请求体来标记为已读
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    // API文档显示成功时返回 {"seen": true}
    if (res.headers.get("content-type")?.includes("application/json")) {
      return res.json()
    }
    // 如果状态码是200，假设操作成功
    return { seen: true }
  })

  return response
}

export async function deleteMessage(token: string, id: string): Promise<void> {
  await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/messages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    return res
  })
}

export async function deleteAccount(token: string, id: string): Promise<void> {
  await retryFetch(async () => {
    const res = await fetch(`${API_BASE_URL}?endpoint=/accounts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(getErrorMessage(res.status, error))
    }

    return res
  })
}
