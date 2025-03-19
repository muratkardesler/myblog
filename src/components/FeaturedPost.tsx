'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/lib/types';
import { getFeaturedPost, likePost, getPostLikes } from '@/lib/supabase';
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
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  useEffect(() => {
    if (post) {
      loadLikes();
    }
  }, [post]);

  const loadData = async () => {
    const [featuredPost, { data: settingsData }] = await Promise.all([
      getFeaturedPost(),
      supabase.from('settings').select('*').single()
    ]);

    setPost(featuredPost);
    setSettings(settingsData);
  };

  const loadLikes = async () => {
    if (!post) return;
    const count = await getPostLikes(post.id);
    setLikesCount(count);
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    
    setIsLiking(true);
    try {
      // IP adresi ve user agent bilgisini almak için basit bir API çağrısı yapıyoruz
      const response = await fetch('/api/visitor-info');
      const { ip, userAgent } = await response.json();
      
      const liked = await likePost(post.id, ip);
      setIsLiked(liked);
      
      // Beğeni sayısını güncelle
      loadLikes();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
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
            <div className="text-gray-400 mb-6">
              <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }} />
            </div>
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
              <div 
                onClick={handleLike}
                className="!rounded-button border border-gray-600 px-6 py-2 hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center text-gray-300 cursor-pointer"
              >
                <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line'} mr-2`}></i>
                {likesCount > 0 ? likesCount : 'Beğen'}
              </div>
              <div 
                onClick={() => {
                  // Direkt manuel paylaşım menüsünü aç
                  manualShare(post.title, post.excerpt || post.title, window.location.origin + '/blog/' + post.slug);
                }}
                className="!rounded-button border border-gray-600 px-6 py-2 hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center text-gray-300 cursor-pointer"
              >
                <i className="ri-share-line mr-2"></i>
                Paylaş
              </div>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[450px]">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain md:object-cover rounded-xl"
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
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-sm p-4 sm:p-6 flex justify-between items-center rounded-b-2xl">
                <div className="flex space-x-2 sm:space-x-3">
                  <div 
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer ${isLiked ? 'bg-purple-500/20 text-purple-400' : ''}`}
                  >
                    <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line'}`}></i>
                    <span className="hidden sm:inline">{isLiked ? 'Beğenildi' : 'Beğen'}</span>
                    {likesCount > 0 && <span className="ml-1">({likesCount})</span>}
                  </div>
                </div>
                <div 
                  onClick={() => {
                    // Direkt manuel paylaşım menüsünü aç
                    manualShare(selectedPost.title, selectedPost.excerpt || selectedPost.title, window.location.origin + '/blog/' + selectedPost.slug);
                  }}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer"
                >
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

// Manuel paylaşım fonksiyonu
const manualShare = (title: string, text: string, url: string) => {
  const shareOptions = document.createElement('div');
  shareOptions.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  
  shareOptions.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 animate-slide-up">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-white">Paylaş</h3>
        <button class="text-gray-400 hover:text-white" id="close-share">
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>
      <div class="grid grid-cols-4 gap-4 mb-6">
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-1">
            <i class="ri-facebook-fill text-white text-xl"></i>
          </div>
          <span class="text-xs text-gray-300">Facebook</span>
        </a>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center mb-1">
            <i class="ri-twitter-fill text-white text-xl"></i>
          </div>
          <span class="text-xs text-gray-300">Twitter</span>
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center mb-1">
            <i class="ri-linkedin-fill text-white text-xl"></i>
          </div>
          <span class="text-xs text-gray-300">LinkedIn</span>
        </a>
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1">
            <i class="ri-whatsapp-fill text-white text-xl"></i>
          </div>
          <span class="text-xs text-gray-300">WhatsApp</span>
        </a>
      </div>
      <div class="relative flex items-center">
        <input type="text" value="${url}" readonly class="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-20 text-white text-sm" id="share-url" />
        <button class="absolute right-2 px-3 py-1 text-sm text-purple-400 hover:text-purple-300 bg-gray-800 rounded" id="copy-url">
          Kopyala
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(shareOptions);
  
  // Kapat butonu
  document.getElementById('close-share')?.addEventListener('click', () => {
    document.body.removeChild(shareOptions);
  });
  
  // Dışarı tıklama
  shareOptions.addEventListener('click', (e) => {
    if (e.target === shareOptions) {
      document.body.removeChild(shareOptions);
    }
  });
  
  // URL kopyalama
  document.getElementById('copy-url')?.addEventListener('click', () => {
    const urlInput = document.getElementById('share-url') as HTMLInputElement;
    urlInput.select();
    navigator.clipboard.writeText(urlInput.value)
      .then(() => {
        const copyBtn = document.getElementById('copy-url');
        if (copyBtn) {
          copyBtn.textContent = 'Kopyalandı!';
          setTimeout(() => {
            copyBtn.textContent = 'Kopyala';
          }, 2000);
        }
      })
      .catch(err => console.error('Kopyalama hatası:', err));
  });
}; 