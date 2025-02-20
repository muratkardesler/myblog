'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Settings {
  id: string;
  admin_name: string;
  admin_title: string;
  admin_description: string;
  admin_image: string;
  created_at: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Ayarlar yüklenirken bir hata oluştu.');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `admin/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setSettings(prev => prev ? { ...prev, admin_image: publicUrl } : null);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData = {
        admin_name: formData.get('admin_name'),
        admin_title: formData.get('admin_title'),
        admin_description: formData.get('admin_description'),
        admin_image: settings?.admin_image || ''
      };

      let error;
      if (settings?.id) {
        // Güncelle
        const { error: updateError } = await supabase
          .from('settings')
          .update(updateData)
          .eq('id', settings.id);
        error = updateError;
      } else {
        // Yeni kayıt
        const { error: insertError } = await supabase
          .from('settings')
          .insert([updateData])
          .select()
          .single();
        error = insertError;
      }

      if (error) throw error;

      toast.success('Ayarlar başarıyla kaydedildi.');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Ayarlar</h1>
          <p className="text-gray-400 mt-2">Admin bilgilerini düzenleyin</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Panele Dön
        </Link>
      </div>

      <div className="max-w-2xl bg-gray-800 border border-gray-700 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Profil Resmi
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-700">
                {settings?.admin_image ? (
                  <Image
                    src={settings.admin_image}
                    alt="Admin"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <i className="ri-user-line text-4xl"></i>
                  </div>
                )}
              </div>
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
            </div>
          </div>

          <div>
            <label htmlFor="admin_name" className="block text-sm font-medium text-gray-300 mb-1">
              İsim
            </label>
            <input
              type="text"
              id="admin_name"
              name="admin_name"
              defaultValue={settings?.admin_name}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Admin adı"
              required
            />
          </div>

          <div>
            <label htmlFor="admin_title" className="block text-sm font-medium text-gray-300 mb-1">
              Ünvan
            </label>
            <input
              type="text"
              id="admin_title"
              name="admin_title"
              defaultValue={settings?.admin_title}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Örn: Blog Yazarı"
              required
            />
          </div>

          <div>
            <label htmlFor="admin_description" className="block text-sm font-medium text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              id="admin_description"
              name="admin_description"
              defaultValue={settings?.admin_description}
              rows={3}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Kısa bir açıklama"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="w-full !rounded-xl bg-primary text-white px-6 py-3 font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
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
    </div>
  );
} 