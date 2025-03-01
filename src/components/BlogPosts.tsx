'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { getLatestPosts, likePost, getPostLikes } from '@/lib/supabase';
import { calculateReadingTime, formatDate } from '@/lib/utils';
import Image from 'next/image';

export default function BlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isLiking, setIsLiking] = useState(false);
  const postsPerPage = 6;

  useEffect(() => {
    setMounted(true);
    loadPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      loadLikes();
    }
  }, [posts]);

  const loadPosts = async () => {
    setLoading(true);
    const latestPosts = await getLatestPosts(page * postsPerPage);
    setPosts(latestPosts);
    setLoading(false);
  };

  const loadLikes = async () => {
    const likesData: Record<string, number> = {};
    
    for (const post of posts) {
      const count = await getPostLikes(post.id);
      likesData[post.id] = count;
    }
    
    setLikesCount(likesData);
  };

  const handleLike = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      // IP adresi ve user agent bilgisini almak için basit bir API çağrısı yapıyoruz
      const response = await fetch('/api/visitor-info');
      const { ip, userAgent } = await response.json();
      
      const liked = await likePost(postId, ip, userAgent);
      
      setLikedPosts(prev => ({
        ...prev,
        [postId]: liked
      }));
      
      // Beğeni sayısını güncelle
      const newCount = await getPostLikes(postId);
      setLikesCount(prev => ({
        ...prev,
        [postId]: newCount
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
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
          <article key={post.id} className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all duration-300">
            <div onClick={() => setSelectedPost(post)} className="block w-full text-left cursor-pointer">
              <div className="relative h-48 md:h-56">
                <Image 
                  src={post.featured_image} 
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
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {post.title}
                </h2>
                <div className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt ? (
                    <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 120) + '...' }} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {calculateReadingTime(post.content)}
                  </div>
                  <div className="flex space-x-3">
                    <div 
                      onClick={(e) => handleLike(post.id, e)} 
                      className="like-btn w-8 h-8 flex items-center justify-center hover:bg-purple-500/10 rounded-full transition-colors cursor-pointer"
                    >
                      <i className={`${likedPosts[post.id] ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-purple-400'}`}></i>
                      {likesCount[post.id] > 0 && <span className="ml-1 text-xs">{likesCount[post.id]}</span>}
                    </div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Direkt manuel paylaşım menüsünü aç
                        manualShare(post.title, post.excerpt || post.title, window.location.origin + '/blog/' + post.slug);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-purple-500/10 rounded-full transition-colors cursor-pointer"
                    >
                      <i className="ri-share-line text-purple-400"></i>
                    </div>
                  </div>
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
                    onClick={(e) => handleLike(selectedPost.id, e)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer ${likedPosts[selectedPost.id] ? 'bg-purple-500/20 text-purple-400' : ''}`}
                  >
                    <i className={`${likedPosts[selectedPost.id] ? 'ri-heart-fill text-red-500' : 'ri-heart-line'}`}></i>
                    <span className="hidden sm:inline">{likedPosts[selectedPost.id] ? 'Beğenildi' : 'Beğen'}</span>
                    {likesCount[selectedPost.id] > 0 && <span className="ml-1">({likesCount[selectedPost.id]})</span>}
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
    </div>
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