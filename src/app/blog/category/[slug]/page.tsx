'use client';

import { useEffect, useState } from 'react';
import { PostWithCategory } from '@/lib/types';
import { getPostsByCategory } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (params.slug) {
      loadData();
    }
  }, [params.slug]);

  const loadData = async () => {
    try {
      if (!params.slug) return;
      
      setLoading(true);

      const categoryPosts = await getPostsByCategory(params.slug as string);
      if (Array.isArray(categoryPosts)) {
        setPosts(categoryPosts as PostWithCategory[]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Yükleniyor...</div>;
  }

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            {posts[0]?.category?.name || 'Kategori'}
          </h1>
          <p className="text-gray-400 mt-2">
            Bu kategoride {posts.length} yazı bulunuyor
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {posts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map(post => (
                  <article key={post.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <Link href={`/blog/${post.slug}`} className="block">
                        <h2 className="text-xl font-semibold text-gray-100 hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-gray-400 mt-2 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Bu kategoride henüz yazı bulunmuyor.</p>
            )}
          </div>
          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  );
} 