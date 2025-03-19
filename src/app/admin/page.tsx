'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Stats {
  posts: number;
  categories: number;
  contacts: number;
  subscribers: number;
  userCount: number;
}

interface VisitStats {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    categories: 0,
    contacts: 0,
    subscribers: 0,
    userCount: 0
  })
  const [visitStats, setVisitStats] = useState<VisitStats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
    loadData()
    loadStats()
    loadVisitStats()
  }, [])

  const loadData = async () => {
    // Bu fonksiyon şu anda sadece istatistikleri yüklüyor
    // İleride son yazıları göstermek için kullanılabilir
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

    // Contacts count
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })

    // User count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    setStats({
      posts: postsCount || 0,
      categories: categoriesCount || 0,
      contacts: contactsCount || 0,
      subscribers: 0,
      userCount: userCount || 0
    })
  }

  const loadVisitStats = async () => {
    try {
      // Şu anki tarih
      const now = new Date()
      
      // Günlük ziyaretler için tarih (bugün)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      
      // Haftalık ziyaretler için tarih (7 gün öncesi)
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
      
      // Aylık ziyaretler için tarih (30 gün öncesi)
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()

      // Günlük ziyaret sayısı
      const { count: dailyCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)
      
      // Haftalık ziyaret sayısı
      const { count: weeklyCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo)
      
      // Aylık ziyaret sayısı
      const { count: monthlyCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo)
      
      // Toplam ziyaret sayısı
      const { count: totalCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })

      setVisitStats({
        daily: dailyCount || 0,
        weekly: weeklyCount || 0,
        monthly: monthlyCount || 0,
        total: totalCount || 0
      })
    } catch (error) {
      console.error('Ziyaret istatistikleri yüklenirken hata oluştu:', error)
      // Hata durumunda varsayılan değerler
      setVisitStats({
        daily: 0,
        weekly: 0,
        monthly: 0,
        total: 0
      })
    }
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Admin Paneli</h1>
        <p className="text-gray-400 mt-2">Sitenizi bu panel üzerinden yönetin</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Yazılar */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-lg bg-indigo-500/10">
              <i className="ri-article-line text-2xl text-indigo-400"></i>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
              {stats.posts} yazı
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Yazılar</h3>
          <p className="text-gray-400 text-sm mb-4">
            Blog yazılarını ekleyin, düzenleyin ve yönetin
          </p>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/posts"
              className="flex items-center flex-1 justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-list-check mr-1.5"></i>
              Yazıları Listele
            </Link>
            <Link
              href="/admin/posts/new"
              className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-add-line"></i>
            </Link>
          </div>
        </div>

        {/* Kategoriler */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-lg bg-green-500/10">
              <i className="ri-price-tag-3-line text-2xl text-green-400"></i>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">
              {stats.categories} kategori
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Kategoriler</h3>
          <p className="text-gray-400 text-sm mb-4">
            Yazılarınız için kategoriler oluşturun ve düzenleyin
          </p>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/categories"
              className="flex items-center flex-1 justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-list-check mr-1.5"></i>
              Kategorileri Listele
            </Link>
            <Link
              href="/admin/categories/new"
              className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-add-line"></i>
            </Link>
          </div>
        </div>

        {/* Üyeler */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <i className="ri-user-line text-2xl text-blue-400"></i>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">
              {stats.userCount} üye
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Üyeler</h3>
          <p className="text-gray-400 text-sm mb-4">
            Siteye kayıtlı üyeleri görüntüleyin ve yönetin
          </p>
          <div className="flex items-center">
            <Link
              href="/admin/users"
              className="flex items-center flex-1 justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-list-check mr-1.5"></i>
              Üyeleri Listele
            </Link>
          </div>
        </div>

        {/* İletişim */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <i className="ri-mail-line text-2xl text-yellow-400"></i>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
              {stats.contacts} mesaj
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">İletişim</h3>
          <p className="text-gray-400 text-sm mb-4">
            Size gönderilen mesajları görüntüleyin
          </p>
          <div className="flex items-center">
            <Link
              href="/admin/contacts"
              className="flex items-center flex-1 justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-mail-open-line mr-1.5"></i>
              Mesajları Görüntüle
            </Link>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <i className="ri-settings-3-line text-2xl text-purple-400"></i>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ayarlar</h3>
          <p className="text-gray-400 text-sm mb-4">
            Sitenin genel ayarlarını düzenleyin
          </p>
          <div className="flex items-center">
            <Link
              href="/admin/settings"
              className="flex items-center flex-1 justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-settings-4-line mr-1.5"></i>
              Ayarları Düzenle
            </Link>
          </div>
        </div>

        {/* Hakkımda */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-lg bg-red-500/10">
              <i className="ri-information-line text-2xl text-red-400"></i>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Hakkımda</h3>
          <p className="text-gray-400 text-sm mb-4">
            Hakkında sayfasında görüntülenecek bilgileri düzenleyin
          </p>
          <div className="flex items-center">
            <Link
              href="/admin/about"
              className="flex items-center flex-1 justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <i className="ri-edit-line mr-1.5"></i>
              İçeriği Düzenle
            </Link>
          </div>
        </div>
      </div>

      {/* Ziyaret İstatistikleri */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Ziyaret İstatistikleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-white">{visitStats.daily}</p>
                <h2 className="text-lg text-indigo-100">Bugün</h2>
              </div>
              <i className="ri-calendar-check-line text-3xl text-indigo-200"></i>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-white">{visitStats.weekly}</p>
                <h2 className="text-lg text-cyan-100">Bu Hafta</h2>
              </div>
              <i className="ri-calendar-event-line text-3xl text-cyan-200"></i>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-white">{visitStats.monthly}</p>
                <h2 className="text-lg text-amber-100">Bu Ay</h2>
              </div>
              <i className="ri-calendar-line text-3xl text-amber-200"></i>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-white">{visitStats.total}</p>
                <h2 className="text-lg text-emerald-100">Toplam</h2>
              </div>
              <i className="ri-line-chart-line text-3xl text-emerald-200"></i>
            </div>
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
            href="/admin/about"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-colors group"
          >
            <i className="ri-user-6-line text-2xl text-primary group-hover:text-white mr-3"></i>
            <span className="text-gray-300 group-hover:text-white">Hakkımda</span>
          </Link>

          <Link
            href="/admin/contacts"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-colors group"
          >
            <i className="ri-mail-line text-2xl text-primary group-hover:text-white mr-3"></i>
            <span className="text-gray-300 group-hover:text-white">Gelen Mesajlar</span>
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