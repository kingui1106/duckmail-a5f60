"use client"


import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import EmptyState from "@/components/empty-state"
import FeatureCards from "@/components/feature-cards"
import AccountModal from "@/components/account-modal"
import LoginModal from "@/components/login-modal"
import MessageList from "@/components/message-list"
import MessageDetail from "@/components/message-detail"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { MailStatusProvider } from "@/contexts/mail-status-context"
import type { Message } from "@/types"
import { useHeroUIToast } from "@/hooks/use-heroui-toast"
import { Languages, CheckCircle, Navigation, RefreshCw } from "lucide-react"

function MainContent() {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginAccountAddress, setLoginAccountAddress] = useState<string>("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const { isAuthenticated, currentAccount } = useAuth()
  const [currentLocale, setCurrentLocale] = useState("zh")
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useHeroUIToast()

  // 检测浏览器语言并设置默认语言
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language || navigator.languages?.[0] || "zh"
      const langCode = browserLang.toLowerCase()

      // 如果是英文相关语言，设置为英文，否则默认中文
      if (langCode.startsWith("en")) {
        return "en"
      }
      return "zh"
    }

    // 从 localStorage 获取保存的语言设置，如果没有则使用浏览器检测
    const savedLocale = localStorage.getItem("duckmail-locale")
    if (savedLocale && (savedLocale === "en" || savedLocale === "zh")) {
      setCurrentLocale(savedLocale)
    } else {
      const detectedLocale = detectBrowserLanguage()
      setCurrentLocale(detectedLocale)
      localStorage.setItem("duckmail-locale", detectedLocale)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = currentLocale === "en" ? "en" : "zh-CN"
  }, [currentLocale])

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale)
    localStorage.setItem("duckmail-locale", locale)
    toast({
      title: locale === "en" ? "Switched to English" : "已切换到中文",
      color: "primary",
      variant: "flat",
      icon: <Languages size={16} />
    })
  }

  const handleCreateAccount = () => {
    setIsAccountModalOpen(true)
  }

  const handleLogin = () => {
    setIsLoginModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAccountModalOpen(false)
  }

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false)
    setLoginAccountAddress("")
  }

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message)
  }

  const handleBackToList = () => {
    setSelectedMessage(null)
  }

  const handleDeleteMessageInDetail = (messageId: string) => {
    setSelectedMessage(null)
    toast({
      title: "Message Deleted",
      description: `Message ID: ${messageId} has been removed.`,
      color: "success",
      variant: "flat",
      icon: <CheckCircle size={16} />
    })
  }

  const handleSidebarItemClick = (item: string) => {
    console.log("Sidebar item clicked:", item)

    if (item === "inbox") {
      setSelectedMessage(null)
      return
    }

    if (item === "refresh") {
      // 手动刷新邮件
      toast({
        title: currentLocale === "en" ? "Refreshing emails..." : "正在刷新邮件...",
        color: "primary",
        variant: "flat",
        icon: <RefreshCw size={16} />
      })
      // 触发 MessageList 组件重新获取邮件
      setRefreshKey(prev => prev + 1)
      return
    }

    // 其他选项显示敬请期待
    const titles = {
      api: currentLocale === "en" ? "API Documentation" : "API 文档",
      faq: currentLocale === "en" ? "FAQ" : "常见问题",
      privacy: currentLocale === "en" ? "Privacy Policy" : "隐私政策",
      contacts: currentLocale === "en" ? "Contact Us" : "联系我们"
    }

    toast({
      title: titles[item as keyof typeof titles] || item,
      description: currentLocale === "en" ? "Coming soon..." : "敬请期待...",
      color: "warning",
      variant: "flat",
      icon: <Navigation size={16} />
    })
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Sidebar activeItem="inbox" onItemClick={handleSidebarItemClick} currentLocale={currentLocale} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onCreateAccount={handleCreateAccount}
            onLogin={handleLogin}
            currentLocale={currentLocale}
            onLocaleChange={handleLocaleChange}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="flex-1">
                {isAuthenticated && currentAccount ? (
                  selectedMessage ? (
                    <MessageDetail
                      message={selectedMessage}
                      onBack={handleBackToList}
                      onDelete={handleDeleteMessageInDetail}
                    />
                  ) : (
                    <MessageList onSelectMessage={handleSelectMessage} currentLocale={currentLocale} refreshKey={refreshKey} />
                  )
                ) : (
                  <EmptyState onCreateAccount={handleCreateAccount} isAuthenticated={isAuthenticated} currentLocale={currentLocale} />
                )}
              </div>
              {(!isAuthenticated || !currentAccount) && <FeatureCards currentLocale={currentLocale} />}
            </div>
          </main>
        </div>
      </div>

      <AccountModal isOpen={isAccountModalOpen} onClose={handleCloseModal} currentLocale={currentLocale} />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        accountAddress={loginAccountAddress}
        currentLocale={currentLocale}
      />
    </>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <MailStatusProvider>
        <MainContent />
      </MailStatusProvider>
    </AuthProvider>
  )
}
