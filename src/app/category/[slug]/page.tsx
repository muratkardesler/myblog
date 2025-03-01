'use client';

import { useEffect, useState } from 'react';
import { PostWithCategory } from '@/lib/types';
import { getPostsByCategory } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import { parseHtmlContent, calculateReadingTime } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (params.slug) {
      loadData();
      loadPostLikes();
    }
  }, [params.slug]);

  const loadData = async () => {
    try {
      if (!params.slug) return;
      
      setLoading(true);

      // Kategoriyi yükle
      const { error: categoryError } = await supabase
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

  const loadPostLikes = async () => {
    try {
      // Post ID'lerine göre beğeni sayılarını al
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id');

      if (error) {
        console.error('Beğeni sayılarını yükleme hatası:', error);
        return;
      }

      // Her post için beğeni sayısını hesapla
      const likesMap: Record<string, number> = {};
      data.forEach(item => {
        if (item.post_id) {
          if (!likesMap[item.post_id]) {
            likesMap[item.post_id] = 1;
          } else {
            likesMap[item.post_id]++;
          }
        }
      });

      setPostLikes(likesMap);
    } catch (error) {
      console.error('Beğeni sayılarını yükleme hatası:', error);
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
                      <h2 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                        <a href={`/blog/${post.slug}`}>{post.title}</a>
                      </h2>
                      <div className="text-gray-400 text-sm mb-4" dangerouslySetInnerHTML={{ __html: parseHtmlContent(post.content.substring(0, 150) + '...') }}></div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span>{new Date(post.published_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                          <span className="mx-2">•</span>
                          <span>{calculateReadingTime(post.content)}</span>
                        </div>
                        <div className="flex space-x-3">
                          <button className="like-btn w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-full transition-colors">
                            <i className="ri-heart-line"></i>
                            {postLikes[post.id] && <span className="ml-1 text-xs">{postLikes[post.id]}</span>}
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