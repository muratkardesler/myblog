'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface About {
  id: string;
  title: string;
  description: string;
  what_i_do_title: string;
  what_i_do: string;
  expertise_title: string;
  expertise: string;
  contact_title: string;
  contact_description: string;
  created_at: string;
  skills?: string;
}

interface Section {
  id: string;
  page_id: string;
  title: string;
  content: string;
  order_no: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AboutSettingsPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: aboutData }, { data: sectionsData }] = await Promise.all([
        supabase.from('about').select('*').single(),
        supabase.from('sections').select('*').order('order_no')
      ]);

      setAbout(aboutData);
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const aboutData = {
        title: formData.get('title'),
        description: formData.get('description'),
        skills: formData.get('skills'),
      };

      // About verilerini kaydet
      if (about?.id) {
        await supabase.from('about').update(aboutData).eq('id', about.id);
      } else {
        await supabase.from('about').insert([aboutData]);
      }

      // Bölümleri kaydet
      const sectionsData = sections.map((section, index) => ({
        ...section,
        order_no: index,
        title: formData.get(`section_title_${section.id}`),
        content: formData.get(`section_content_${section.id}`)
      }));

      for (const section of sectionsData) {
        if (section.id.startsWith('new_')) {
          // Yeni bölüm
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...sectionData } = section;
          await supabase.from('sections').insert([{
            ...sectionData,
            page_id: about?.id
          }]);
        } else {
          // Mevcut bölüm
          await supabase.from('sections').update(section).eq('id', section.id);
        }
      }

      toast.success('Değişiklikler başarıyla kaydedildi.');
      await loadData();
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Değişiklikler kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: `new_${Date.now()}`,
        page_id: about?.id || '',
        title: '',
        content: '',
        order_no: sections.length,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (sectionId.startsWith('new_')) {
      setSections(sections.filter(s => s.id !== sectionId));
      return;
    }

    const confirmed = window.confirm('Bu bölümü silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      await supabase.from('sections').delete().eq('id', sectionId);
      toast.success('Bölüm başarıyla silindi.');
      setSections(sections.filter(s => s.id !== sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Bölüm silinirken bir hata oluştu.');
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
              Ana Başlık
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
              Ana Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={about?.description}
              rows={6}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Kendiniz hakkında kısa bir açıklama"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paragraflar oluşturmak için Enter tuşunu kullanabilirsiniz. Her paragraf ayrı olarak görüntülenecektir.
            </p>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-1">
              Öne Çıkan Yetkinliklerim
            </label>
            <textarea
              id="skills"
              name="skills"
              defaultValue={about?.skills}
              rows={4}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
              placeholder="Next.js, React, TypeScript, Tailwind CSS, Node.js, Supabase, API Development, UI/UX"
            />
            <p className="text-xs text-gray-400 mt-1">
              Yetkinliklerinizi virgülle ayırarak yazın. Örn: Next.js, React, TypeScript, Tailwind CSS
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100">Bölümler</h2>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center text-primary hover:text-purple-400 transition-colors"
              >
                <i className="ri-add-line mr-1"></i>
                Yeni Bölüm Ekle
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-300">
                      {index + 1}. Bölüm
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Bölüm Başlığı
                    </label>
                    <input
                      type="text"
                      name={`section_title_${section.id}`}
                      defaultValue={section.title}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                      placeholder="Bölüm başlığı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Bölüm İçeriği
                    </label>
                    <textarea
                      name={`section_content_${section.id}`}
                      defaultValue={section.content}
                      rows={6}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                      placeholder="Bölüm içeriği"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Paragraflar oluşturmak için Enter tuşunu kullanabilirsiniz. Her paragraf ayrı olarak görüntülenecektir.
                    </p>
                  </div>
                </div>
              ))}

              {sections.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-file-list-line text-4xl mb-2"></i>
                  <p>Henüz bölüm eklenmemiş</p>
                </div>
              )}
            </div>
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