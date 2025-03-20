'use client';

/* 
 * Not: 'user' state değişkeni JSX render kısmında profile bilgilerinin gösterilmesi
 * için kullanılmaktadır. ESLint/TSLint tarafından kullanılmadığı uyarısı görünebilir
 * ancak UI bileşenlerinde kullanıldığı için kaldırmıyoruz.
 */

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { User } from '@/lib/types';
import { getCurrentUser, refreshAuthSession } from '@/lib/supabase';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// İş kaydı tipi
interface WorkLog {
  id: string;
  user_id: string;
  date: string;
  project_code: string;
  client_name: string;
  contact_person: string;
  description: string;
  duration: number | string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  end_time?: string | null;
}

export default function WorkLogsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // İş kaydı form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    project_code: '',
    client_name: '',
    contact_person: '',
    description: '',
    duration: '1.00'
  });

  // İş kayıtları listesi
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [activeLog, setActiveLog] = useState<WorkLog | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Tarih filtreleme için
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // İş kayıtlarını getirme fonksiyonu
  const loadWorkLogs = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoadingLogs(true);
      
      // Ay başlangıç ve bitiş tarihlerini hesapla
      const startDate = new Date(filterYear, filterMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(filterYear, filterMonth, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Aktif çalışma var mı kontrol et
      const activeWorkLog = data?.find(log => log.end_time === null);
      if (activeWorkLog) {
        setActiveLog(activeWorkLog);
      } else {
        setActiveLog(null);
      }
      
      setWorkLogs(data || []);
    } catch (error) {
      console.error('İş kayıtları yüklenirken hata:', error);
      toast.error('İş kayıtları yüklenirken bir hata oluştu.');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Oturum ve kullanıcı bilgilerini al
        const userInfo = await getCurrentUser();
        
        if (!userInfo.success || !userInfo.user) {
          // Oturumu yenilemeyi dene
          const refreshResult = await refreshAuthSession();
          
          if (!refreshResult.success) {
            toast.error('Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.');
            router.push('/auth/login?redirect=/profile/work-logs');
            return;
          }
          
          // Yenileme başarılıysa tekrar kullanıcı bilgilerini getir
          const refreshedUserInfo = await getCurrentUser();
          
          if (!refreshedUserInfo.success || !refreshedUserInfo.user) {
            toast.error('Kullanıcı bilgileriniz alınamadı. Lütfen tekrar giriş yapın.');
            router.push('/auth/login?redirect=/profile/work-logs');
            return;
          }
          
          // Kullanıcı bilgilerini sakla
          setUser(refreshedUserInfo.user);
          
          // Kullanıcıya ait iş takibi verilerini getir
          await loadWorkLogs(refreshedUserInfo.user.id);
        } else {
          // Kullanıcı bilgilerini sakla
          setUser(userInfo.user);
          
          // Kullanıcıya ait iş takibi verilerini getir
          await loadWorkLogs(userInfo.user.id);
        }
        
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, filterMonth, filterYear]);

  // Form veri değişikliklerini işleme
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // İş kaydı ekleme
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Direkt auth üzerinden kullanıcı bilgisi almaya çalış
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        console.error("Form gönderimi sırasında auth hatası:", authError);
        toast.error('Oturum bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }
      
      const userId = authData.user.id;
      
      // Yeni kaydı ekle
      const { error: insertError } = await supabase
        .from('work_logs')
        .insert({
          user_id: userId,
          date: formData.date,
          project_code: formData.project_code,
          client_name: formData.client_name,
          contact_person: formData.contact_person,
          description: formData.description,
          duration: formData.duration,
          is_completed: true
        });
        
      if (insertError) {
        console.error("İş kaydı eklenirken DB hatası:", insertError);
        throw insertError;
      }
      
      toast.success('İş kaydı başarıyla eklendi.');
      
      // Formu temizle (tarih hariç)
      setFormData({
        ...formData,
        project_code: '',
        client_name: '',
        contact_person: '',
        description: '',
        duration: '1.00'
      });
      
      // Kayıtları yenile
      loadWorkLogs(userId);
      
    } catch (error) {
      console.error('İş kaydı eklenirken hata:', error);
      toast.error('İş kaydı eklenirken bir hata oluştu.');
    }
  };

  // İş kaydını silme
  const handleDelete = async (id: string) => {
    if (!confirm('Bu iş kaydını silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      // Direkt auth üzerinden kullanıcı bilgisi almaya çalış
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        console.error("Silme işlemi sırasında auth hatası:", authError);
        toast.error('Oturum bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }
      
      const userId = authData.user.id;
      
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('İş kaydı başarıyla silindi.');
      loadWorkLogs(userId);
    } catch (error) {
      console.error('İş kaydı silinirken hata:', error);
      toast.error('İş kaydı silinirken bir hata oluştu.');
    }
  };

  // Ay-yıl seçimini işle
  const handleMonthYearChange = (month: number, year: number) => {
    setFilterMonth(month);
    setFilterYear(year);
  };

  // Mevcut ay için toplam çalışma bilgisini hesapla
  const calculateMonthlyStats = () => {
    if (!workLogs.length) return { total: 0, percentage: 0, completedDays: 0, workDays: 0 };
    
    // İş günü sayısı (ayın iş günleri)
    const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
    let workDays = 0;
    
    // Ayın her günü için kontrol et
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(filterYear, filterMonth - 1, i);
      // Hafta içi mi? (0: Pazar, 6: Cumartesi)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    
    // Toplam çalışma süresi
    const totalDuration = workLogs.reduce((sum, log) => sum + parseFloat(String(log.duration)), 0);
    
    // Çalışma günü sayısı (benzersiz günler)
    const uniqueDates = new Set(workLogs.map(log => log.date));
    const completedDays = uniqueDates.size;
    
    // Yüzde hesapla
    const percentage = workDays > 0 ? (completedDays / workDays) * 100 : 0;
    
    return {
      total: totalDuration,
      completedDays,
      workDays,
      percentage
    };
  };

  const stats = calculateMonthlyStats();

  // Ay isimleri
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Oturum kontrolü yapılana kadar yükleniyor göster
  if (!authChecked && loading) {
    return (
      <>
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="min-h-screen bg-gray-900 pt-20 pb-16">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sol sidebar - Profil Navigasyonu */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                <div className="mb-4 pb-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-medium text-white">Profil Menüsü</h3>
                </div>
                <nav className="space-y-2">
                  <Link 
                    href="/profile" 
                    className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                  >
                    <span>Profil Bilgilerim</span>
                  </Link>
                  <Link 
                    href="/profile/work-logs" 
                    className="flex items-center px-3 py-2 text-white bg-purple-500/20 rounded-lg"
                  >
                    <span>İş Takibi</span>
                  </Link>
                  <Link 
                    href="/profile/reports" 
                    className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                  >
                    <span>Raporlar</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Sağ içerik - İş takip */}
            <div className="lg:col-span-9">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h1 className="text-2xl font-bold text-white mb-6">İş Takip Sistemi</h1>
                
                {/* Aylık istatistikler */}
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5 mb-8">
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Aylık İstatistikler</h2>
                    
                    {/* Ay-Yıl seçici */}
                    <div className="flex space-x-2">
                      <select 
                        className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
                        value={filterMonth}
                        onChange={(e) => handleMonthYearChange(parseInt(e.target.value), filterYear)}
                      >
                        {months.map((month, index) => (
                          <option key={index} value={index + 1}>{month}</option>
                        ))}
                      </select>
                      
                      <select 
                        className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
                        value={filterYear}
                        onChange={(e) => handleMonthYearChange(filterMonth, parseInt(e.target.value))}
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Toplam Çalışma</p>
                      <p className="text-2xl font-bold text-white">{stats.total.toFixed(2)} <span className="text-sm text-gray-400">birim</span></p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Çalışma Günleri</p>
                      <p className="text-2xl font-bold text-white">{stats.completedDays} <span className="text-sm text-gray-400">/ {stats.workDays} gün</span></p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Tamamlanma Oranı</p>
                      <p className="text-2xl font-bold text-white">{stats.percentage.toFixed(0)}%</p>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Form ve liste */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* İş kaydı formu */}
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
                    <h2 className="text-lg font-medium text-white mb-4">Yeni İş Kaydı Ekle</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Proje Kodu</label>
                        <input
                          type="text"
                          name="project_code"
                          value={formData.project_code}
                          onChange={handleChange}
                          placeholder="örn: MLSFT-1128"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Müşteri Adı</label>
                        <input
                          type="text"
                          name="client_name"
                          value={formData.client_name}
                          onChange={handleChange}
                          placeholder="Müşteri adı girin"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">İletişim Kişisi</label>
                        <input
                          type="text"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder="İletişim kişisi girin"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Yapılan İş</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Yapılan işi açıklayın"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                          rows={3}
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Süre (Birim)</label>
                        <select
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                          required
                        >
                          <option value="0.25">0.25</option>
                          <option value="0.50">0.50</option>
                          <option value="0.75">0.75</option>
                          <option value="1.00">1.00</option>
                        </select>
                      </div>
                      
                      <div className="pt-4">
                        <button 
                          type="submit" 
                          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                          İş Kaydı Ekle
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* İş kayıtları listesi */}
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
                    <h2 className="text-lg font-medium text-white mb-4">İş Kayıtları</h2>
                    
                    {loadingLogs ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : workLogs.length > 0 ? (
                      <div className="overflow-auto max-h-[400px] custom-scrollbar">
                        <table className="min-w-full">
                          <thead className="bg-gray-800/70 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proje</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Süre</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/30">
                            {workLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-gray-700/20">
                                <td className="px-4 py-3 text-sm text-gray-200">
                                  {new Date(log.date).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="text-white font-medium">{log.project_code}</div>
                                  <div className="text-gray-400 text-xs truncate max-w-[180px]">{log.description}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-white">{parseFloat(String(log.duration)).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-sm">
                                  <button 
                                    onClick={() => handleDelete(log.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-800/30 text-center py-8 px-4 rounded-lg">
                        <i className="ri-calendar-todo-line text-4xl text-gray-500 mb-2"></i>
                        <p className="text-gray-400">Bu ay için henüz iş kaydı bulunmuyor.</p>
                      </div>
                    )}
                  </div>
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