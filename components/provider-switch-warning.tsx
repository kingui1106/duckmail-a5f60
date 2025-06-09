"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal"
import { Button } from "@heroui/button"
import { Card, CardBody } from "@heroui/card"
import { AlertTriangle, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { ApiProvider } from "@/types"

interface ProviderSwitchWarningProps {
  isOpen: boolean
  onClose: () => void
  newProvider: ApiProvider | null
  onConfirm: () => void
  currentLocale: string
}

export function ProviderSwitchWarning({ 
  isOpen, 
  onClose, 
  newProvider, 
  onConfirm, 
  currentLocale 
}: ProviderSwitchWarningProps) {
  const { getCurrentProviderAccounts, currentAccount } = useAuth()
  const isZh = currentLocale !== "en"
  const currentProviderAccounts = getCurrentProviderAccounts()

  // 如果没有newProvider，不显示Modal
  if (!newProvider) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <AlertTriangle className="text-warning" size={20} />
          {isZh ? "切换 API 提供商" : "Switch API Provider"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card className="border-warning-200 bg-warning-50">
              <CardBody>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-warning mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-warning-800 mb-2">
                      {isZh ? "重要提醒" : "Important Notice"}
                    </h4>
                    <p className="text-warning-700 text-sm">
                      {isZh 
                        ? "切换到不同的 API 提供商将会影响您的账户访问。每个账户都绑定到特定的提供商。"
                        : "Switching to a different API provider will affect your account access. Each account is bound to a specific provider."
                      }
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div>
              <h4 className="font-medium mb-2">
                {isZh ? "切换详情：" : "Switch Details:"}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {isZh 
                  ? `您正在从当前提供商切换到 ${newProvider.name}`
                  : `You are switching from current provider to ${newProvider.name}`
                }
              </p>
            </div>

            {currentProviderAccounts.length > 0 && (
              <Card>
                <CardBody>
                  <div className="flex items-start gap-3">
                    <Users className="text-blue-500 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        {isZh ? "当前提供商的账户" : "Current Provider Accounts"}
                      </h4>
                      <div className="space-y-1">
                        {currentProviderAccounts.map((account) => (
                          <div 
                            key={account.id} 
                            className={`text-sm p-2 rounded ${
                              account.id === currentAccount?.id 
                                ? 'bg-blue-100 text-blue-800 font-medium' 
                                : 'text-gray-600'
                            }`}
                          >
                            {account.address}
                            {account.id === currentAccount?.id && (
                              <span className="ml-2 text-xs">
                                ({isZh ? "当前" : "Current"})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        {isZh 
                          ? "这些账户在新提供商中将不可用。您需要在新提供商中创建新账户。"
                          : "These accounts will not be available in the new provider. You'll need to create new accounts in the new provider."
                        }
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">
                {isZh ? "切换后会发生什么：" : "What happens after switching:"}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {isZh ? "您将被登出当前账户" : "You will be logged out of current account"}</li>
                <li>• {isZh ? "需要在新提供商中创建或登录账户" : "You'll need to create or login to accounts in the new provider"}</li>
                <li>• {isZh ? "之前的账户信息将被保留，可以随时切换回来" : "Previous account information will be preserved and you can switch back anytime"}</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {isZh ? "取消" : "Cancel"}
          </Button>
          <Button color="warning" onPress={onConfirm}>
            {isZh ? "确认切换" : "Confirm Switch"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
