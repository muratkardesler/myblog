'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { formatDate } from '@/lib/utils';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [popularLoading, setPopularLoading] = useState<string | null>(null);
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

  const togglePopular = async (postId: string, isPopular: boolean) => {
    setPopularLoading(postId);
    
    try {
      // Yazıyı güncelle
      const { error } = await supabase
        .from('posts')
        .update({ 
          is_popular: !isPopular,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) {
        console.error('Error updating post popularity:', error);
        toast.error('Yazı güncellenirken bir hata oluştu.');
      } else {
        toast.success(isPopular ? 'Yazı popüler yazılardan kaldırıldı.' : 'Yazı popüler yazılara eklendi.');
        await loadPosts();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setPopularLoading(null);
    }
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

      {posts.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <i className="ri-article-line text-5xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-300 mb-2">Henüz yazı yok</h3>
          <p className="text-gray-400 mb-6">İlk yazınızı oluşturmak için &ldquo;Yeni Yazı&rdquo; butonuna tıklayın.</p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors"
          >
            <i className="ri-add-line mr-2"></i>
            Yeni Yazı Oluştur
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Yazı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden">
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                            priority
                            onError={(e) => {
                              // Resim yüklenemezse varsayılan bir resim göster
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Sonsuz döngüyü önle
                              // Varsayılan resim olarak placeholder kullan
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzRjNGNDYiLz48cGF0aCBkPSJNNzYgMTI0LjVINzZDNzMuNzkwOSAxMjQuNSA3MiAxMjYuMjkxIDcyIDEyOC41VjEyOC41QzcyIDEzMC43MDkgNzMuNzkwOSAxMzIuNSA3NiAxMzIuNUgxMjRDMTI2LjIwOSAxMzIuNSAxMjggMTMwLjcwOSAxMjggMTI4LjVWMTI4LjVDMTI4IDEyNi4yOTEgMTI2LjIwOSAxMjQuNSAxMjQgMTI0LjVINzZaIiBmaWxsPSIjOTM5Mzk5Ii8+PHBhdGggZD0iTTEwMCA2Ny41QzgxLjg1NTcgNjcuNSA2Ny41IDgxLjg1NTcgNjcuNSAxMDBDNjcuNSAxMTguMTQ0IDgxLjg1NTcgMTMyLjUgMTAwIDEzMi41QzExOC4xNDQgMTMyLjUgMTMyLjUgMTE4LjE0NCAxMzIuNSAxMDBDMTMyLjUgODEuODU1NyAxMTguMTQ0IDY3LjUgMTAwIDY3LjVaTTEwMCAxMjQuNUM4Ni4xOTI5IDEyNC41IDc1LjUgMTEzLjgwNyA3NS41IDEwMEM3NS41IDg2LjE5MjkgODYuMTkyOSA3NS41IDEwMCA3NS41QzExMy44MDcgNzUuNSAxMjQuNSA4Ni4xOTI5IDEyNC41IDEwMEMxMjQuNSAxMTMuODA3IDExMy44MDcgMTI0LjUgMTAwIDEyNC41WiIgZmlsbD0iIzkzOTM5OSIvPjwvc3ZnPg==';
                            }}
                          />
                        </div>
                        <div className="truncate max-w-xs">
                          <div className="text-sm font-medium text-gray-100">{post.title}</div>
                          <div className="text-xs text-gray-400 truncate">{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.category ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${post.category.color.replace('text-', 'bg-').replace('00', '700')} text-white`}>
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-white">
                          Kategorisiz
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.status === 'published' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-700 text-white">
                          Yayında
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-white">
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => togglePopular(post.id, post.is_popular)}
                          disabled={popularLoading === post.id}
                          className={`p-2 rounded-lg ${post.is_popular ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                          title={post.is_popular ? 'Popüler yazılardan kaldır' : 'Popüler yazılara ekle'}
                        >
                          {popularLoading === post.id ? (
                            <i className="ri-loader-4-line animate-spin"></i>
                          ) : (
                            <i className={`ri-star-${post.is_popular ? 'fill' : 'line'}`}></i>
                          )}
                        </button>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                          title="Düzenle"
                        >
                          <i className="ri-edit-line"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(post.id, post.title)}
                          disabled={deleteLoading === post.id}
                          className="p-2 rounded-lg bg-red-900 hover:bg-red-800 transition-colors"
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
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Yazıyı Sil"
        message={`'${deleteModal.postTitle}' başlıklı yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        isLoading={deleteLoading !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
} 