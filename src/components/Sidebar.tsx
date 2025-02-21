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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [popularPostsData, categoriesData, { data: settingsData }] = await Promise.all([
          getPopularPosts(),
          getCategories(),
          supabase.from('settings').select('*').single()
        ]);

        setPopularPosts(popularPostsData || []);
        setCategories(categoriesData || []);
        setSettings(settingsData || null);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
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
          <button className="!rounded-button w-full bg-primary text-white px-6 py-2 hover:bg-blue-600 transition-colors whitespace-nowrap">
            Takip Et
          </button>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold text-gray-100 mb-4">Ara</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Yazılarda ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-button focus:outline-none focus:border-primary"
          />
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Kategoriler</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex items-center justify-between group"
              >
                <span className={`${category.color} group-hover:text-primary transition-colors`}>
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {popularPosts.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Popüler Yazılar</h3>
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-center space-x-4 group">
                <div className="relative w-20 h-20 rounded overflow-hidden">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
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
      )}
    </aside>
  );
}

// NoSSR ile export ederek sunucu tarafında render edilmesini engelliyoruz
export default dynamic(() => Promise.resolve(Sidebar), {
  ssr: false
}); 