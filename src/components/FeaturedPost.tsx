'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/lib/types';
import { getFeaturedPost } from '@/lib/supabase';
import { calculateReadingTime } from '@/lib/utils';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Settings {
  admin_name: string;
  admin_title: string;
  admin_image: string;
}

export default function FeaturedPost() {
  const [post, setPost] = useState<Post | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    const [featuredPost, { data: settingsData }] = await Promise.all([
      getFeaturedPost(),
      supabase.from('settings').select('*').single()
    ]);

    setPost(featuredPost);
    setSettings(settingsData);
  };

  if (!mounted || !post) return null;

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-8">
        <div className="flex flex-col justify-center">
          {post.category && (
            <Link 
              href={`/category/${post.category.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-200 mb-4 w-fit hover:bg-purple-800 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="text-4xl font-bold text-gray-100 mb-4">{post.title}</h1>
          <p className="text-gray-400 mb-6">
            {post.content.substring(0, 150)}...
          </p>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              {settings?.admin_image ? (
                <Image
                  src={settings.admin_image}
                  alt={settings.admin_name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <i className="ri-user-line text-gray-400"></i>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-100">{settings?.admin_name || 'Admin'}</h3>
              <div className="text-sm text-gray-500">
                {calculateReadingTime(post.content)}
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link 
              href={`/blog/${post.slug}`}
              className="!rounded-button bg-primary text-white px-6 py-2 hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              Devamını Oku
            </Link>
            <button className="!rounded-button border border-gray-200 px-6 py-2 hover:bg-gray-50 transition-colors whitespace-nowrap flex items-center">
              <i className="ri-share-line mr-2"></i>
              Paylaş
            </button>
          </div>
        </div>
        <div className="relative h-[400px]">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
} 