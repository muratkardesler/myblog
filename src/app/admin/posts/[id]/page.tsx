'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Post, Category } from '@/lib/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface PostFormData {
  title: string;
  content: string;
  featured_image: string;
  category_id: string;
  status: 'draft' | 'published';
  is_featured: boolean;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft',
    is_featured: false
  });

  useEffect(() => {
    if (params.id) {
      loadPost();
      loadCategories();
    }
  }, [params.id]);

  const loadPost = async () => {
    if (!params.id) return;
    
    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        toast.error('Yazı yüklenirken bir hata oluştu.');
        return;
      }

      if (post) {
        setFormData({
          title: post.title || '',
          content: post.content || '',
          featured_image: post.featured_image || '',
          category_id: post.category_id || '',
          status: post.status || 'draft',
          is_featured: post.is_featured || false
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Yazı yüklenirken bir hata oluştu.');
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Kategoriler yüklenirken bir hata oluştu.');
      return;
    }

    setCategories(data || []);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image: publicUrl }));
      toast.success('Resim başarıyla yüklendi.');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      toast.error('Resim yüklenirken bir hata oluştu.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece resim dosyası yükleyin.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resim boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    await handleImageUpload(file);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id) return;
    
    setLoading(true);

    try {
      if (formData.is_featured) {
        await supabase
          .from('posts')
          .update({ is_featured: false })
          .neq('id', params.id);
      }

      const { error } = await supabase
        .from('posts')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Yazı başarıyla güncellendi.');
      router.push('/admin/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Yazı güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Yazıyı Düzenle</h1>
          <p className="text-gray-400 mt-2">Yazı içeriğini güncelleyin</p>
        </div>
        <Link 
          href="/admin/posts" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Yazılara Dön
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Yazı başlığı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Kapak Görseli
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imageUploading ? (
                      <i className="ri-loader-4-line animate-spin text-2xl text-gray-400 mb-2"></i>
                    ) : (
                      <i className="ri-upload-cloud-2-line text-2xl text-gray-400 mb-2"></i>
                    )}
                    <p className="text-sm text-gray-400">
                      {imageUploading ? 'Yükleniyor...' : 'Resim yüklemek için tıklayın'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={imageUploading}
                  />
                </label>
              </div>
              {formData.featured_image && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                  <Image
                    src={formData.featured_image}
                    alt="Kapak görseli"
                    fill
                    sizes="(max-width: 128px) 100vw, 128px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <i className="ri-delete-bin-line text-white"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              İçerik
            </label>
            <textarea
              ref={contentRef}
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Yazınızı buraya girin..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-1">
                Kategori
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                required
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Durum
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                required
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayınla</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-300">
                Bu yazıyı anasayfada öne çıkar
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Not: Bir yazıyı öne çıkardığınızda, daha önce öne çıkarılmış yazı otomatik olarak kaldırılır.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end space-x-4">
          <Link
            href="/admin/posts"
            className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading || imageUploading}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Kaydediliyor...
              </span>
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 