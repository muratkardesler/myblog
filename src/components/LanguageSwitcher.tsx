'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { locales } from '@/i18n.config'

export default function LanguageSwitcher() {
  const pathName = usePathname()

  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div className="flex gap-2">
      {locales.map(locale => {
        return (
          <Link
            key={locale}
            href={redirectedPathName(locale)}
            className={`px-3 py-1 rounded ${
              pathName?.split('/')[1] === locale
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {locale.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
} 