'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/lib/types';
import { getFeaturedPost } from '@/lib/supabase';
import { calculateReadingTime, formatDate } from '@/lib/utils';
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
    <>
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          <div className="flex flex-col justify-center">
            {post.category && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-200 mb-4 w-fit">
                {post.category.name}
              </div>
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
              <div 
                onClick={() => setSelectedPost(post)}
                className="!rounded-button bg-primary text-white px-6 py-2 hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                Devamını Oku
              </div>
              <div className="!rounded-button border border-gray-600 px-6 py-2 hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center text-gray-300 cursor-pointer">
                <i className="ri-share-line mr-2"></i>
                Paylaş
              </div>
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

      {/* Blog Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in" 
            onClick={() => setSelectedPost(null)}
          ></div>
          <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24">
            <div className="relative w-full max-w-4xl bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 animate-slide-up">
              {/* Modal Header */}
              <div className="relative h-72 sm:h-96">
                <Image
                  src={selectedPost.featured_image || '/images/placeholder.jpg'}
                  alt={selectedPost.title}
                  fill
                  className="object-cover rounded-t-2xl"
                  sizes="(max-width: 1536px) 100vw, 1536px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900/90 text-white hover:bg-gray-800 transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
                {selectedPost.category && (
                  <div className="absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-600/90 text-white backdrop-blur-sm">
                    {selectedPost.category.name}
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{selectedPost.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-8">
                  <span className="flex items-center">
                    <i className="ri-calendar-line mr-2"></i>
                    {formatDate(selectedPost.created_at)}
                  </span>
                  <span className="flex items-center">
                    <i className="ri-time-line mr-2"></i>
                    {calculateReadingTime(selectedPost.content)}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-sm p-4 sm:p-6 flex justify-between items-center rounded-b-2xl">
                <div className="flex space-x-2 sm:space-x-3">
                  <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer">
                    <i className="ri-heart-line"></i>
                    <span className="hidden sm:inline">Beğen</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer">
                    <i className="ri-bookmark-line"></i>
                    <span className="hidden sm:inline">Kaydet</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer">
                  <i className="ri-share-line"></i>
                  <span className="hidden sm:inline">Paylaş</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 