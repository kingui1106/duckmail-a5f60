"use client"

import { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Select, SelectItem } from "@heroui/select"
import { Spinner } from "@heroui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { fetchDomains } from "@/lib/api"
import type { Domain } from "@/types"
import { Eye, EyeOff, User, RefreshCw, AlertCircle } from "lucide-react"
import { Card, CardBody } from "@heroui/card"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  currentLocale: string
}

export default function AccountModal({ isOpen, onClose, currentLocale }: AccountModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const { register, login } = useAuth()

  const getDomains = async () => {
    setIsLoadingDomains(true)
    setError(null)
    try {
      const domainsData = await fetchDomains()
      if (Array.isArray(domainsData) && domainsData.length > 0) {
        setDomains(domainsData)
        if (!selectedDomain && domainsData.length > 0) {
          setSelectedDomain(domainsData[0].domain)
        }
      } else {
        setError(currentLocale === "en" ? "Unable to get available domains, please try again later" : "无法获取可用域名，请稍后再试")
        setDomains([])
      }
    } catch (error) {
      console.error("Failed to fetch domains:", error)
      setError(currentLocale === "en" ? "Failed to get domains, please check network connection" : "获取域名失败，请检查网络连接")
      setDomains([])
    } finally {
      setIsLoadingDomains(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      getDomains()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!username || !selectedDomain || !password) {
      setError(currentLocale === "en" ? "Please fill in all required fields" : "请填写所有必填字段")
      return
    }

    setIsLoading(true)
    setError(null)

    const email = `${username}@${selectedDomain}`

    try {
      await register(email, password)
      onClose()
      // 重置表单
      setUsername("")
      setPassword("")
      setError(null)
    } catch (error: any) {
      console.error("Registration failed:", error)

      // 如果是账户已存在的错误，尝试登录
      if (error.message && (error.message.includes("already exists") || error.message.includes("422"))) {
        try {
          await login(email, password)
          onClose()
          // 重置表单
          setUsername("")
          setPassword("")
          setError(null)
          return
        } catch (loginError: any) {
          setError(currentLocale === "en" ? "Login failed: password may be incorrect" : "登录失败：密码可能不正确")
        }
      } else {
        setError(error.message || (currentLocale === "en" ? "Failed to create account, please try again later" : "创建账户失败，请稍后再试"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center">
            {currentLocale === "en" ? "Create Account" : "创建账户"}
          </h2>
          <p className="text-sm text-gray-500 text-center">
            {currentLocale === "en"
              ? "Here you can create a new account. You need to choose a username and set a password!"
              : "在这里，你可以创建一个新的账户为止，你需要选择一个用户名，然后填写密码！"
            }
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {currentLocale === "en" ? "Email" : "电子邮件"}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1"
                  isDisabled={isLoading}
                />
                {isLoadingDomains ? (
                  <div className="w-40 flex items-center justify-center border rounded-lg">
                    <Spinner size="sm" />
                  </div>
                ) : domains.length > 0 ? (
                  <Select
                    selectedKeys={selectedDomain ? [selectedDomain] : []}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-40"
                    isDisabled={isLoading}
                  >
                    {domains.map((domain) => (
                      <SelectItem key={domain.domain}>
                        {domain.domain}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div className="w-40 flex items-center gap-2">
                    <Input disabled placeholder={currentLocale === "en" ? "No domains available" : "无可用域名"} className="flex-1" />
                    <Button isIconOnly size="sm" variant="light" onPress={getDomains} isDisabled={isLoadingDomains}>
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                )}
              </div>
              {!username && <p className="text-xs text-red-500 mt-1">{currentLocale === "en" ? "Required" : "必填"}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {currentLocale === "en" ? "Password" : "密码"}
              </label>
              <Input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isDisabled={isLoading}
                endContent={
                  <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none">
                    {isPasswordVisible ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                }
              />
            </div>

            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardBody className="p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      {currentLocale === "en" ? "Important Notice" : "重要提醒"}
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      {currentLocale === "en"
                        ? "duckmail.cv does not provide password recovery. Please remember your password."
                        : "duckmail.cv 不提供密码找回功能，请务必记住您设置的密码。"
                      }
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                {error.includes("网络") && (
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    className="mt-2"
                    onPress={getDomains}
                    startContent={<RefreshCw size={14} />}
                  >
                    {currentLocale === "en" ? "Retry Get Domains" : "重试获取域名"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={onClose} isDisabled={isLoading}>
            {currentLocale === "en" ? "Cancel" : "取消"}
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!username || !selectedDomain || !password || domains.length === 0}
          >
            {currentLocale === "en" ? "Create" : "创建"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
