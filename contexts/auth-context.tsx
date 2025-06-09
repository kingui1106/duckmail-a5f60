"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Account, AuthState } from "@/types"
import { createAccount, getToken, getAccount } from "@/lib/api"

interface AuthContextType extends AuthState {
  login: (address: string, password: string) => Promise<void>
  logout: () => void
  register: (address: string, password: string) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  switchAccount: (account: Account) => Promise<void>
  addAccount: (account: Account, token: string, password?: string) => void
  getAccountsForProvider: (providerId: string) => Account[]
  getCurrentProviderAccounts: () => Account[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    currentAccount: null,
    accounts: [],
    isAuthenticated: false,
  })



  // 从邮箱地址获取提供商ID
  const getProviderIdFromEmail = (email: string) => {
    if (typeof window === "undefined") return "duckmail"

    try {
      const domain = email.split("@")[1]
      if (!domain) return "duckmail"

      // 获取缓存的域名信息
      const cachedDomains = localStorage.getItem("cached-domains")
      if (cachedDomains) {
        const domains = JSON.parse(cachedDomains)
        const matchedDomain = domains.find((d: any) => d.domain === domain)
        if (matchedDomain && matchedDomain.providerId) {
          return matchedDomain.providerId
        }
      }

      return "duckmail"
    } catch (error) {
      console.error("Error getting provider from email:", error)
      return "duckmail"
    }
  }

  useEffect(() => {
    // 从本地存储加载认证状态
    const savedAuth = localStorage.getItem("auth")
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth)

        // 数据迁移：为现有账户添加providerId（向后兼容）
        const migratedAccounts = parsedAuth.accounts?.map((account: Account) => ({
          ...account,
          providerId: account.providerId || "duckmail" // 默认为duckmail
        })) || []

        const migratedCurrentAccount = parsedAuth.currentAccount ? {
          ...parsedAuth.currentAccount,
          providerId: parsedAuth.currentAccount.providerId || "duckmail"
        } : null

        setAuthState({
          ...parsedAuth,
          accounts: migratedAccounts,
          currentAccount: migratedCurrentAccount
        })
      } catch (error) {
        console.error("Failed to parse auth from localStorage:", error)
      }
    }
  }, [])

  useEffect(() => {
    // 保存认证状态到本地存储
    // 始终保存状态，包括所有账户信息，即使当前没有活跃的token
    if (authState.accounts.length > 0 || authState.currentAccount || authState.token) {
      localStorage.setItem("auth", JSON.stringify(authState))
    } else {
      // 如果没有任何账户信息，清除localStorage
      localStorage.removeItem("auth")
    }
  }, [authState])

  const login = async (address: string, password: string) => {
    try {
      const { token, id } = await getToken(address, password)
      const providerId = getProviderIdFromEmail(address)
      const account = await getAccount(token, providerId)

      // 添加密码、token和providerId到账户信息
      const accountWithAuth = {
        ...account,
        password,
        token,
        providerId,
      }

      // 检查账户是否已存在
      const existingAccountIndex = authState.accounts.findIndex((acc) => acc.address === account.address)

      let updatedAccounts: Account[]
      if (existingAccountIndex !== -1) {
        // 更新现有账户的信息
        updatedAccounts = authState.accounts.map((acc, index) =>
          index === existingAccountIndex ? accountWithAuth : acc
        )
      } else {
        // 添加新账户
        updatedAccounts = [...authState.accounts, accountWithAuth]
      }

      setAuthState({
        token,
        currentAccount: accountWithAuth,
        accounts: updatedAccounts,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const register = async (address: string, password: string) => {
    try {
      const providerId = getProviderIdFromEmail(address)
      await createAccount(address, password, providerId)
      // 注册成功后直接登录
      await login(address, password)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = () => {
    console.log("🚪 [Auth] Logging out current account")
    setAuthState({
      token: null,
      currentAccount: null,
      accounts: authState.accounts, // 保留所有账户信息
      isAuthenticated: false,
    })
    // 不要删除 localStorage，因为我们要保留账户列表
  }

  const deleteAccount = async (id: string) => {
    try {
      // 实际删除账户的API调用会在这里
      setAuthState({
        ...authState,
        accounts: authState.accounts.filter((account) => account.id !== id),
        currentAccount: authState.currentAccount?.id === id ? null : authState.currentAccount,
        isAuthenticated: authState.currentAccount?.id === id ? false : authState.isAuthenticated,
        token: authState.currentAccount?.id === id ? null : authState.token,
      })
    } catch (error) {
      console.error("Delete account failed:", error)
      throw error
    }
  }

  const switchAccount = async (account: Account) => {
    try {
      console.log(`🔄 [Auth] Switching to account: ${account.address}`)

      // 立即切换到目标账户，提供即时反馈
      setAuthState({
        ...authState,
        token: account.token || null,
        currentAccount: account,
        isAuthenticated: !!account.token,
      })

      // 如果有token，在后台验证并更新
      if (account.token) {
        console.log(`🔍 [Auth] Validating existing token for account: ${account.address}`)
        try {
          const accountProviderId = account.providerId || "duckmail"
          const updatedAccount = await getAccount(account.token, accountProviderId)
          const accountWithAuth = {
            ...updatedAccount,
            password: account.password,
            token: account.token,
            providerId: account.providerId || "duckmail",
          }

          // 更新accounts数组中的账户信息
          const updatedAccounts = authState.accounts.map((acc) =>
            acc.address === account.address ? accountWithAuth : acc
          )

          console.log(`✅ [Auth] Token validated, account info updated: ${account.address}`)
          setAuthState({
            token: account.token,
            currentAccount: accountWithAuth,
            accounts: updatedAccounts,
            isAuthenticated: true,
          })
        } catch (tokenError) {
          console.warn(`⚠️ [Auth] Stored token invalid for account: ${account.address}`)
          // Token 无效，如果有密码则尝试重新获取token
          if (account.password) {
            try {
              console.log(`🔑 [Auth] Token invalid, getting fresh token for account: ${account.address}`)
              const accountProviderId = account.providerId || "duckmail"
              const { token } = await getToken(account.address, account.password, accountProviderId)
              const updatedAccount = await getAccount(token, accountProviderId)

              const accountWithAuth = {
                ...updatedAccount,
                password: account.password,
                token,
                providerId: account.providerId || "duckmail",
              }

              const updatedAccounts = authState.accounts.map((acc) =>
                acc.address === account.address ? accountWithAuth : acc
              )

              console.log(`✅ [Auth] Fresh token obtained, switched to account: ${account.address}`)
              setAuthState({
                token,
                currentAccount: accountWithAuth,
                accounts: updatedAccounts,
                isAuthenticated: true,
              })
            } catch (refreshError) {
              console.error(`❌ [Auth] Failed to refresh token for account: ${account.address}`)
              setAuthState({
                ...authState,
                token: null,
                currentAccount: account,
                isAuthenticated: false,
              })
              throw new Error("Token 已过期且刷新失败，请重新登录")
            }
          } else {
            setAuthState({
              ...authState,
              token: null,
              currentAccount: account,
              isAuthenticated: false,
            })
            throw new Error("Token 已过期，请重新登录")
          }
        }
      } else if (account.password) {
        // 没有token但有密码，在后台获取token
        try {
          console.log(`🔑 [Auth] Getting token for account: ${account.address}`)
          const accountProviderId = account.providerId || "duckmail"
          const { token } = await getToken(account.address, account.password, accountProviderId)
          const updatedAccount = await getAccount(token, accountProviderId)

          const accountWithAuth = {
            ...updatedAccount,
            password: account.password,
            token,
            providerId: account.providerId || "duckmail",
          }

          const updatedAccounts = authState.accounts.map((acc) =>
            acc.address === account.address ? accountWithAuth : acc
          )

          console.log(`✅ [Auth] Token obtained, switched to account: ${account.address}`)
          setAuthState({
            token,
            currentAccount: accountWithAuth,
            accounts: updatedAccounts,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error(`❌ [Auth] Failed to get token for account: ${account.address}`)
          throw new Error("获取登录凭据失败，请重新登录")
        }
      } else {
        // 没有密码也没有token
        console.warn(`⚠️ [Auth] No credentials available for account: ${account.address}`)
        throw new Error("缺少登录凭据，请重新登录")
      }
    } catch (error) {
      console.error("❌ [Auth] Switch account failed:", error)
      throw error
    }
  }

  const addAccount = (account: Account, token: string, password?: string) => {
    const providerId = getProviderIdFromEmail(account.address)
    const accountWithAuth = {
      ...account,
      password,
      token,
      providerId,
    }

    setAuthState({
      token,
      currentAccount: accountWithAuth,
      accounts: [...authState.accounts, accountWithAuth],
      isAuthenticated: true,
    })
  }

  // 获取指定提供商的账户
  const getAccountsForProvider = (providerId: string): Account[] => {
    return authState.accounts.filter(account =>
      (account.providerId || "duckmail") === providerId
    )
  }

  // 获取当前账户的提供商的所有账户
  const getCurrentProviderAccounts = (): Account[] => {
    if (!authState.currentAccount) return []
    const currentProviderId = authState.currentAccount.providerId || "duckmail"
    return getAccountsForProvider(currentProviderId)
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        deleteAccount,
        switchAccount,
        addAccount,
        getAccountsForProvider,
        getCurrentProviderAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
