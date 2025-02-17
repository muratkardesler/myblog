'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function NewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Slug oluştur
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const { error } = await supabase.from('posts').insert({
        title,
        content,
        slug,
        status: 'draft',
      })

      if (error) throw error

      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Yeni Yazı</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-6">
          <label htmlFor="title" className="block mb-2 font-medium">
            Başlık
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block mb-2 font-medium">
            İçerik
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-64 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
} 