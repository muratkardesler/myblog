'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
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
  skills?: string;
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

  const getSkills = () => {
    if (!about?.skills) return [];
    return about.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
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
        {/* Arka plan dekoratif element */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-10">
          {/* Profil Kartı */}
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl shadow-purple-500/5 mb-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profil Fotoğrafı */}
              <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-purple-500/30 shadow-lg shadow-purple-500/20 flex-shrink-0">
                {settings?.admin_image ? (
                  <Image
                    src={settings.admin_image}
                    alt={settings?.admin_name || 'Profil'}
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <i className="ri-user-line text-5xl text-white"></i>
                  </div>
                )}
              </div>
              
              {/* Profil Bilgileri */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <i className="ri-user-3-line text-3xl text-purple-400 mr-3"></i>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text font-display">
                    {about?.title || 'Merhaba! Ben ' + settings?.admin_name}
                  </h1>
                </div>
                
                <div className="text-gray-300 leading-relaxed text-lg space-y-4 whitespace-pre-wrap">
                  {about?.description?.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  )) || settings?.admin_description || 'Hakkımda sayfası içeriği henüz eklenmemiş.'}
                </div>
                
                {/* Sosyal Medya Linkleri */}
                <div className="flex space-x-4 mt-6 justify-center md:justify-start">
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
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-blue-600 transition-all transform hover:scale-110 duration-300"
                  >
                    <i className="ri-linkedin-line text-xl text-gray-100"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bölümler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.filter(section => section.is_active).map((section, index) => {
              // Bölüm için ikon seçimi
              let icon = "ri-code-line";
              if (section.title.toLowerCase().includes("yap")) icon = "ri-tools-line";
              else if (section.title.toLowerCase().includes("yetkin")) icon = "ri-award-line";
              else if (section.title.toLowerCase().includes("eğitim")) icon = "ri-book-open-line";
              else if (section.title.toLowerCase().includes("deneyim")) icon = "ri-briefcase-line";
              
              // Bölüm için renk seçimi
              const colors = [
                "from-purple-500 to-blue-500",
                "from-blue-500 to-cyan-500",
                "from-emerald-500 to-green-500",
                "from-amber-500 to-orange-500"
              ];
              const colorClass = colors[index % colors.length];
              
              return (
                <div 
                  key={section.id} 
                  className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/30"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg shadow-purple-500/20 mr-4`}>
                      <i className={`${icon} text-2xl text-white`}></i>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      {section.title}
                    </h3>
                  </div>
                  
                  <div className="text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap ml-16">
                    {section.content?.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Yetkinlikler Bölümü */}
          {getSkills().length > 0 ? (
            <div className="mt-12 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mr-4">
                  <i className="ri-award-line text-2xl text-white"></i>
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  Öne Çıkan Yetkinliklerim
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {getSkills().map((skill, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-colors">
                    <span className="text-gray-200">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : !sections.some(s => s.title.toLowerCase().includes("yetkin")) && (
            <div className="mt-12 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mr-4">
                  <i className="ri-award-line text-2xl text-white"></i>
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  Öne Çıkan Yetkinliklerim
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Supabase', 'API Development', 'UI/UX'].map((skill, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-colors">
                    <span className="text-gray-200">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 