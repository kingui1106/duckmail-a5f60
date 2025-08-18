# Temp Mail前端API Key对接指南

## 🎯 概述

API Key是可选的认证方式，用于Temp Mail前端：
1. **获取更多域名选择**：显示公共域名 + 用户私有域名
2. **创建邮箱时验证权限**：确保用户有权限在私有域名下创建邮箱

**注意**：Temp Mail前端不负责域名管理，只处理邮箱相关操作。

## 🔑 API Key使用方式

### **Header格式**
```javascript
// 方式1：Bearer格式（推荐）
headers: {
    'Authorization': 'Bearer dk_your_api_key_here'
}

// 方式2：直接格式
headers: {
    'Authorization': 'dk_your_api_key_here'
}
```

### **可选性说明**
- ✅ **不传API Key**：只能看到公共域名，只能在公共域名下创建邮箱
- ✅ **传入API Key**：可以看到用户私有域名，可以在私有域名下创建邮箱

## 📡 Temp Mail前端需要的API接口

### **1. 获取域名列表（可选API Key）**

#### **接口描述**
```
GET /domains
```

#### **请求示例**
```javascript
// 不传API Key - 只返回公共域名
const publicDomains = await fetch('https://api.duckmail.sbs/domains');

// 传入API Key - 返回公共域名 + 用户私有域名
const allDomains = await fetch('https://api.duckmail.sbs/domains', {
    headers: {
        'Authorization': 'Bearer dk_your_api_key_here'
    }
});
```

#### **响应格式**
```json
[
    {
        "id": "domain_id",
        "domainName": "duckmail.sbs",
        "isPublic": true,
        "isVerified": true
    },
    {
        "id": "domain_id_2",
        "domainName": "mydomain.com",
        "isPublic": false,
        "isVerified": true
    }
]
```

### **2. 创建邮箱账户（可选API Key）**

#### **接口描述**
```
POST /accounts
```

#### **请求示例**
```javascript
// 不传API Key - 只能在公共域名创建
const createPublicEmail = await fetch('https://api.duckmail.sbs/accounts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        address: 'user@duckmail.sbs',  // 公共域名
        password: 'password123'
    })
});

// 传入API Key - 可以在私有域名创建
const createPrivateEmail = await fetch('https://api.duckmail.sbs/accounts', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer dk_your_api_key_here',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        address: 'user@mydomain.com',  // 私有域名
        password: 'password123'
    })
});
```

#### **响应格式**
```json
{
    "account": {
        "id": "account_id",
        "address": "user@mydomain.com",
        "quota": 1000,
        "used": 0,
        "isDisabled": false,
        "createdAt": "2025-08-17T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## � 邮件管理接口（使用邮箱Token，不需要API Key）

### **1. 邮箱登录**

#### **接口描述**
```
POST /token
```

#### **请求示例**
```javascript
const emailLogin = await fetch('https://api.duckmail.sbs/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        address: 'user@example.com',
        password: 'password123'
    })
});
```

#### **响应格式**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "account": {
        "id": "account_id",
        "address": "user@example.com",
        "quota": 1000,
        "used": 5
    }
}
```

### **2. 获取邮件列表**

#### **接口描述**
```
GET /messages
GET /messages?page=1&limit=20
```

#### **请求示例**
```javascript
const messages = await fetch('https://api.duckmail.sbs/messages', {
    headers: {
        'Authorization': `Bearer ${emailToken}`  // 邮箱Token，不是API Key
    }
});
```

#### **响应格式**
```json
{
    "hydra:member": [
        {
            "id": "message_id",
            "subject": "邮件主题",
            "from": {
                "name": "发件人姓名",
                "address": "sender@example.com"
            },
            "to": [
                {
                    "address": "recipient@example.com"
                }
            ],
            "text": "邮件文本内容",
            "rawHtml": "<div>邮件HTML内容</div>",
            "seen": false,
            "hasAttachments": false,
            "createdAt": "2025-08-17T12:00:00Z",
            "size": 2048
        }
    ],
    "hydra:totalItems": 1
}
```

### **3. 获取邮件详情**

#### **接口描述**
```
GET /messages/{messageId}
```

#### **请求示例**
```javascript
const messageDetail = await fetch(`https://api.duckmail.sbs/messages/${messageId}`, {
    headers: {
        'Authorization': `Bearer ${emailToken}`
    }
});
```

#### **响应格式**
```json
{
    "id": "message_id",
    "subject": "邮件主题",
    "from": {
        "name": "发件人姓名",
        "address": "sender@example.com"
    },
    "to": [
        {
            "address": "recipient@example.com"
        }
    ],
    "text": "完整的邮件文本内容",
    "rawHtml": "<html><body>完整的邮件HTML内容</body></html>",
    "seen": false,
    "hasAttachments": false,
    "createdAt": "2025-08-17T12:00:00Z",
    "size": 2048,
    "headers": {
        "message-id": "<message-id@example.com>",
        "date": "2025-08-17T12:00:00Z"
    }
}
```

### **4. 标记邮件为已读**

#### **接口描述**
```
PATCH /messages/{messageId}
```

#### **请求示例**
```javascript
const markAsRead = await fetch(`https://api.duckmail.sbs/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${emailToken}`
    }
});
```

### **5. 删除邮件**

#### **接口描述**
```
DELETE /messages/{messageId}
```

#### **请求示例**
```javascript
const deleteMessage = await fetch(`https://api.duckmail.sbs/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${emailToken}`
    }
});
```

### **6. 获取邮箱账户信息**

#### **接口描述**
```
GET /me
```

#### **请求示例**
```javascript
const accountInfo = await fetch('https://api.duckmail.sbs/me', {
    headers: {
        'Authorization': `Bearer ${emailToken}`
    }
});
```

#### **响应格式**
```json
{
    "id": "account_id",
    "address": "user@example.com",
    "quota": 1000,
    "used": 5,
    "isDisabled": false,
    "createdAt": "2025-08-17T12:00:00Z",
    "updatedAt": "2025-08-17T12:30:00Z"
}
```

## � API Key使用总结

### **Temp Mail前端需要的接口**

| 接口 | API Key | 用途 | 说明 |
|------|---------|------|------|
| `GET /domains` | 可选 | 获取域名列表 | 无API Key只返回公共域名，有API Key返回公共+私有域名 |
| `POST /accounts` | 可选 | 创建邮箱账户 | API Key用于验证私有域名权限 |
| `POST /token` | 不需要 | 邮箱登录 | 使用邮箱地址和密码登录 |
| `GET /messages` | 不需要 | 获取邮件列表 | 使用邮箱Token认证 |
| `GET /messages/{id}` | 不需要 | 获取邮件详情 | 使用邮箱Token认证 |
| `PATCH /messages/{id}` | 不需要 | 标记邮件已读 | 使用邮箱Token认证 |
| `DELETE /messages/{id}` | 不需要 | 删除邮件 | 使用邮箱Token认证 |
| `GET /me` | 不需要 | 获取账户信息 | 使用邮箱Token认证 |

### **API Key效果对比**

| 功能 | 无API Key | 有API Key |
|------|-----------|-----------|
| 域名选择 | 仅公共域名 | 公共域名 + 私有域名 |
| 邮箱创建 | 仅公共域名 | 公共域名 + 私有域名 |
| 邮件管理 | ✅ 完整功能 | ✅ 完整功能 |

### **集成建议**

1. **可选配置**：API Key作为可选配置项，不强制用户提供
2. **渐进增强**：无API Key时提供基础功能，有API Key时提供更多域名选择
3. **用户体验**：清晰说明API Key的作用和好处
4. **错误处理**：当用户尝试使用私有域名但没有API Key时，给出友好提示

### **简单集成示例**

```javascript
// 基础Temp Mail类
class TempMail {
    constructor(apiKey = null) {
        this.baseURL = 'https://api.duckmail.sbs';
        this.apiKey = apiKey;
        this.emailToken = null;
    }

    // 获取域名列表
    async getDomains() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${this.baseURL}/domains`, { headers });
        return response.json();
    }

    // 创建邮箱
    async createEmail(address, password) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${this.baseURL}/accounts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ address, password })
        });
        return response.json();
    }

    // 邮箱登录
    async loginEmail(address, password) {
        const response = await fetch(`${this.baseURL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const data = await response.json();
        this.emailToken = data.token;
        return data;
    }

    // 获取邮件列表
    async getMessages() {
        const response = await fetch(`${this.baseURL}/messages`, {
            headers: { 'Authorization': `Bearer ${this.emailToken}` }
        });
        return response.json();
    }
}

// 使用示例
const tempMail = new TempMail(); // 或传入API Key: new TempMail('dk_xxx')
const domains = await tempMail.getDomains();
const result = await tempMail.createEmail('user@domain.com', 'password');
await tempMail.loginEmail('user@domain.com', 'password');
const messages = await tempMail.getMessages();
```

这样您就可以在Temp Mail前端轻松对接API Key功能了！🎯🔑
