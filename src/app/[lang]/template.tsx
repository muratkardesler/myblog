import { ValidLocale } from "@/i18n.config"

export default function LangTemplate({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: ValidLocale }
}) {
  return (
    <div lang={params.lang}>
      {children}
    </div>
  )
} 