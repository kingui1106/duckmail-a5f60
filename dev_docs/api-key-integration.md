# API Key 集成功能

## 概述

本次更新为 DuckMail 应用添加了 API Key 支持功能，允许用户可选地提供 API Key 来获得更多域名选择和私有域名创建权限。

## 功能特性

### 1. API Key 管理
- 在设置界面中添加了 API Key 输入模块
- 支持本地存储持久化
- 可选配置，不强制用户提供

### 2. 增强的域名获取
- 无 API Key：只返回公共域名
- 有 API Key：返回公共域名 + 用户私有域名

### 3. 邮箱创建权限
- 无 API Key：只能在公共域名下创建邮箱
- 有 API Key：可以在公共域名和私有域名下创建邮箱

## 技术实现

### 1. 上下文管理 (ApiProviderContext)
- 添加了 `apiKey` 状态管理
- 添加了 `setApiKey` 函数
- 支持从 localStorage 加载和保存

### 2. 设置界面 (SettingsPanel)
- 新增 API Key 输入区域
- 密码类型输入框保护隐私
- 实时同步和保存功能

### 3. API 请求头处理 (lib/api.ts)
- 更新 `createHeaders` 函数支持 API Key
- 自动添加 Authorization 头
- 支持 Bearer 格式和直接格式

### 4. 受影响的接口
- `GET /domains` - 获取域名列表
- `POST /accounts` - 创建邮箱账户

## 用户体验

1. **渐进增强**：无 API Key 时提供基础功能，有 API Key 时提供更多选择
2. **可选配置**：不强制用户提供 API Key
3. **友好提示**：清晰说明 API Key 的作用和好处
4. **安全存储**：使用密码类型输入框和本地存储

## 错误处理

- API Key 格式自动处理（支持 Bearer 前缀和直接格式）
- 空值检查避免发送无效请求头
- 保持向后兼容性，不影响现有功能

## 域名过滤逻辑

### DuckMail 提供商
对于 DuckMail 提供商，会进行域名过滤，只有满足以下条件的域名才会显示：
1. `isVerified: true` - 必须已验证
2. `isActive: true` - 必须处于活跃状态

#### 域名类型
- **公共域名** (`isPublic: true`): 所有用户都可以使用
- **私有域名** (`isPublic: false`): 只有域名所有者可以使用（需要API Key）

#### 字段标准化
- `domain`: 从 `domainName` 字段映射
- `isPrivate`: 从 `!isPublic` 计算得出

### 其他提供商 (Mail.tm 等)
对于其他提供商，不进行域名过滤，直接使用 API 返回的所有域名，保持原有字段结构。

## 后续优化建议

1. 可以考虑添加 API Key 有效性验证
2. 可以添加更详细的错误提示信息
3. 可以考虑添加 API Key 使用统计信息
4. 可以添加域名验证状态的实时更新
