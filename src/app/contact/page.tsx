'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const supabase = createClientComponentClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([form]);

      if (error) throw error;

      toast.success('Mesajınız başarıyla gönderildi.');
      setForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesajınız gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold text-gray-100">İletişim</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* İletişim Bilgileri */}
            <div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">İletişim Bilgileri</h3>
                  <p className="text-gray-400">
                    Aşağıdaki iletişim kanallarından bana ulaşabilirsiniz.
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <i className="ri-mail-line text-xl text-primary"></i>
                    <span>info@muratkardesler.com</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Sosyal Medya</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://github.com"
                      target="_blank"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <i className="ri-github-line text-gray-100"></i>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <i className="ri-linkedin-line text-gray-100"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* İletişim Formu */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        İsim
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                        placeholder="Adınız ve Soyadınız"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                        placeholder="E-posta adresiniz"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                      Konu
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                      placeholder="Mesajınızın konusu"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Mesaj
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
                      placeholder="Mesajınız"
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full !rounded-xl bg-primary text-white px-6 py-3 font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Gönderiliyor...
                        </span>
                      ) : (
                        'Gönder'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 