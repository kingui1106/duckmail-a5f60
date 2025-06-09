<div align="center">
  <img src="https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png" alt="DuckMail Logo" width="120" height="120">

  # DuckMail - 临时邮件服务

  **安全、即时、快速的临时邮箱服务**

  [English](./README.en.md) | 中文

  一个基于 Next.js 和 Mail.tm API 构建的现代化临时邮件服务，提供安全、快速、匿名的一次性邮箱功能。

  **🌐 [立即使用 duckmail.cv](https://duckmail.cv)**
</div>

## ✨ 特性

- 🔒 **安全可靠** - 使用 Mail.tm 的可靠基础设施
- ⚡ **即时可用** - 立即获得临时邮箱地址
- 🌐 **多语言支持** - 支持中文和英文，自动检测浏览器语言
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **现代化界面** - 基于 HeroUI 的精美设计
- 🔄 **实时更新** - 支持 Mercure SSE 实时消息推送
- 🌙 **深色模式** - 支持明暗主题切换
- 📧 **多账户管理** - 支持创建和管理多个临时邮箱
- 🔧 **多API提供商** - 支持 DuckMail API 和 Mail.tm API 切换
- 🎯 **智能错误处理** - 优雅的错误提示和自动重试机制
- 🔗 **开源透明** - 完全开源，支持社区贡献

## 📸 应用展示

<div align="center">
  <img src="./img/display1.png" alt="DuckMail 主界面" width="800">
  <p><em>主界面 - 简洁现代的设计</em></p>

  <img src="./img/display2.png" alt="DuckMail 邮件管理" width="800">
  <p><em>邮件管理 - 实时接收和管理临时邮件</em></p>
</div>

## 🚀 快速开始

### 一键部署

#### Netlify 部署（推荐）

点击下面的按钮，一键部署到 Netlify：

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/syferie/duckmail)

> 🎉 **零配置部署** - 点击按钮后，Netlify 会自动 fork 项目到你的 GitHub 账户并开始部署，无需任何额外配置！

#### Vercel 部署

点击下面的按钮，一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/syferie/duckmail)

> ⚠️ **注意**：Vercel 部署仅支持 DuckMail API，不支持 Mail.tm API（因为 Mail.tm 屏蔽了 Vercel 的 IP 地址）。部署后请在设置中禁用 Mail.tm 提供商。
>
> 🚀 **零配置**：Vercel 会自动检测 Next.js 项目并使用最佳配置进行部署。

### 本地开发

#### 环境要求

- Node.js 18+
- npm 或 pnpm

#### 安装

```bash
# 克隆项目
git clone https://github.com/syferie/duckmail.git
cd duckmail

# 安装依赖
npm install
# 或
pnpm install
```

### 运行

```bash
# 开发模式
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建

```bash
# 构建生产版本
npm run build
npm start

# 或
pnpm build
pnpm start
```

## 🛠️ 技术栈

- **前端框架**: Next.js 15
- **UI 组件库**: HeroUI
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **API**: Mail.tm REST API / DuckMail API
- **实时通信**: Mercure SSE
- **语言**: TypeScript

## 🌐 部署说明

### 平台兼容性

| 部署平台 | DuckMail API | Mail.tm API | 推荐度 |
|---------|-------------|-------------|--------|
| **Netlify** | ✅ 支持 | ✅ 支持 | ⭐⭐⭐⭐⭐ |
| **Vercel** | ✅ 支持 | ❌ 不支持* | ⭐⭐⭐⭐ |
| **其他平台** | ✅ 支持 | ✅ 支持 | ⭐⭐⭐ |

> *Mail.tm 屏蔽了 Vercel 的 IP 地址，因此 Vercel 部署无法使用 Mail.tm API。

### 部署建议

- **完整功能**：推荐使用 **Netlify**，支持所有 API 提供商
- **快速部署**：可以使用 **Vercel**，但需要在设置中禁用 Mail.tm 提供商

## 📧 API 说明

本项目使用 [Mail.tm](https://mail.tm) 提供的免费 API 服务：

- **账户管理**: 创建、登录临时邮箱账户
- **邮件接收**: 实时接收和查看邮件
- **域名获取**: 获取可用的邮箱域名
- **实时通知**: 通过 Mercure Hub 获取实时消息推送

### API 限制

- 请求频率限制: 8 QPS
- 邮箱有效期: 根据 Mail.tm 政策
- 无密码找回功能

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Mail.tm](https://mail.tm) - 提供免费可靠的临时邮件 API 服务
- [HeroUI](https://heroui.com) - 现代化的 React UI 组件库
- [Next.js](https://nextjs.org) - 强大的 React 框架
- [Tailwind CSS](https://tailwindcss.com) - 实用优先的 CSS 框架

## 📞 联系

如有问题或建议，请通过以下方式联系：

- 创建 [Issue](https://github.com/syferie/duckmail/issues)
- 发送邮件到: syferie@proton.me

## 💖 赞助支持

如果这个项目对你有帮助，欢迎赞助支持开发者继续维护和改进项目：

[![爱发电](https://img.shields.io/badge/%E7%88%B1%E5%8F%91%E7%94%B5-syferie-946ce6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)](https://afdian.com/a/syferie)

你的支持是项目持续发展的动力！🚀

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
