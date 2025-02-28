'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
}

interface Settings {
  id: string;
  admin_name: string;
  admin_title: string;
  admin_description: string;
  admin_image: string;
  created_at: string;
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

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [about, setAbout] = useState<About | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: settingsData }, { data: aboutData }, { data: sectionsData }] = await Promise.all([
        supabase.from('settings').select('*').single(),
        supabase.from('about').select('*').single(),
        supabase.from('sections').select('*').order('order_no')
      ]);

      setSettings(settingsData);
      setAbout(aboutData);
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="min-h-screen bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-400">
              <i className="ri-loader-4-line animate-spin text-2xl"></i>
              <span>Yükleniyor...</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text font-display mb-6">
                  {about?.title || 'Merhaba! Ben ' + settings?.admin_name}
                </h2>
                <div className="text-gray-300 leading-relaxed text-lg space-y-4 whitespace-pre-wrap">
                  {about?.description?.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  )) || settings?.admin_description || 'Hakkımda sayfası içeriği henüz eklenmemiş.'}
                </div>
              </div>

              {sections.filter(section => section.is_active).map(section => (
                <div key={section.id} className="border-t border-gray-700 pt-8">
                  <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span>
                    {section.title}
                  </h3>
                  <div className="text-gray-300 leading-relaxed pl-5 space-y-4 whitespace-pre-wrap">
                    {section.content?.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-700 pt-8">
                <div className="flex space-x-4">
                  <Link
                    href="https://github.com/muratkardesler"
                    target="_blank"
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-purple-600 transition-all transform hover:scale-110 duration-300"
                  >
                    <i className="ri-github-line text-xl text-gray-100"></i>
                  </Link>
                  <Link
                    href="https://linkedin.com/in/muratkardesler"
                    target="_blank"
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-purple-600 transition-all transform hover:scale-110 duration-300"
                  >
                    <i className="ri-linkedin-line text-xl text-gray-100"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 