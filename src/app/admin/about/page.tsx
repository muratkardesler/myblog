'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface About {
  id: string;
  title: string;
  description: string;
  what_i_do: string;
  expertise: string;
  created_at: string;
}

export default function AboutSettingsPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAbout(data);
      }
    } catch (error) {
      console.error('Error loading about:', error);
      toast.error('Hakkımda bilgileri yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        what_i_do: formData.get('what_i_do'),
        expertise: formData.get('expertise')
      };

      let error;
      if (about?.id) {
        // Güncelle
        const { error: updateError } = await supabase
          .from('about')
          .update(updateData)
          .eq('id', about.id);
        error = updateError;
      } else {
        // Yeni kayıt
        const { error: insertError } = await supabase
          .from('about')
          .insert([updateData])
          .select()
          .single();
        error = insertError;
      }

      if (error) throw error;

      toast.success('Hakkımda sayfası başarıyla güncellendi.');
      await loadAbout();
    } catch (error) {
      console.error('Error saving about page:', error);
      toast.error('Hakkımda sayfası güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Hakkımda Sayfası</h1>
          <p className="text-gray-400 mt-2">Hakkımda sayfası içeriğini düzenleyin</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Panele Dön
        </Link>
      </div>

      <div className="max-w-3xl bg-gray-800 border border-gray-700 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={about?.title}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Örn: Merhaba! Ben Murat Kardeşler"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={about?.description}
              rows={4}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Kendiniz hakkında kısa bir açıklama"
            />
          </div>

          <div>
            <label htmlFor="what_i_do" className="block text-sm font-medium text-gray-300 mb-1">
              Neler Yapıyorum?
            </label>
            <textarea
              id="what_i_do"
              name="what_i_do"
              defaultValue={about?.what_i_do}
              rows={4}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Yaptığınız işler hakkında bilgi"
            />
          </div>

          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-300 mb-1">
              Uzmanlık Alanları
            </label>
            <textarea
              id="expertise"
              name="expertise"
              defaultValue={about?.expertise}
              rows={4}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Uzmanlık alanlarınız"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
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