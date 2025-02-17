'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  status: string
  created_at: string
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPosts(data)
      }
    }

    fetchPosts()
  }, [supabase])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Yeni Yazı
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Son Yazılar</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Başlık</th>
                  <th className="text-left py-3 px-4">Durum</th>
                  <th className="text-left py-3 px-4">Tarih</th>
                  <th className="text-left py-3 px-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{post.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(post.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-blue-500 hover:text-blue-700 mr-4"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 