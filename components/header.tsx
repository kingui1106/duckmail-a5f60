"use client"

import { Button } from "@heroui/button"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/dropdown"
import { Avatar } from "@heroui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sun, Moon, Languages, User, UserPlus, LogOut, Trash2, Copy, Check, Wifi } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useHeroUIToast } from "@/hooks/use-heroui-toast"
import { useMailStatus } from "@/contexts/mail-status-context"
import { useSmartMailChecker } from "@/hooks/use-smart-mail-checker"

interface HeaderProps {
  onCreateAccount: () => void
  currentLocale: string
  onLocaleChange: (locale: string) => void
  onLogin?: () => void
}

export default function Header({ onCreateAccount, currentLocale, onLocaleChange, onLogin }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, currentAccount, accounts, logout, switchAccount, deleteAccount } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const { toast } = useHeroUIToast()
  const { isEnabled, setIsEnabled } = useMailStatus()

  // 获取智能邮件检查器的状态
  // 注意：这里的 enabled 只控制轮询策略，不影响 Mercure
  const smartChecker = useSmartMailChecker({
    enabled: isEnabled, // 只控制备用轮询策略
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopyToClipboard = useCallback(
    async (text: string, type: string) => {
      try {
        await navigator.clipboard.writeText(text)
        if (type === "email") setCopiedEmail(true)
        toast({ title: `${type === "email" ? "邮箱地址" : "内容"}已复制`, description: text })
        setTimeout(() => {
          if (type === "email") setCopiedEmail(false)
        }, 2000)
      } catch (err) {
        toast({ title: "复制失败", description: "无法访问剪贴板", color: "danger", variant: "flat" })
        console.error("Failed to copy: ", err)
      }
    },
    [toast],
  )

  if (!mounted) return null

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "NA"
  }

  const getRandomColor = (email: string) => {
    if (!email) return "default"
    const colors = ["primary", "secondary", "success", "warning", "danger"]
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const toggleLocale = () => {
    onLocaleChange(currentLocale === "en" ? "zh" : "en")
  }

  const toggleMailChecker = () => {
    const newState = !isEnabled
    setIsEnabled(newState)

    // 根据当前策略状态提供不同的提示
    let title, description

    if (smartChecker.isUsingMercure) {
      // Mercure 连接成功时，按钮不影响邮件检查
      title = newState ? "备用策略已启用" : "备用策略已禁用"
      description = "实时连接正常，此设置仅影响备用轮询策略"
    } else if (smartChecker.mercureAttempted && !smartChecker.isUsingMercure) {
      // Mercure 失败时，按钮控制轮询策略
      title = newState ? "已启用备用邮件检查" : "已禁用备用邮件检查"
      description = newState ?
        "实时连接失败，已启用轮询模式 (30秒间隔)" :
        "实时连接失败，备用轮询也已禁用"
    } else {
      // 连接中时
      title = newState ? "备用策略已启用" : "备用策略已禁用"
      description = "正在尝试实时连接，此设置影响备用策略"
    }

    toast({
      title,
      description,
      color: newState ? "success" : "warning",
      variant: "flat",
      icon: <Wifi size={16} />,
    })
  }

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {isAuthenticated && currentAccount ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="light"
                  className="text-sm font-medium text-gray-800 dark:text-white p-2 h-auto bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                  onPress={() => handleCopyToClipboard(currentAccount.address, "email")}
                  endContent={
                    copiedEmail ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-gray-500 dark:text-gray-300" />
                    )
                  }
                >
                  {currentAccount.address}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{copiedEmail ? "已复制!" : "点击复制邮箱地址"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="w-px h-6" /> // Placeholder for spacing if not authenticated
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 邮件检查切换按钮 */}
        {isAuthenticated && currentAccount && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={toggleMailChecker}
                  className="text-gray-600 dark:text-gray-300"
                  aria-label={
                    smartChecker.isUsingMercure ?
                      (isEnabled ? "禁用备用策略" : "启用备用策略") :
                      (isEnabled ? "禁用备用轮询" : "启用备用轮询")
                  }
                >
                  <Wifi
                    size={16}
                    className={`${
                      smartChecker.isUsingMercure ?
                        'text-green-500 animate-pulse' : // Mercure 连接成功，按钮显示绿色
                      smartChecker.isUsingPolling ?
                        'text-yellow-500' : // 轮询模式运行中
                      smartChecker.mercureAttempted ?
                        (isEnabled ? 'text-yellow-400' : 'text-red-500') : // Mercure 失败，根据轮询状态显示
                      'text-blue-500' // 连接中
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  {smartChecker.isUsingMercure ? (
                    <>
                      <p className="font-medium text-green-600">🚀 实时连接活跃</p>
                      <p className="text-xs">使用 Mercure SSE，立即接收新邮件</p>
                      <p className="text-xs text-gray-500">
                        备用策略: {isEnabled ? '已启用' : '已禁用'}
                      </p>
                      <p className="text-xs text-blue-500">
                        点击{isEnabled ? '禁用' : '启用'}备用策略
                      </p>
                    </>
                  ) : smartChecker.isUsingPolling ? (
                    <>
                      <p className="font-medium text-yellow-600">🔄 备用模式运行中</p>
                      <p className="text-xs">实时连接失败，使用轮询 (30秒间隔)</p>
                      <p className="text-xs text-blue-500">点击禁用备用轮询</p>
                    </>
                  ) : smartChecker.mercureAttempted ? (
                    <>
                      <p className="font-medium text-red-600">❌ 实时连接失败</p>
                      <p className="text-xs">
                        备用轮询: {isEnabled ? '可用' : '已禁用'}
                      </p>
                      <p className="text-xs text-blue-500">
                        点击{isEnabled ? '禁用' : '启用'}备用轮询
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-blue-600">⏳ 正在连接...</p>
                      <p className="text-xs">正在尝试建立实时连接</p>
                      <p className="text-xs text-gray-500">
                        备用策略: {isEnabled ? '已启用' : '已禁用'}
                      </p>
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-gray-600 dark:text-gray-300"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={toggleLocale}
          className="text-gray-600 dark:text-gray-300"
          aria-label={`Switch to ${currentLocale === "en" ? "Chinese" : "English"}`}
        >
          <Languages size={18} />
        </Button>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm" className="text-gray-600 dark:text-gray-300">
              {isAuthenticated && currentAccount ? (
                <Avatar
                  name={getInitials(currentAccount.address)}
                  color={getRandomColor(currentAccount.address) as any}
                  size="sm"
                />
              ) : (
                <User size={18} />
              )}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User actions">
            {[
              ...(isAuthenticated && currentAccount ? [
                <DropdownSection key="current-account" title={currentLocale === "en" ? "Current Account" : "当前账户"} showDivider>
                  <DropdownItem
                    key="current-email"
                    textValue={currentAccount.address}
                    onPress={() => handleCopyToClipboard(currentAccount.address, "email")}
                    endContent={
                      copiedEmail ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white" />
                      )
                    }
                    className="py-3 cursor-pointer"
                  >
                    <div className="font-semibold text-gray-800 dark:text-white text-sm">
                      {currentAccount.address}
                    </div>
                  </DropdownItem>
                </DropdownSection>
              ] : []),

              ...(isAuthenticated && accounts.length > 1 ? [
                <DropdownSection key="switch-accounts" title={currentLocale === "en" ? "Switch Account" : "切换账户"} showDivider>
                  {accounts
                    .filter((account) => account.address !== currentAccount?.address)
                    .map((account) => (
                      <DropdownItem
                        key={account.id}
                        startContent={
                          <Avatar
                            name={getInitials(account.address)}
                            color={getRandomColor(account.address) as any}
                            size="sm"
                          />
                        }
                        onPress={async () => {
                          try {
                            await switchAccount(account)
                          } catch (error) {
                            toast({
                              title: currentLocale === "en" ? "Account Switch Failed" : "切换账户失败",
                              description: currentLocale === "en" ? "Please try logging in to this account again" : "请尝试重新登录该账户",
                              color: "danger",
                              variant: "flat"
                            })
                          }
                        }}
                        textValue={account.address}
                        className="py-2"
                      >
                        <div className="text-gray-800 dark:text-white text-sm">
                          {account.address}
                        </div>
                      </DropdownItem>
                    ))}
                </DropdownSection>
              ] : []),

              <DropdownSection key="account-actions" aria-label="Account Actions">
                {isAuthenticated && currentAccount ? (
                  <>
                    <DropdownItem key="login_another" startContent={<User size={16} />} onPress={onLogin || (() => {})}>
                      {currentLocale === "en" ? "Login Another Account" : "登录其他账户"}
                    </DropdownItem>
                    <DropdownItem key="create_another" startContent={<UserPlus size={16} />} onPress={onCreateAccount}>
                      {currentLocale === "en" ? "Create New Account" : "创建新账户"}
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash2 size={16} />}
                      onPress={() => currentAccount && deleteAccount(currentAccount.id)}
                    >
                      {currentLocale === "en" ? "Delete Current Account" : "删除当前账户"}
                    </DropdownItem>
                  </>
                ) : (
                  <>
                    <DropdownItem key="login" startContent={<User size={16} />} onPress={onLogin || (() => {})}>
                      {currentLocale === "en" ? "Login Existing Account" : "登录现有账户"}
                    </DropdownItem>
                    <DropdownItem key="create" startContent={<UserPlus size={16} />} onPress={onCreateAccount}>
                      {currentLocale === "en" ? "Create New Account" : "创建新账户"}
                    </DropdownItem>
                  </>
                )}
              </DropdownSection>
            ]}
          </DropdownMenu>
        </Dropdown>

        {isAuthenticated && (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={logout}
            className="text-gray-600 dark:text-gray-300"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </header>
  )
}
