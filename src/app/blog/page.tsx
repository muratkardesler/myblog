'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Post, Category } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Kategorileri yükle
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Yazıları yükle
      let query = supabase
        .from('posts')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Eğer kategori seçiliyse filtrele
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2">Blog</h1>
              <p className="text-gray-400">Teknoloji ve yazılım hakkında yazılar</p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center space-x-2 text-gray-400">
                <i className="ri-loader-4-line animate-spin text-2xl"></i>
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={post.featured_image || '/images/placeholder.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    {post.category && (
                      <Link
                        href={`/blog/category/${post.category.slug}`}
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${post.category.color.replace('text', 'bg')}`}
                      >
                        {post.category.name}
                      </Link>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-100 mb-2 hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">{post.content.substring(0, 150)}...</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span>{formatDate(post.created_at)}</span>
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
            <div className="text-center py-12">
              <i className="ri-article-line text-4xl text-gray-500 mb-3"></i>
              <p className="text-gray-400">
                {selectedCategory ? 'Bu kategoride henüz yazı bulunmuyor.' : 'Henüz yazı bulunmuyor.'}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 