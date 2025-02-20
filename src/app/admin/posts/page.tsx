'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    postId: string;
    postTitle: string;
  }>({
    isOpen: false,
    postId: '',
    postTitle: ''
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('Yazılar yüklenirken bir hata oluştu.');
      return;
    }

    setPosts(data || []);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      postId: id,
      postTitle: title
    });
  };

  const handleDeleteConfirm = async () => {
    const { postId } = deleteModal;
    setDeleteLoading(postId);
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      toast.error('Yazı silinirken bir hata oluştu.');
    } else {
      toast.success('Yazı başarıyla silindi.');
      await loadPosts();
    }
    
    setDeleteLoading(null);
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Yazılar</h1>
          <p className="text-gray-400 mt-2">Tüm yazıları yönetin</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin" 
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Panele Dön
          </Link>
          <Link
            href="/admin/posts/new"
            className="flex items-center bg-primary text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors"
          >
            <i className="ri-add-line mr-2"></i>
            Yeni Yazı
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 relative rounded overflow-hidden mr-3">
                        {post.featured_image && (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-100">{post.title}</div>
                        <div className="text-gray-400">/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.category && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.category.color.replace('text', 'bg')}`}>
                        {post.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {post.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        title="Görüntüle"
                      >
                        <i className="ri-eye-line"></i>
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <i className="ri-edit-line"></i>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(post.id, post.title)}
                        disabled={deleteLoading === post.id}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sil"
                      >
                        {deleteLoading === post.id ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-delete-bin-line"></i>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-article-line text-4xl text-gray-500 mb-3"></i>
              <p className="text-gray-400">Henüz yazı eklenmemiş</p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center mt-4 text-primary hover:text-purple-400 transition-colors"
              >
                <i className="ri-add-line mr-2"></i>
                İlk yazını ekle
              </Link>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Blog Yazısını Sil"
        message={`"${deleteModal.postTitle}" başlıklı blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
} 