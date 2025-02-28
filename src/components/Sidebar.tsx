'use client';

import { useEffect, useState } from 'react';
import { Post, Category } from '@/lib/types';
import { getPopularPosts, getCategories } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import dynamic from 'next/dynamic';

interface Settings {
  admin_name: string;
  admin_title: string;
  admin_description: string;
  admin_image: string;
}

function Sidebar() {
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Kategorileri ve ayarları yükle
        const [categoriesData, { data: settingsData }] = await Promise.all([
          getCategories(),
          supabase.from('settings').select('*').single()
        ]);

        // Popüler yazıları ayrı yükle
        try {
          const popularPostsData = await getPopularPosts();
          setPopularPosts(popularPostsData || []);
        } catch (err) {
          console.error('Error loading popular posts:', err);
          setError('Popüler yazılar yüklenirken bir hata oluştu.');
          setPopularPosts([]);
        }

        setCategories(categoriesData || []);
        setSettings(settingsData || null);
      } catch (err) {
        console.error('Error loading sidebar data:', err);
        setError('Yan panel verileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <aside className="space-y-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 animate-pulse">
          <div className="h-40 bg-gray-700 rounded-xl"></div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
          <div className="h-20 bg-gray-700 rounded-xl"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-8">
      {settings && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              {settings.admin_image ? (
                <Image
                  src={settings.admin_image}
                  alt={settings.admin_name || 'Admin'}
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">{settings.admin_name || 'Admin'}</h3>
              <p className="text-sm text-gray-400">{settings.admin_title || 'Blog Yazarı'}</p>
            </div>
          </div>
          <p className="text-gray-400 mb-4">
            {settings.admin_description || 'Teknoloji ve yazılım dünyasındaki deneyimlerimi paylaşıyorum.'}
          </p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Kategoriler</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg p-3 text-center group"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center ${category.color.replace('text-', 'bg-').replace('00', '700')}`}>
                    <i className={`ri-folder-line text-white`}></i>
                  </div>
                  <span className="text-gray-100 group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Popüler Yazılar</h3>
          <div className="p-4 bg-red-900/20 rounded-lg text-red-300 text-sm">
            <p>{error}</p>
          </div>
        </div>
      ) : popularPosts.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Popüler Yazılar</h3>
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-center space-x-4 group">
                <div className="relative w-20 h-20 rounded overflow-hidden">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      priority
                      onError={(e) => {
                        // Resim yüklenemezse varsayılan bir resim göster
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Sonsuz döngüyü önle
                        // Varsayılan resim olarak placeholder kullan
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzRjNGNDYiLz48cGF0aCBkPSJNNzYgMTI0LjVINzZDNzMuNzkwOSAxMjQuNSA3MiAxMjYuMjkxIDcyIDEyOC41VjEyOC41QzcyIDEzMC43MDkgNzMuNzkwOSAxMzIuNSA3NiAxMzIuNUgxMjRDMTI2LjIwOSAxMzIuNSAxMjggMTMwLjcwOSAxMjggMTI4LjVWMTI4LjVDMTI4IDEyNi4yOTEgMTI2LjIwOSAxMjQuNSAxMjQgMTI0LjVINzZaIiBmaWxsPSIjOTM5Mzk5Ii8+PHBhdGggZD0iTTEwMCA2Ny41QzgxLjg1NTcgNjcuNSA2Ny41IDgxLjg1NTcgNjcuNSAxMDBDNjcuNSAxMTguMTQ0IDgxLjg1NTcgMTMyLjUgMTAwIDEzMi41QzExOC4xNDQgMTMyLjUgMTMyLjUgMTE4LjE0NCAxMzIuNSAxMDBDMTMyLjUgODEuODU1NyAxMTguMTQ0IDY3LjUgMTAwIDY3LjVaTTEwMCAxMjQuNUM4Ni4xOTI5IDEyNC41IDc1LjUgMTEzLjgwNyA3NS41IDEwMEM3NS41IDg2LjE5MjkgODYuMTkyOSA3NS41IDEwMCA3NS41QzExMy44MDcgNzUuNSAxMjQuNSA4Ni4xOTI5IDEyNC41IDEwMEMxMjQuNSAxMTMuODA3IDExMy44MDcgMTI0LjUgMTAwIDEyNC41WiIgZmlsbD0iIzkzOTM5OSIvPjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <i className="ri-image-line text-2xl text-gray-500"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-100 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

// NoSSR ile export ederek sunucu tarafında render edilmesini engelliyoruz
export default dynamic(() => Promise.resolve(Sidebar), {
  ssr: false
}); 