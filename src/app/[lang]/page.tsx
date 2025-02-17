import { ValidLocale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function Home({
  params: { lang }
}: {
  params: { lang: ValidLocale }
}) {
  const dict = await getDictionary(lang)

  return (
    <main className="min-h-screen p-8">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{dict.navigation.home}</h1>
        <LanguageSwitcher />
      </nav>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{dict.blog.readMore}</h2>
          <p className="text-gray-600">
            Hoş geldiniz! Bu benim kişisel blog sayfam.
          </p>
        </div>
      </div>
    </main>
  )
} 