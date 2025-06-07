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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    currentAccount: null,
    accounts: [],
    isAuthenticated: false,
  })

  useEffect(() => {
    // 从本地存储加载认证状态
    const savedAuth = localStorage.getItem("auth")
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth)
        setAuthState(parsedAuth)
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
      const account = await getAccount(token)

      // 添加密码和token到账户信息
      const accountWithAuth = {
        ...account,
        password,
        token,
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
      await createAccount(address, password)
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

      // 如果账户有存储的密码，重新获取token
      if (account.password) {
        console.log(`🔑 [Auth] Getting fresh token for account: ${account.address}`)
        const { token } = await getToken(account.address, account.password)
        const updatedAccount = await getAccount(token)

        // 更新账户信息和token
        const accountWithAuth = {
          ...updatedAccount,
          password: account.password,
          token,
        }

        // 更新accounts数组中的账户信息
        const updatedAccounts = authState.accounts.map((acc) =>
          acc.address === account.address ? accountWithAuth : acc
        )

        console.log(`✅ [Auth] Successfully switched to account: ${account.address}`)
        setAuthState({
          token,
          currentAccount: accountWithAuth,
          accounts: updatedAccounts,
          isAuthenticated: true,
        })
      } else if (account.token) {
        // 如果有存储的token，先验证是否有效
        console.log(`🔍 [Auth] Validating existing token for account: ${account.address}`)
        try {
          const updatedAccount = await getAccount(account.token)
          const accountWithAuth = {
            ...updatedAccount,
            token: account.token,
          }

          // 更新accounts数组中的账户信息
          const updatedAccounts = authState.accounts.map((acc) =>
            acc.address === account.address ? accountWithAuth : acc
          )

          console.log(`✅ [Auth] Token valid, switched to account: ${account.address}`)
          setAuthState({
            token: account.token,
            currentAccount: accountWithAuth,
            accounts: updatedAccounts,
            isAuthenticated: true,
          })
        } catch (tokenError) {
          console.warn(`⚠️ [Auth] Stored token invalid for account: ${account.address}`)
          // Token 无效，但仍然切换到该账户，用户需要重新登录
          setAuthState({
            ...authState,
            token: null,
            currentAccount: account,
            isAuthenticated: false,
          })
          throw new Error("Token 已过期，请重新登录")
        }
      } else {
        // 没有密码也没有token
        console.warn(`⚠️ [Auth] No credentials available for account: ${account.address}`)
        setAuthState({
          ...authState,
          token: null,
          currentAccount: account,
          isAuthenticated: false,
        })
        throw new Error("缺少登录凭据，请重新登录")
      }
    } catch (error) {
      console.error("❌ [Auth] Switch account failed:", error)
      throw error
    }
  }

  const addAccount = (account: Account, token: string, password?: string) => {
    const accountWithAuth = {
      ...account,
      password,
      token,
    }

    setAuthState({
      token,
      currentAccount: accountWithAuth,
      accounts: [...authState.accounts, accountWithAuth],
      isAuthenticated: true,
    })
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
