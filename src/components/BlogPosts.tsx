'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { getLatestPosts } from '@/lib/supabase';
import { calculateReadingTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const postsPerPage = 6;

  useEffect(() => {
    setMounted(true);
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const latestPosts = await getLatestPosts(page * postsPerPage);
    setPosts(latestPosts);
    setLoading(false);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    loadPosts();
  };

  if (!mounted || (loading && posts.length === 0)) {
    return <div className="text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <article key={post.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative h-48">
                <Image 
                  src={post.featured_image} 
                  alt={post.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover" 
                />
                {post.category && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-gray-900/90 text-gray-100">
                    {post.category.name}
                  </div>
                )}
              </div>
            </Link>
            <div className="p-6">
              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold text-gray-100 mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.content}
                </p>
              </Link>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {calculateReadingTime(post.content)}
                </div>
                <div className="flex space-x-3">
                  <button className="like-btn w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-full transition-colors">
                    <i className="ri-heart-line"></i>
                  </button>
                  <button className="bookmark-btn w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-full transition-colors">
                    <i className="ri-bookmark-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="text-primary">Yükleniyor...</div>
        </div>
      ) : posts.length >= page * postsPerPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="!rounded-button bg-gray-800 border border-gray-700 text-gray-300 px-6 py-2 hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            Daha Fazla
          </button>
        </div>
      )}
    </div>
  );
} 