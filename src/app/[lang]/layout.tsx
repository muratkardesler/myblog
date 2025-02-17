import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ValidLocale } from "@/i18n.config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Murat Kardeşler Blog",
  description: "Kişisel blog sayfam",
}

type LangLayoutProps = {
  children: React.ReactNode
  params: {
    lang: ValidLocale
  }
}

export default function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  return (
    <html lang={params.lang}>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 