import { ValidLocale } from "@/i18n.config"

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ lang: ValidLocale }>
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps) {
  const resolvedParams = await params
  const { lang } = resolvedParams

  return (
    <div className="min-h-screen" lang={lang}>
      {children}
    </div>
  )
} 