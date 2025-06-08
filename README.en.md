<div align="center">
  <img src="https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png" alt="DuckMail Logo" width="120" height="120">

  # DuckMail - Temporary Email Service

  **Secure, Instant, Fast Temporary Email Service**

  English | [中文](./README.md)

  A modern temporary email service built with Next.js and Mail.tm API, providing secure, fast, and anonymous disposable email functionality.

  **🌐 [Try it now at duckmail.cv](https://duckmail.cv)**
</div>

## ✨ Features

- 🔒 **Secure & Reliable** - Built on Mail.tm's reliable infrastructure
- ⚡ **Instant Access** - Get temporary email addresses instantly
- 🌐 **Multi-language Support** - Supports Chinese and English, automatic browser language detection
- 📱 **Responsive Design** - Perfect for both desktop and mobile devices
- 🎨 **Modern UI** - Beautiful design based on HeroUI components
- 🔄 **Real-time Updates** - Supports Mercure SSE for real-time message notifications
- 🌙 **Dark Mode** - Light and dark theme support
- 📧 **Multi-account Management** - Create and manage multiple temporary email accounts

## 📸 Screenshots

<div align="center">
  <img src="./img/display1.png" alt="DuckMail Main Interface" width="800">
  <p><em>Main Interface - Clean and Modern Design</em></p>

  <img src="./img/display2.png" alt="DuckMail Email Management" width="800">
  <p><em>Email Management - Real-time Email Reception and Management</em></p>
</div>

## 🚀 Quick Start

### One-Click Deploy

Click the button below to deploy to Netlify with one click:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/syferie/duckmail)

> 🎉 **Zero Configuration Deployment** - After clicking the button, Netlify will automatically fork the project to your GitHub account and start deployment, no additional configuration required!

### Local Development

#### Prerequisites

- Node.js 18+
- npm or pnpm

#### Installation

```bash
# Clone the repository
git clone https://github.com/syferie/duckmail.git
cd duckmail

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
# Build for production
npm run build
npm start

# or
pnpm build
pnpm start
```

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15
- **UI Component Library**: HeroUI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Mail.tm REST API
- **Real-time Communication**: Mercure SSE
- **Language**: TypeScript

## 🌐 Deployment Guide

> ⚠️ **Note**: Vercel deployment is not supported as Mail.tm blocks Vercel's IP addresses. Netlify is recommended.

## 📧 API Documentation

This project uses the free API service provided by [Mail.tm](https://mail.tm):

- **Account Management**: Create and login to temporary email accounts
- **Email Reception**: Real-time email receiving and viewing
- **Domain Retrieval**: Get available email domains
- **Real-time Notifications**: Real-time message push via Mercure Hub

### API Limitations

- Rate Limit: 8 QPS
- Email Validity: According to Mail.tm policy
- No password recovery functionality

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mail.tm](https://mail.tm) - For providing free and reliable temporary email API service
- [HeroUI](https://heroui.com) - Modern React UI component library
- [Next.js](https://nextjs.org) - Powerful React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## 📞 Contact

If you have any questions or suggestions, please contact us through:

- Create an [Issue](https://github.com/syferie/duckmail/issues)
- Send email to: syferie@proton.me

---

⭐ If this project helps you, please give it a star!
