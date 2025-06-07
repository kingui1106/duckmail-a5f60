export interface Domain {
  id: string
  domain: string
  isActive: boolean
  isPrivate: boolean
}

export interface Account {
  id: string
  address: string
  quota: number
  used: number
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  // 添加本地存储的认证信息
  password?: string // 存储密码用于重新获取token
  token?: string // 存储该账户的token
}

export interface Message {
  id: string
  accountId: string
  msgid: string
  from: {
    name: string
    address: string
  }
  to: {
    name: string
    address: string
  }[]
  subject: string
  intro: string
  seen: boolean
  isDeleted: boolean
  hasAttachments: boolean
  size: number
  downloadUrl: string
  createdAt: string
  updatedAt: string
}

export interface MessageDetail extends Message {
  cc?: string[]
  bcc?: string[]
  text: string
  html: string[]
  attachments?: {
    id: string
    filename: string
    contentType: string
    disposition: string
    transferEncoding: string
    related: boolean
    size: number
    downloadUrl: string
  }[]
}

export interface AuthState {
  token: string | null
  currentAccount: Account | null
  accounts: Account[]
  isAuthenticated: boolean
}
