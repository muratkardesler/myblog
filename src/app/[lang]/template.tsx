import { ValidLocale } from "@/i18n.config"

export default async function LangTemplate({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: ValidLocale }
}) {
  return children
} 