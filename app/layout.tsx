import type React from "react" // Keep this if you use React types explicitly
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers" // Assuming Providers includes ThemeProvider


const inter = Inter({ subsets: ["latin"] })

// Metadata can be dynamic based on locale if you implement full i18n
export const metadata: Metadata = {
  title: "Temp Mail-临时邮件-安全、即时、快速- DuckMail", // Updated title
  description: "Protect your personal email address from spam, bots, phishing and other online abuse with DuckMail - secure temporary email service.",
  icons: {
    icon: "https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png",
    shortcut: "https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png",
    apple: "https://img.116119.xyz/img/2025/06/08/547d9cd9739b8e15a51e510342af3fb0.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For a real i18n solution, locale would come from Next.js routing or a context
  // For this simple toggle, we'll manage it in page.tsx and pass it down
  return (
    // The lang attribute will be managed by a client component state for now
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
