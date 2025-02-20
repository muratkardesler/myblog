'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { getLatestPosts } from '@/lib/supabase';
import { calculateReadingTime } from '@/lib/utils';
import Link from 'next/link';

export default function BlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const postsPerPage = 4;

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
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map(post => (
          <article key={post.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img src={post.featured_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
              {post.category && (
                <Link
                  href={`/category/${post.category.slug}`}
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-gray-900/90 text-gray-100 hover:bg-gray-800/90 transition-colors"
                >
                  {post.category.name}
                </Link>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-gray-600 text-sm mb-4">{post.content.substring(0, 100)}...</p>
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
    </>
  );
} 