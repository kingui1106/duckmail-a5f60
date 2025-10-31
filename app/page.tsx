"use client"


import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import EmptyState from "@/components/empty-state"
import FeatureCards from "@/components/feature-cards"
import LoginModal from "@/components/login-modal"
import MessageList from "@/components/message-list"
import MessageDetail from "@/components/message-detail"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { MailStatusProvider } from "@/contexts/mail-status-context"
import type { Message } from "@/types"
import { useHeroUIToast } from "@/hooks/use-heroui-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { Languages, CheckCircle, Navigation, RefreshCw, Menu } from "lucide-react"
import { Button } from "@heroui/button"

function MainContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginAccountAddress, setLoginAccountAddress] = useState<string>("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const { isAuthenticated, currentAccount } = useAuth()
  const [currentLocale, setCurrentLocale] = useState("zh")
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useHeroUIToast()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  const handleLogin = () => {
    setIsLoginModalOpen(true)
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

    if (item === "github" || item === "faq") {
      // 跳转到GitHub仓库（FAQ也跳转到GitHub）
      window.open("https://github.com/moonwesif/DuckMail", "_blank", "noopener,noreferrer")
      return
    }

    if (item === "api") {
      // 跳转到API文档页面
      window.open("/api-docs", "_blank", "noopener,noreferrer")
      return
    }

    if (item === "privacy") {
      // 跳转到隐私政策页面
      window.open("/privacy", "_blank", "noopener,noreferrer")
      return
    }

    // 其他选项显示敬请期待（虽然现在应该没有其他选项了）
    toast({
      title: item,
      description: currentLocale === "en" ? "Coming soon..." : "敬请期待...",
      color: "warning",
      variant: "flat",
      icon: <Navigation size={16} />
    })
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        {/* 桌面端侧边栏 */}
        {!isMobile && (
          <Sidebar activeItem="inbox" onItemClick={handleSidebarItemClick} currentLocale={currentLocale} />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 移动端顶部栏包含菜单按钮 */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsSidebarOpen(true)}
                className="text-gray-600 dark:text-gray-300"
                aria-label="打开菜单"
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png"
                    alt="DuckMail Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-lg text-gray-800 dark:text-white">duckmail.sbs</span>
              </div>
              <div className="w-8" /> {/* 占位符保持居中 */}
            </div>
          )}

          <Header
            onLogin={handleLogin}
            currentLocale={currentLocale}
            onLocaleChange={handleLocaleChange}
            isMobile={isMobile}
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
                  <EmptyState onLogin={handleLogin} isAuthenticated={isAuthenticated} currentLocale={currentLocale} />
                )}
              </div>
              {(!isAuthenticated || !currentAccount) && <FeatureCards currentLocale={currentLocale} />}
            </div>
          </main>
        </div>

        {/* 移动端侧边栏抽屉 */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src="https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png"
                        alt="DuckMail Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-semibold text-lg text-gray-800 dark:text-white">duckmail.sbs</span>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setIsSidebarOpen(false)}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <Sidebar
                activeItem="inbox"
                onItemClick={(item) => {
                  handleSidebarItemClick(item)
                  setIsSidebarOpen(false)
                }}
                currentLocale={currentLocale}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>

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
