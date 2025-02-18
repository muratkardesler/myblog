'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import RichTextEditor from '@/components/RichTextEditor'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string | null
  status: string
  locale: string
}

interface PageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: PageProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Post bulunamadı')

        setPost(data)
      } catch (error) {
        if (error instanceof Error) {
          setError('Blog yazısı yüklenirken bir hata oluştu: ' + error.message)
        } else {
          setError('Blog yazısı yüklenirken bir hata oluştu')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !post) return

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

      setPost({ ...post, featured_image: publicUrl })
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
    if (!post) return

    setLoading(true)
    setError(null)

    if (!post.title || !post.content) {
      setError('Başlık ve içerik alanları zorunludur.')
      setLoading(false)
      return
    }

    try {
      const now = new Date().toISOString()

      const { error: submitError } = await supabase
        .from('posts')
        .update({
          title: post.title,
          content: post.content,
          featured_image: post.featured_image,
          status: post.status,
          locale: post.locale,
          updated_at: now,
          published_at: post.status === 'published' ? now : null
        })
        .eq('id', post.id)

      if (submitError) throw submitError

      router.push('/admin/dashboard')
    } catch (error) {
      if (error instanceof Error) {
        setError('Blog yazısı güncellenirken bir hata oluştu: ' + error.message)
      } else {
        setError('Blog yazısı güncellenirken bir hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          Blog yazısı bulunamadı.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Blog Yazısını Düzenle</h1>

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
              onChange={(e) => setPost({ ...post, title: e.target.value })}
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
              onChange={(content) => setPost({ ...post, content })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value })}
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