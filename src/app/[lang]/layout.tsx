import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ValidLocale } from "@/i18n.config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Murat Kardeşler Blog",
  description: "Kişisel blog sayfam",
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: ValidLocale }
}) {
  return <>{children}</>
} 