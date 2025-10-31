"use client"

import { Button } from "@heroui/button"

interface EmptyStateProps {
  onLogin: () => void
  isAuthenticated: boolean
  currentLocale: string
}

export default function EmptyState({ onLogin, isAuthenticated, currentLocale }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto flex items-center justify-center">
          <img
            src="https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png"
            alt="DuckMail Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {currentLocale === "en" ? "Temp Mail" : "临时邮件"}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 text-center max-w-md leading-relaxed mb-4">
        {currentLocale === "en"
          ? "Protect your personal email address from spam, bots, phishing, and other online abuse with our free temporary disposable anonymous email service."
          : "使用我们的免费临时一次性匿名邮件服务，保护您的个人邮箱地址免受垃圾邮件、机器人、钓鱼和其他在线滥用的侵害。"
        }
      </p>

      <p className="text-gray-500 dark:text-gray-400 text-center max-w-lg leading-relaxed mb-4">
        {currentLocale === "en"
          ? "No commitments, no risks—just secure, instant access to a temp email address."
          : "无需承诺，无风险——只需安全、即时地访问临时邮箱地址。"
        }
      </p>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-lg leading-relaxed mb-8 px-4">
        {currentLocale === "en"
          ? "Powered by Mail.tm's free API service. We thank Mail.tm for providing reliable temporary email infrastructure."
          : "由 Mail.tm 的免费 API 服务提供支持。我们感谢 Mail.tm 提供可靠的临时邮件基础设施。"
        }
      </p>

      {!isAuthenticated && (
        <div className="flex justify-center w-full">
          <Button 
            color="primary" 
            size="lg" 
            className="px-16 py-8 text-2xl font-bold shadow-lg hover:shadow-xl transition-all" 
            onPress={onLogin}
          >
            {currentLocale === "en" ? "Login Now" : "立即登录"}
          </Button>
        </div>
      )}
    </div>
  )
}
