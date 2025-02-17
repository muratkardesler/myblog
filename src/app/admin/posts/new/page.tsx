'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import RichTextEditor from '@/components/RichTextEditor'

interface BlogPost {
  title: string
  slug: string
  content: string
  featured_image: string | null
  status: string
  locale: string
}

export default function NewPostPage() {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    featured_image: null,
    status: 'draft',
    locale: 'tr'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin')
      }
    }

    checkUser()
  }, [router, supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      setLoading(true)
      setError(null)

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `blog-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setPost(prev => ({ ...prev, featured_image: publicUrl }))
    } catch (error) {
      if (error instanceof Error) {
        setError('Resim yüklenirken bir hata oluştu: ' + error.message)
      } else {
        setError('Resim yüklenirken bir hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!post.title || !post.content) {
      setError('Başlık ve içerik alanları zorunludur.')
      setLoading(false)
      return
    }

    try {
      const slug = post.title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const now = new Date().toISOString()

      const postData = {
        title: post.title,
        slug,
        content: post.content,
        featured_image: post.featured_image,
        status: post.status,
        locale: post.locale,
        created_at: now,
        updated_at: now,
        published_at: post.status === 'published' ? now : null
      }

      console.log('Saving post:', postData)

      const { error: submitError } = await supabase
        .from('posts')
        .insert([postData])

      if (submitError) {
        console.error('Submit error:', submitError)
        throw new Error(submitError.message)
      }

      router.push('/admin/dashboard')
    } catch (error) {
      if (error instanceof Error) {
        setError('Blog yazısı kaydedilirken bir hata oluştu: ' + error.message)
      } else {
        setError('Blog yazısı kaydedilirken bir hata oluştu')
      }
      console.error('Error saving post:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Yeni Blog Yazısı</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık
            </label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öne Çıkan Görsel
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full"
            />
            {post.featured_image && (
              <div className="relative mt-2 h-40 w-full">
                <Image
                  src={post.featured_image}
                  alt="Öne çıkan görsel"
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik
            </label>
            <RichTextEditor
              content={post.content}
              onChange={(content) => setPost(prev => ({ ...prev, content }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={post.status}
              onChange={(e) => setPost(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Taslak</option>
              <option value="published">Yayınla</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 