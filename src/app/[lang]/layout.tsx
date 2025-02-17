import { ValidLocale } from "@/i18n.config"

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: ValidLocale }
}) {
  const { lang } = params

  return (
    <div className="min-h-screen" lang={lang}>
      {children}
    </div>
  )
} 