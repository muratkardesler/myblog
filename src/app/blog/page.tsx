'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Post, Category } from '@/lib/types';
import { getCategoriesWithPostCount } from '@/lib/supabase';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLatestPosts, getPostsByCategory } from '@/lib/supabase';
import Link from 'next/link';
import BlogPosts from '@/components/BlogPosts';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<(Category & { post_count: number })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  useEffect(() => {
    if (mounted) {
      loadPosts();
    }
  }, [selectedCategory, mounted]);

  const loadData = async () => {
    try {
      // Kategorileri yükle
      const categoriesData = await getCategoriesWithPostCount();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      
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
      
      // Verileri işle
      const processedPosts = postsData?.map(post => {
        // HTML içeriğini düzgün şekilde işle
        if (post.content && typeof post.content === 'string') {
          console.log('İşlenmemiş içerik:', post.content);
          
          // Eğer içerik HTML etiketleri içeriyorsa ancak düz metin olarak görünüyorsa
          if (
            post.content.includes('&lt;') || 
            post.content.includes('&gt;') || 
            post.content.includes('&quot;') || 
            post.content.includes('&#39;') || 
            post.content.includes('&amp;')
          ) {
            console.log('HTML karakterleri bulundu, dönüştürülüyor...');
            post.content = post.content
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, '&');
              
            console.log('Dönüştürülmüş içerik:', post.content);
          }
        }
        return post;
      }) || [];
      
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Ana İçerik - Blog Yazıları */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <span>Yükleniyor...</span>
                  </div>
                </div>
              ) : posts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {posts.map((post) => (
                    <article key={post.id} className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all duration-300">
                      <button onClick={() => setSelectedPost(post)} className="block w-full text-left">
                        <div className="relative h-56 md:h-64">
                          <Image
                            src={post.featured_image || '/images/placeholder.jpg'}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain md:object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {post.category && (
                            <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-600/90 text-white backdrop-blur-sm">
                              {post.category.name}
                            </div>
                          )}
                        </div>
                        <div className="p-8">
                          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                            {post.title}
                          </h2>
                          <div className="text-gray-300 text-base mb-6 line-clamp-2 overflow-hidden">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400 flex items-center space-x-4">
                              <span className="flex items-center">
                                <i className="ri-calendar-line mr-2"></i>
                                {formatDate(post.created_at)}
                              </span>
                              <span className="flex items-center">
                                <i className="ri-time-line mr-2"></i>
                                {calculateReadingTime(post.content)}
                              </span>
                            </div>
                            <div className="flex space-x-3">
                              <div className="like-btn w-10 h-10 flex items-center justify-center hover:bg-purple-500/10 rounded-full transition-colors cursor-pointer">
                                <i className="ri-heart-line text-lg text-purple-400"></i>
                              </div>
                              <div className="bookmark-btn w-10 h-10 flex items-center justify-center hover:bg-purple-500/10 rounded-full transition-colors cursor-pointer">
                                <i className="ri-bookmark-line text-lg text-purple-400"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
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

            {/* Sağ Sidebar - Kategoriler */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 sticky top-24">
                <h3 className="text-2xl font-bold text-white mb-6">Kategoriler</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                      selectedCategory === '' 
                        ? 'bg-purple-600 text-white font-medium shadow-lg shadow-purple-500/20' 
                        : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center">
                      <i className="ri-apps-line mr-3"></i>
                      Tüm Yazılar
                    </span>
                    <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {categories.reduce((total, cat) => total + (cat.post_count || 0), 0)}
                    </span>
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`w-full text-left px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                        selectedCategory === category.slug 
                          ? 'bg-purple-600 text-white font-medium shadow-lg shadow-purple-500/20' 
                          : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center">
                        <i className={`ri-folder-line mr-3 ${category.color}`}></i>
                        {category.name}
                      </span>
                      <span className={`${
                        selectedCategory === category.slug 
                          ? 'bg-purple-700/50 text-white' 
                          : 'bg-gray-700/50 text-gray-300'
                        } text-xs px-2 py-1 rounded-full`}>
                        {category.post_count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
                  className="object-contain md:object-cover rounded-t-2xl"
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
                <div className="text-gray-300 leading-relaxed">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedPost.content 
                    }}
                  />
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

      <Footer />
    </>
  );
} 