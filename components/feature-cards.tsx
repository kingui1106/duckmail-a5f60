"use client"

import { Card, CardBody } from "@heroui/card"
import { Shield, Zap, Gauge } from "lucide-react"

interface FeatureCardsProps {
  currentLocale: string
}

export default function FeatureCards({ currentLocale }: FeatureCardsProps) {
  const features = currentLocale === "en" ? [
    {
      icon: Shield,
      title: "Secure Temporary Email",
      description:
        "Your temporary email address is protected by a reliable password, generated randomly in your browser, providing a barrier against unauthorized access and potential breaches.",
    },
    {
      icon: Zap,
      title: "Instant Disposable Email",
      description:
        "No more wasting precious time on registrations, form-filling, or solving captchas. Your temp email address is ready for use instantly, putting you in control effortlessly.",
    },
    {
      icon: Gauge,
      title: "Fast and Anonymous Email Service",
      description:
        "Experience fast message delivery without delays or restrictions. Our service is finely tuned for maximum delivery speed, ensuring you stay connected seamlessly.",
    },
  ] : [
    {
      icon: Shield,
      title: "安全的临时邮箱",
      description:
        "您的临时邮箱地址受到可靠密码保护，在浏览器中随机生成，为您提供防止未经授权访问和潜在泄露的屏障。",
    },
    {
      icon: Zap,
      title: "即时一次性邮箱",
      description:
        "不再浪费宝贵时间进行注册、填表或解决验证码。您的临时邮箱地址可立即使用，让您轻松掌控一切。",
    },
    {
      icon: Gauge,
      title: "快速匿名邮件服务",
      description:
        "体验快速的消息传递，无延迟或限制。我们的服务经过精心调优，确保最大传递速度，让您保持无缝连接。",
    },
  ]

  return (
    <div className="mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardBody className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* 感谢 Mail.tm 的说明 */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {currentLocale === "en"
            ? "Powered by Mail.tm's free API service. Special thanks to Mail.tm for providing reliable temporary email infrastructure that makes this service possible."
            : "由 Mail.tm 的免费 API 服务提供支持。特别感谢 Mail.tm 提供可靠的临时邮件基础设施，使这项服务成为可能。"
          }
        </p>
      </div>
    </div>
  )
}
