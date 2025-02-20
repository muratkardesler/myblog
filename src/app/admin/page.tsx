'use client'

import { useState, useEffect } from 'react'
import { Post, Category } from '@/lib/types'
import { getLatestPosts, getCategories } from '@/lib/supabase'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Stats {
  posts: number;
  categories: number;
  comments: number;
  subscribers: number;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    categories: 0,
    comments: 0,
    subscribers: 0
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
    loadData()
    loadStats()
  }, [])

  const loadData = async () => {
    const [postsData, categoriesData] = await Promise.all([
      getLatestPosts(5),
      getCategories()
    ])
    setPosts(postsData)
    setCategories(categoriesData)
  }

  const loadStats = async () => {
    // Posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })

    // Categories count
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    setStats({
      posts: postsCount || 0,
      categories: categoriesCount || 0,
      comments: 0,
      subscribers: 0
    })
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Admin Paneli</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/posts" className="bg-purple-500 rounded-xl p-6 hover:bg-purple-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{stats.posts}</p>
              <h2 className="text-lg text-purple-100">Yazılar</h2>
            </div>
            <i className="ri-article-line text-3xl text-purple-200"></i>
          </div>
        </Link>

        <Link href="/admin/categories" className="bg-blue-500 rounded-xl p-6 hover:bg-blue-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{stats.categories}</p>
              <h2 className="text-lg text-blue-100">Kategoriler</h2>
            </div>
            <i className="ri-price-tag-3-line text-3xl text-blue-200"></i>
          </div>
        </Link>

        <div className="bg-green-500 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{stats.comments}</p>
              <h2 className="text-lg text-green-100">Yorumlar</h2>
            </div>
            <i className="ri-chat-3-line text-3xl text-green-200"></i>
          </div>
        </div>

        <div className="bg-red-500 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{stats.subscribers}</p>
              <h2 className="text-lg text-red-100">Aboneler</h2>
            </div>
            <i className="ri-user-follow-line text-3xl text-red-200"></i>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/posts/new"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-colors group"
          >
            <i className="ri-add-line text-2xl text-primary group-hover:text-white mr-3"></i>
            <span className="text-gray-300 group-hover:text-white">Yeni Yazı</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-colors group"
          >
            <i className="ri-price-tag-3-line text-2xl text-primary group-hover:text-white mr-3"></i>
            <span className="text-gray-300 group-hover:text-white">Kategoriler</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-colors group"
          >
            <i className="ri-settings-3-line text-2xl text-primary group-hover:text-white mr-3"></i>
            <span className="text-gray-300 group-hover:text-white">Ayarlar</span>
          </Link>

          <Link
            href="/blog"
            target="_blank"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-colors group"
          >
            <i className="ri-external-link-line text-2xl text-primary group-hover:text-white mr-3"></i>
            <span className="text-gray-300 group-hover:text-white">Siteyi Görüntüle</span>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Son Yazılar</h2>
          <Link href="/admin/posts" className="text-primary hover:text-purple-400 transition-colors">
            Tümünü Gör
          </Link>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="p-6">
            {stats.posts === 0 ? (
              <div className="text-center py-8">
                <i className="ri-article-line text-4xl text-gray-500 mb-3"></i>
                <p className="text-gray-400">Henüz yazı eklenmemiş</p>
                <Link
                  href="/admin/posts/new"
                  className="inline-flex items-center mt-4 text-primary hover:text-purple-400 transition-colors"
                >
                  <i className="ri-add-line mr-2"></i>
                  İlk yazını ekle
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
} 