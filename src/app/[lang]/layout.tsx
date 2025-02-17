import { ValidLocale } from "@/i18n.config"

export default async function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: ValidLocale }
}) {
  return (
    <div className="min-h-screen" lang={lang}>
      {children}
    </div>
  )
} 