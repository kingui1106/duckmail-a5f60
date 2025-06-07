"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getMessages } from "@/lib/api"
import type { Message } from "@/types"

interface UseMailCheckerOptions {
  onNewMessage?: (message: Message) => void
  onMessagesUpdate?: (messages: Message[]) => void
  interval?: number // 检查间隔，默认2500ms (2.5秒)
  enabled?: boolean // 是否启用自动检查
}

export function useMailChecker({
  onNewMessage,
  onMessagesUpdate,
  interval = 2500, // 2.5秒检查间隔，减轻服务器压力
  enabled = true,
}: UseMailCheckerOptions = {}) {
  const { token, currentAccount, isAuthenticated } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessagesRef = useRef<Message[]>([])
  const isCheckingRef = useRef(false)
  const isInitializedRef = useRef(false) // 添加初始化标记

  // 使用 ref 来存储回调函数，避免依赖项问题
  const onNewMessageRef = useRef(onNewMessage)
  const onMessagesUpdateRef = useRef(onMessagesUpdate)

  // 更新 ref 中的回调函数
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
    onMessagesUpdateRef.current = onMessagesUpdate
  }, [onNewMessage, onMessagesUpdate])

  const startChecking = useCallback(() => {
    console.log("🚀 [MailChecker] Manual start requested - logic handled by useEffect")
  }, [])

  const stopChecking = useCallback(() => {
    console.log("🛑 [MailChecker] Manual stop requested")

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log("⏹️ [MailChecker] Interval cleared manually")
    }

    isCheckingRef.current = false
    isInitializedRef.current = false
    console.log("✅ [MailChecker] Mail checker stopped manually")
  }, [])

  // 当依赖项变化时重新开始检查
  useEffect(() => {
    console.log("🔄 [MailChecker] Dependencies changed", {
      enabled,
      hasToken: !!token,
      hasAccount: !!currentAccount,
      isAuthenticated,
      interval
    })

    // 定义检查函数
    const checkForNewMessages = async () => {
      if (!token || !currentAccount || !isAuthenticated) {
        console.log("🔍 [MailChecker] Skipping check - missing auth data")
        return
      }

      if (isCheckingRef.current) {
        console.log("🔍 [MailChecker] Skipping check - already checking")
        return
      }

      console.log("🔍 [MailChecker] Starting email check...")
      isCheckingRef.current = true

      try {
        const { messages } = await getMessages(token)
        const currentMessages = messages || []
        console.log(`📧 [MailChecker] API call completed - found ${currentMessages.length} messages`)

        // 如果是第一次初始化，直接设置消息列表，不触发新消息通知
        if (!isInitializedRef.current) {
          console.log("🔄 [MailChecker] First initialization - setting up message list")
          lastMessagesRef.current = currentMessages
          isInitializedRef.current = true
          onMessagesUpdateRef.current?.(currentMessages)
          return
        }

        // 比较新消息（只有在已初始化后才检查新消息）
        const lastMessages = lastMessagesRef.current
        const newMessages = currentMessages.filter(
          (currentMsg) => !lastMessages.some((lastMsg) => lastMsg.id === currentMsg.id)
        )

        // 如果有新消息，触发回调
        if (newMessages.length > 0) {
          console.log(`🆕 [MailChecker] Found ${newMessages.length} new messages`)
          newMessages.forEach((message) => {
            onNewMessageRef.current?.(message)
          })
        }

        // 更新消息列表
        if (currentMessages.length !== lastMessages.length ||
            currentMessages.some((msg, index) => msg.id !== lastMessages[index]?.id)) {
          console.log("📝 [MailChecker] Updating message list")
          onMessagesUpdateRef.current?.(currentMessages)
        }

        // 更新最后的消息列表
        lastMessagesRef.current = currentMessages
      } catch (error) {
        console.error("❌ [MailChecker] Failed to check for new messages:", error)
        // 不抛出错误，避免中断定时检查
      } finally {
        isCheckingRef.current = false
        console.log("✅ [MailChecker] Check completed")
      }
    }

    // 先停止现有的检查
    if (intervalRef.current) {
      console.log("⏹️ [MailChecker] Clearing existing interval in effect")
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (enabled && token && currentAccount && isAuthenticated) {
      console.log(`⏰ [MailChecker] Setting up new interval: ${interval}ms`)

      // 立即检查一次
      checkForNewMessages()

      // 设置定时检查
      intervalRef.current = setInterval(() => {
        console.log("⏰ [MailChecker] Interval triggered")
        checkForNewMessages()
      }, interval)

      console.log("✅ [MailChecker] Mail checker started in effect")
    } else {
      console.log("❌ [MailChecker] Cannot start - missing requirements in effect")
      isCheckingRef.current = false
      isInitializedRef.current = false
    }

    return () => {
      console.log("🧹 [MailChecker] Cleanup from dependency effect")
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isCheckingRef.current = false
      isInitializedRef.current = false
    }
  }, [enabled, token, currentAccount, isAuthenticated, interval])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      console.log("🧹 [MailChecker] Component unmounting - cleanup")
      stopChecking()
    }
  }, [stopChecking])

  return {
    startChecking,
    stopChecking,
    isChecking: isCheckingRef.current,
  }
}
