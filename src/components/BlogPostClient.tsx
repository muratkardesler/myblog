'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { parseHtmlContent, calculateReadingTime, formatDate } from '@/lib/utils';
import { getPostLikes, likePost } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BlogPostClientProps {
  post: {
    id: string;
    title: string;
    content: string;
    featured_image: string;
    created_at: string;
    published_at: string;
    slug: string;
    category_id: string;
    category?: {
      name: string;
      slug: string;
      color: string;
    };
  };
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadPostLikes();
  }, []);

  const loadPostLikes = async () => {
    try {
      const count = await getPostLikes(post.id);
      setLikes(count);
    } catch (error) {
      console.error('Beğeni sayısını yükleme hatası:', error);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      // IP adresi ve user agent bilgisini almak için basit bir API çağrısı yapıyoruz
      const response = await fetch('/api/visitor-info');
      const { ip, userAgent } = await response.json();
      
      const liked = await likePost(post.id, ip);
      
      setIsLiked(liked);
      
      // Beğeni sayısını güncelle
      const newCount = await getPostLikes(post.id);
      setLikes(newCount);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://muratkardesler.com/blog/${post.slug}`;

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="bg-gray-900 min-h-screen text-white">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-gray-900/60 to-gray-900"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-5xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Blog&apos;a dön
            </Link>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm md:text-base text-white/70 gap-4 md:gap-6">
              <div className="flex items-center">
                <i className="ri-calendar-line mr-2"></i>
                <time dateTime={post.published_at || post.created_at}>
                  {formatDate(post.published_at || post.created_at)}
                </time>
              </div>
              
              <div className="flex items-center">
                <i className="ri-time-line mr-2"></i>
                <span>{calculateReadingTime(post.content)}</span>
              </div>
              
              {post.category && (
                <Link 
                  href={`/category/${post.category.slug}`}
                  className="flex items-center px-3 py-1 rounded-full text-white bg-purple-600/80 hover:bg-purple-600 transition-colors"
                  style={{ backgroundColor: post.category.color ? `${post.category.color}80` : undefined }}
                >
                  <span>{post.category.name}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <article className="prose prose-invert lg:prose-xl max-w-none">
            <div 
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseHtmlContent(post.content) }}
            />
          </article>
          
          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-gray-800 flex justify-between items-center">
            <div 
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer ${isLiked ? 'bg-purple-500/20 text-purple-400' : ''}`}
            >
              <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line'}`}></i>
              <span>{isLiked ? 'Beğenildi' : 'Beğen'}</span>
              {likes > 0 && <span className="ml-1">({likes})</span>}
            </div>
            
            <div 
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer"
            >
              <i className="ri-share-line"></i>
              <span>Paylaş</span>
            </div>
          </div>
        </div>
        
        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Paylaş</h3>
                <button className="text-gray-400 hover:text-white" onClick={closeShareModal}>
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-1">
                    <i className="ri-facebook-fill text-white text-xl"></i>
                  </div>
                  <span className="text-xs text-gray-300">Facebook</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center mb-1">
                    <i className="ri-twitter-fill text-white text-xl"></i>
                  </div>
                  <span className="text-xs text-gray-300">Twitter</span>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center mb-1">
                    <i className="ri-linkedin-fill text-white text-xl"></i>
                  </div>
                  <span className="text-xs text-gray-300">LinkedIn</span>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1">
                    <i className="ri-whatsapp-fill text-white text-xl"></i>
                  </div>
                  <span className="text-xs text-gray-300">WhatsApp</span>
                </a>
              </div>
              <div className="relative flex items-center">
                <input type="text" value={shareUrl} readOnly className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-20 text-white text-sm" />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    const copyBtn = document.querySelector('.copy-btn');
                    if (copyBtn) {
                      copyBtn.textContent = 'Kopyalandı!';
                      setTimeout(() => {
                        copyBtn.textContent = 'Kopyala';
                      }, 2000);
                    }
                  }}
                  className="copy-btn absolute right-2 px-3 py-1 text-sm text-purple-400 hover:text-purple-300 bg-gray-800 rounded"
                >
                  Kopyala
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
} 