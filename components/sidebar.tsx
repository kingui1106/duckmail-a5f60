"use client"

import { Button } from "@heroui/button"
import { Card } from "@heroui/card"
import { Mail, RefreshCw } from "lucide-react"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  currentLocale: string
  isMobile?: boolean
}

export default function Sidebar({ activeItem, onItemClick, currentLocale, isMobile = false }: SidebarProps) {
  const menuItems = [
    {
      id: "inbox",
      label: currentLocale === "en" ? "Inbox" : "收件箱",
      icon: Mail
    },
    {
      id: "refresh",
      label: currentLocale === "en" ? "Refresh" : "刷新",
      icon: RefreshCw
    },
  ]

  return (
    <Card className={`w-64 ${isMobile ? 'h-full' : 'h-screen'} rounded-none ${isMobile ? '' : 'border-r'} border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col`}>
      {!isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png"
                alt="DuckMail Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg text-gray-800 dark:text-white">duckmail.sbs</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3 flex-grow">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "flat" : "light"}
              color={activeItem === item.id ? "primary" : "default"}
              className="w-full justify-start h-12 text-base"
              startContent={<Icon size={20} />}
              onPress={() => onItemClick(item.id)}
            >
              {item.label}
            </Button>
          )
        })}
      </div>
    </Card>
  )
}
