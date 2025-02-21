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
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                  {about?.title || 'Merhaba! Ben ' + settings?.admin_name}
                </h2>
                <p className="text-gray-400">
                  {about?.description || settings?.admin_description || 'Hakkımda sayfası içeriği henüz eklenmemiş.'}
                </p>
              </div>

              {sections.filter(section => section.is_active).map(section => (
                <div key={section.id}>
                  <h3 className="text-xl font-semibold text-gray-100 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-gray-400">{section.content}</p>
                </div>
              ))}

              <div className="flex space-x-4">
                <Link
                  href="https://github.com"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <i className="ri-github-line text-gray-100"></i>
                </Link>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <i className="ri-linkedin-line text-gray-100"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 