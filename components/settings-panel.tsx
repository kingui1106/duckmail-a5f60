"use client"

import { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Card, CardBody, CardHeader } from "@heroui/card"

import { Divider } from "@heroui/react"
import { Trash2, Plus, Edit3 } from "lucide-react"
import { useApiProvider } from "@/contexts/api-provider-context"
import { useHeroUIToast } from "@/hooks/use-heroui-toast"
import type { CustomApiProvider } from "@/types"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  currentLocale: string
}

export function SettingsPanel({ isOpen, onClose, currentLocale }: SettingsPanelProps) {
  const {
    providers,
    addCustomProvider,
    removeCustomProvider,
    updateCustomProvider,
    toggleProviderEnabled,
    isProviderEnabled,
    apiKey,
    setApiKey
  } = useApiProvider()
  const { toast } = useHeroUIToast()

  const [showCustomForm, setShowCustomForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<CustomApiProvider | null>(null)

  // 自定义提供商表单状态
  const [customForm, setCustomForm] = useState({
    id: "",
    name: "",
    baseUrl: "",
    mercureUrl: "",
  })

  // API Key 表单状态
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)

  const isZh = currentLocale !== "en"

  // 同步 API Key 变化
  useEffect(() => {
    setApiKeyInput(apiKey)
  }, [apiKey])

  const resetCustomForm = () => {
    setCustomForm({
      id: "",
      name: "",
      baseUrl: "",
      mercureUrl: "",
    })
    setEditingProvider(null)
  }

  const handleSave = () => {
    toast({
      title: isZh ? "设置已保存" : "Settings Saved",
      color: "success",
      variant: "flat",
    })
    onClose()
  }

  const handleAddCustomProvider = () => {
    if (!customForm.id || !customForm.name || !customForm.baseUrl || !customForm.mercureUrl) {
      toast({
        title: isZh ? "请填写所有字段" : "Please fill all fields",
        color: "danger",
        variant: "flat",
      })
      return
    }

    // 检查ID是否已存在
    if (providers.some(p => p.id === customForm.id)) {
      toast({
        title: isZh ? "ID已存在" : "ID already exists",
        description: isZh ? "请使用不同的ID" : "Please use a different ID",
        color: "danger",
        variant: "flat",
      })
      return
    }

    const newProvider: CustomApiProvider = {
      ...customForm,
      isCustom: true,
    }

    if (editingProvider) {
      updateCustomProvider(newProvider)
      toast({
        title: isZh ? "提供商已更新" : "Provider Updated",
        color: "success",
        variant: "flat",
      })
    } else {
      addCustomProvider(newProvider)
      toast({
        title: isZh ? "自定义提供商已添加" : "Custom Provider Added",
        color: "success",
        variant: "flat",
      })
    }

    setShowCustomForm(false)
    resetCustomForm()
  }

  const handleEditProvider = (provider: CustomApiProvider) => {
    setCustomForm({
      id: provider.id,
      name: provider.name,
      baseUrl: provider.baseUrl,
      mercureUrl: provider.mercureUrl,
    })
    setEditingProvider(provider)
    setShowCustomForm(true)
  }

  const handleDeleteProvider = (providerId: string) => {
    removeCustomProvider(providerId)
    toast({
      title: isZh ? "提供商已删除" : "Provider Deleted",
      color: "warning",
      variant: "flat",
    })
  }

  const handleSaveApiKey = () => {
    console.log(`🔑 [Settings] Saving API Key: ${apiKeyInput ? `${apiKeyInput.substring(0, 10)}...` : 'null'}`)

    // 验证API Key格式
    if (apiKeyInput && !apiKeyInput.startsWith('dk_') && !apiKeyInput.startsWith('Bearer ')) {
      toast({
        title: isZh ? "API Key 格式可能不正确，应以 'dk_' 开头" : "API Key format may be incorrect, should start with 'dk_'",
        color: "warning",
        variant: "flat",
      })
    }

    setApiKey(apiKeyInput)
    toast({
      title: isZh ? "API Key 已保存" : "API Key Saved",
      color: "success",
      variant: "flat",
    })
  }

  const handleTestApiKey = async () => {
    const currentApiKey = localStorage.getItem("api-key")
    console.log(`🔑 [Settings] Current stored API Key: ${currentApiKey ? `${currentApiKey.substring(0, 10)}...` : 'null'}`)

    // 测试API Key是否正确发送
    if (currentApiKey) {
      try {
        const { fetchDomainsFromProvider } = await import("@/lib/api")
        console.log(`🔑 [Settings] Testing API Key with domains request...`)
        await fetchDomainsFromProvider("duckmail")
        toast({
          title: isZh ? "API Key 测试完成，请查看控制台日志" : "API Key test completed, check console logs",
          color: "success",
          variant: "flat",
        })
      } catch (error) {
        console.error(`🔑 [Settings] API Key test failed:`, error)
        toast({
          title: isZh ? "API Key 测试失败" : "API Key test failed",
          color: "danger",
          variant: "flat",
        })
      }
    } else {
      toast({
        title: isZh ? "未设置 API Key" : "No API Key set",
        color: "warning",
        variant: "flat",
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {isZh ? "API 提供商设置" : "API Provider Settings"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* 提供商管理 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {isZh ? "API 提供商管理" : "API Provider Management"}
              </h3>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <Card key={provider.id} className={`border ${isProviderEnabled(provider.id) ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'}`}>
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${isProviderEnabled(provider.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{provider.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{provider.baseUrl}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {isProviderEnabled(provider.id)
                                ? (isZh ? "已启用" : "Enabled")
                                : (isZh ? "已禁用" : "Disabled")
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.isCustom && (
                            <>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEditProvider(provider as CustomApiProvider)}
                              >
                                <Edit3 size={16} />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDeleteProvider(provider.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant={isProviderEnabled(provider.id) ? "flat" : "solid"}
                            color={isProviderEnabled(provider.id) ? "warning" : "success"}
                            onPress={() => toggleProviderEnabled(provider.id)}
                          >
                            {isProviderEnabled(provider.id)
                              ? (isZh ? "禁用" : "Disable")
                              : (isZh ? "启用" : "Enable")
                            }
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <Divider />

            {/* API Key 设置 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold mb-3">
                {isZh ? "API Key 设置" : "API Key Settings"}
              </h3>
              <div className="space-y-3">
                <Input
                  label={isZh ? "API Key (可选)" : "API Key (Optional)"}
                  placeholder={isZh ? "输入您的 API Key" : "Enter your API Key"}
                  description={isZh ? `提供 API Key 可获得更多域名选择和私有域名创建权限。当前Context中的API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : '未设置'}` : `Providing an API Key gives you access to more domain choices and private domain creation permissions. Current Context API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set'}`}
                  value={apiKeyInput}
                  onValueChange={setApiKeyInput}
                  type="password"
                  variant="bordered"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    onPress={handleTestApiKey}
                  >
                    {isZh ? "测试" : "Test"}
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onPress={handleSaveApiKey}
                  >
                    {isZh ? "保存" : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            <Divider />

            {/* 自定义提供商 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  {isZh ? "自定义提供商" : "Custom Provider"}
                </h3>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Plus size={16} />}
                  onPress={() => {
                    resetCustomForm()
                    setShowCustomForm(true)
                  }}
                >
                  {isZh ? "添加" : "Add"}
                </Button>
              </div>

              {showCustomForm && (
                <Card>
                  <CardHeader>
                    <h4 className="text-md font-medium">
                      {editingProvider 
                        ? (isZh ? "编辑提供商" : "Edit Provider")
                        : (isZh ? "添加自定义提供商" : "Add Custom Provider")
                      }
                    </h4>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <Input
                      label={isZh ? "ID" : "ID"}
                      placeholder={isZh ? "唯一标识符" : "Unique identifier"}
                      value={customForm.id}
                      onValueChange={(value) => setCustomForm(prev => ({ ...prev, id: value }))}
                      isDisabled={!!editingProvider}
                    />
                    <Input
                      label={isZh ? "名称" : "Name"}
                      placeholder={isZh ? "提供商名称" : "Provider name"}
                      value={customForm.name}
                      onValueChange={(value) => setCustomForm(prev => ({ ...prev, name: value }))}
                    />
                    <Input
                      label={isZh ? "API 基础 URL" : "API Base URL"}
                      placeholder="https://api.example.com"
                      value={customForm.baseUrl}
                      onValueChange={(value) => setCustomForm(prev => ({ ...prev, baseUrl: value }))}
                    />
                    <Input
                      label={isZh ? "Mercure URL" : "Mercure URL"}
                      placeholder="https://mercure.example.com/.well-known/mercure"
                      value={customForm.mercureUrl}
                      onValueChange={(value) => setCustomForm(prev => ({ ...prev, mercureUrl: value }))}
                    />
                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        onPress={handleAddCustomProvider}
                      >
                        {editingProvider 
                          ? (isZh ? "更新" : "Update")
                          : (isZh ? "添加" : "Add")
                        }
                      </Button>
                      <Button
                        variant="light"
                        onPress={() => {
                          setShowCustomForm(false)
                          resetCustomForm()
                        }}
                      >
                        {isZh ? "取消" : "Cancel"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {isZh ? "取消" : "Cancel"}
          </Button>
          <Button color="primary" onPress={handleSave}>
            {isZh ? "保存" : "Save"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
