'use client';

import { useEffect, useState } from 'react';
import { PostWithCategory } from '@/lib/types';
import { getPostsByCategory } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';

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

      // Kategoriyi yükle
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (categoryError) {
        console.error('Kategori yükleme hatası:', categoryError);
        setLoading(false);
        return;
      }

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
            {posts[0]?.category.name || 'Kategori'}
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
                      <img src={post.featured_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-gray-900/90 text-gray-100">
                        {post.category.name}
                      </span>
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                        <a href={`/blog/${post.slug}`}>{post.title}</a>
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">{post.content.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span>{new Date(post.published_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                          <span className="mx-2">•</span>
                          <span>8 dk okuma</span>
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
            ) : (
              <div className="text-center text-gray-400">
                Bu kategoride henüz yazı bulunmuyor.
              </div>
            )}
          </div>
          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  );
} 