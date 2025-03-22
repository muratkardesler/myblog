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
import { getCurrentUser, refreshAuthSession } from '@/lib/supabase';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Calendar from './components/Calendar';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

// İş kaydı tipi
export interface WorkLog {
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
  log_time: boolean;
}

export default function WorkLogsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // İş kaydı silme modal state'i
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    logId: '',
    isLoading: false
  });

  // İş kaydı form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    project_code: '',
    client_name: '',
    contact_person: '',
    description: '',
    duration: '1.00',
    log_time: false
  });

  // Düzenleme modu için state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string>('');

  // İş kayıtları listesi
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [activeLog, setActiveLog] = useState<WorkLog | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Tarih filtreleme için
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // İş takip sistemi için kullanıcının ayın 24'ünden sonraki ay 24'üne kadar tarih aralığını otomatik hesaplayan değişkenleri ekleyelim
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [workingDaysCount, setWorkingDaysCount] = useState<number>(0);
  const [workDays, setWorkDays] = useState<number>(0);
  const [weekendDays, setWeekendDays] = useState<number>(0);

  // Kullanıcı ayarlarını veritabanından getir
  const loadUserSettings = async (userId: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadığında
        console.error('Kullanıcı ayarları yüklenirken hata:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Kullanıcı ayarları yüklenirken hata:', error);
      return null;
    }
  };

  // Kullanıcı ayarlarını veritabanına kaydet veya güncelle
  const saveUserSettings = async (userId: string, settings: {
    start_date: string;
    end_date: string;
    filter_month: number;
    filter_year: number;
  }) => {
    if (!userId) return;

    try {
      // Önce kullanıcı ayarlarının var olup olmadığını kontrol et
      const existingSettings = await loadUserSettings(userId);

      if (existingSettings) {
        // Varsa güncelle
        const { error } = await supabase
          .from('user_settings')
          .update({
            start_date: settings.start_date,
            end_date: settings.end_date,
            filter_month: settings.filter_month,
            filter_year: settings.filter_year,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Yoksa yeni kayıt oluştur
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            start_date: settings.start_date,
            end_date: settings.end_date,
            filter_month: settings.filter_month,
            filter_year: settings.filter_year
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Kullanıcı ayarları kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  // İş kayıtlarını getirme fonksiyonu
  const loadWorkLogs = async (userId: string) => {
    if (!userId) return;
    
    // Tarih aralığını hesapla ve kayıtları getir
    calculateDateRange(filterMonth, filterYear);
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
          
          // Veritabanından kullanıcı ayarlarını getir
          const userSettings = await loadUserSettings(refreshedUserInfo.user.id);
          
          if (userSettings) {
            // Kayıtlı ayarlar varsa kullan
            setStartDate(userSettings.start_date);
            setEndDate(userSettings.end_date);
            setFilterMonth(userSettings.filter_month);
            setFilterYear(userSettings.filter_year);
            
            if (refreshedUserInfo.user?.id) {
              loadWorkLogsDateRange(refreshedUserInfo.user.id, userSettings.start_date, userSettings.end_date);
              calculateWorkDays(userSettings.start_date, userSettings.end_date);
            }
          } else {
            // Yoksa varsayılan tarih aralığını hesapla
            const defaultRange = calculateDefaultDateRange(filterMonth, filterYear);
            setStartDate(defaultRange.start);
            setEndDate(defaultRange.end);
            setWorkingDaysCount(defaultRange.workDays);
            
            // Varsayılan ayarları veritabanına kaydet
            if (refreshedUserInfo.user?.id) {
              saveUserSettings(refreshedUserInfo.user.id, {
                start_date: defaultRange.start,
                end_date: defaultRange.end,
                filter_month: filterMonth,
                filter_year: filterYear
              });
              
              loadWorkLogsDateRange(refreshedUserInfo.user.id, defaultRange.start, defaultRange.end);
            }
          }
        } else {
          // Kullanıcı bilgilerini sakla
          setUser(userInfo.user);
          
          // Veritabanından kullanıcı ayarlarını getir
          const userSettings = await loadUserSettings(userInfo.user.id);
          
          if (userSettings) {
            // Kayıtlı ayarlar varsa kullan
            setStartDate(userSettings.start_date);
            setEndDate(userSettings.end_date);
            setFilterMonth(userSettings.filter_month);
            setFilterYear(userSettings.filter_year);
            
            if (userInfo.user?.id) {
              loadWorkLogsDateRange(userInfo.user.id, userSettings.start_date, userSettings.end_date);
              calculateWorkDays(userSettings.start_date, userSettings.end_date);
            }
          } else {
            // Yoksa varsayılan tarih aralığını hesapla
            const defaultRange = calculateDefaultDateRange(filterMonth, filterYear);
            setStartDate(defaultRange.start);
            setEndDate(defaultRange.end);
            
            // Varsayılan ayarları veritabanına kaydet
            if (userInfo.user?.id) {
              saveUserSettings(userInfo.user.id, {
                start_date: defaultRange.start,
                end_date: defaultRange.end,
                filter_month: filterMonth,
                filter_year: filterYear
              });
              calculateDateRange(filterMonth, filterYear);
            }
          }
        }
        
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Form veri değişikliklerini işleme
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // İş kaydını düzenleme
  const handleEdit = (log: WorkLog) => {
    setFormData({
      date: log.date,
      project_code: log.project_code || '',
      client_name: log.client_name || '',
      contact_person: log.contact_person || '',
      description: log.description || '',
      duration: typeof log.duration === 'number' 
        ? log.duration.toFixed(2) 
        : log.duration.toString(),
      log_time: log.log_time || false
    });
    setEditMode(true);
    setEditId(log.id);
    
    // Formun olduğu bölüme scroll yap
    document.getElementById('new-worklog-form')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // İş kaydı ekleme veya güncelleme
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
      
      if (editMode) {
        // Kaydı güncelle
        const { error: updateError } = await supabase
          .from('work_logs')
          .update({
            date: formData.date,
            project_code: formData.project_code,
            client_name: formData.client_name,
            contact_person: formData.contact_person,
            description: formData.description,
            duration: formData.duration,
            log_time: formData.log_time,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);
          
        if (updateError) {
          console.error("İş kaydı güncellenirken DB hatası:", updateError);
          throw updateError;
        }
        
        toast.success('İş kaydı başarıyla güncellendi.');
        setEditMode(false);
        setEditId('');
      } else {
        // Yeni kayıt ekle
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
            log_time: formData.log_time,
            is_completed: true
          });
          
        if (insertError) {
          console.error("İş kaydı eklenirken DB hatası:", insertError);
          throw insertError;
        }
        
        toast.success('İş kaydı başarıyla eklendi.');
      }
      
      // Formu temizle (tarih hariç)
      setFormData({
        ...formData,
        date: new Date().toISOString().slice(0, 10),
        project_code: '',
        client_name: '',
        contact_person: '',
        description: '',
        duration: '1.00',
        log_time: false
      });
      
      // Kayıtları yenile - mevcut tarih aralığını koru
      if (userId) {
        loadWorkLogsDateRange(userId, startDate, endDate);
      }
      
    } catch (error) {
      console.error('İş kaydı işleminde hata:', error);
      toast.error(`İş kaydı ${editMode ? 'güncellenirken' : 'eklenirken'} bir hata oluştu.`);
    }
  };

  // İş kaydı ekleme formunda iptal
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId('');
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      project_code: '',
      client_name: '',
      contact_person: '',
      description: '',
      duration: '1.00',
      log_time: false
    });
  };

  // İş kaydını silme
  const handleDelete = async (id: string) => {
    setDeleteModal({
      isOpen: true,
      logId: id,
      isLoading: false
    });
  };

  // Silme işlemi onayı
  const handleDeleteConfirm = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));
      
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
        .eq('id', deleteModal.logId);
        
      if (error) throw error;
      
      toast.success('İş kaydı başarıyla silindi.');
      
      // Kayıtları yenile - mevcut tarih aralığını koru
      loadWorkLogsDateRange(userId, startDate, endDate);
    } catch (error) {
      console.error('İş kaydı silinirken hata:', error);
      toast.error('İş kaydı silinirken bir hata oluştu.');
    } finally {
      setDeleteModal({
        isOpen: false,
        logId: '',
        isLoading: false
      });
    }
  };

  // Ay-yıl seçimini işle
  const handleMonthYearChange = (month: number, year: number) => {
    setFilterMonth(month);
    setFilterYear(year);
    
    // 24'ünden 24'üne tarih aralığını hesapla
    calculateDateRange(month, year);
  };

  // 24'ünden 24'üne tarih aralığını hesaplayan fonksiyon
  const calculateDateRange = (month: number, year: number) => {
    const defaultRange = calculateDefaultDateRange(month, year);
    
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    setWorkingDaysCount(defaultRange.workDays);
    
    // İş kayıtlarını bu tarih aralığına göre yeniden yükle
    if (user?.id) {
      loadWorkLogsDateRange(user.id, defaultRange.start, defaultRange.end);
    }
  };

  // Varsayılan tarih aralığını hesaplayan fonksiyon (24'ünden 24'üne)
  const calculateDefaultDateRange = (month: number, year: number) => {
    // Ay başlangıç ve bitiş tarihleri (24'ünden 24'üne)
    let startMonth = month - 1;
    let startYear = year;
    
    if (startMonth === 0) {
      startMonth = 12;
      startYear = year - 1;
    }
    
    // Başlangıç: Önceki ayın 24'ü
    const start = new Date(startYear, startMonth - 1, 24);
    // Bitiş: Seçilen ayın 24'ü
    const end = new Date(year, month - 1, 24);
    
    // İş günlerini hesapla (hafta içi günler)
    let workDays = 0;
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0: Pazar, 6: Cumartesi
        workDays++;
      }
    }
    
    return {
      start: formatDateToYYYYMMDD(start),
      end: formatDateToYYYYMMDD(end),
      workDays
    };
  };

  // İki tarih arasındaki iş günü sayısını hesapla
  const calculateWorkDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let workDays = 0;
    
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0: Pazar, 6: Cumartesi
        workDays++;
      }
    }
    
    setWorkingDaysCount(workDays);
    return workDays;
  };

  // Belirli tarih aralığına göre iş kayıtlarını getir
  const loadWorkLogsDateRange = async (userId: string, start: string, end: string) => {
    if (!userId) return;
    
    try {
      setLoadingLogs(true);
      
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });
        
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

  // Mevcut ay için toplam çalışma bilgisini hesapla
  const calculateMonthlyStats = () => {
    if (!workLogs.length) return { 
      totalHours: 0, 
      percentage: 0, 
      workDays: workingDaysCount, 
      totalDays: 0,
      uniqueDays: 0
    };
    
    // Toplam çalışma süresi
    const totalHours = workLogs.reduce((sum, log) => sum + parseFloat(String(log.duration)), 0);
    
    // Kayıt yapılan benzersiz günler - tarih formatını düzgün karşılaştır
    const uniqueDatesSet = new Set(workLogs.map(log => {
      return log.date.includes('T') ? log.date.split('T')[0] : log.date;
    }));
    const uniqueDays = uniqueDatesSet.size;
    
    // Yüzde hesapla (iş günü tamamlama yüzdesi)
    const percentage = workingDaysCount > 0 ? (uniqueDays / workingDaysCount) * 100 : 0;
    
    return {
      totalHours,
      workDays: workingDaysCount,
      uniqueDays,
      totalDays: 0,
      percentage
    };
  };

  // Tarih formatını YYYY-MM-DD şeklinde döndüren yardımcı fonksiyon
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const stats = calculateMonthlyStats();

  // Ay isimleri
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handleCustomDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    
    // Başlangıç ayını Calendar bileşeninde göstermek için
    // filterMonth ve filterYear değerlerini güncelle
    const startDate = new Date(start);
    const startMonth = startDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    
    // Filtre ayını güncelle (takvimde görünmesi için)
    if (startMonth !== filterMonth || startYear !== filterYear) {
      setFilterMonth(startMonth);
      setFilterYear(startYear);
    }
    
    // Veritabanına kaydet
    if (user?.id) {
      saveUserSettings(user.id, {
        start_date: start,
        end_date: end,
        filter_month: startMonth,
        filter_year: startYear
      });
      
      loadWorkLogsDateRange(user.id, start, end);
      calculateWorkDays(start, end);
    }
    
    // Modal'ı kapat
    document.getElementById('custom-date-range-modal')?.classList.add('hidden');
  };

  // Tarih seçildiğinde çalışacak fonksiyon
  const handleDateSelect = (date: string) => {
    setFormData({
      ...formData,
      date
    });
    // Formun olduğu bölüme scroll yap
    document.getElementById('new-worklog-form')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Oturum kontrolü yapılana kadar yükleniyor göster
  if (loading) {
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
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5 sticky top-24">
                <h3 className="text-lg font-medium text-white mb-4">Profil Menüsü</h3>
                <nav className="space-y-1">
                  <Link href="/profile" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700/30 hover:text-white rounded-md">
                    <i className="ri-user-line mr-3 text-gray-400"></i>
                    <span>Profil Bilgilerim</span>
                  </Link>
                  <Link href="/profile/work-logs" className="flex items-center px-3 py-2 text-white bg-gray-800/50 rounded-md">
                    <i className="ri-time-line mr-3 text-purple-400"></i>
                    <span>İş Takibi</span>
                  </Link>
                  <Link href="/profile/reports" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700/30 hover:text-white rounded-md">
                    <i className="ri-bar-chart-2-line mr-3 text-gray-400"></i>
                    <span>Raporlar</span>
                  </Link>
                </nav>
              </div>
            </div>
            
            <div className="md:col-span-9">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">İş Takip Sistemi</h1>
                <p className="text-gray-400">Çalışma saatlerinizi ve projelerinizi takip edin.</p>
              </div>
              
              <div className="space-y-8">
                {/* Ay/Yıl seçici */}
                <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
                  <h2 className="text-lg font-medium text-white">Aylık İstatistikler</h2>
                  
                  <div className="flex gap-2">
                    <select 
                      value={filterMonth}
                      onChange={(e) => handleMonthYearChange(parseInt(e.target.value), filterYear)}
                      className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {new Date(0, month - 1).toLocaleString('tr-TR', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      value={filterYear}
                      onChange={(e) => handleMonthYearChange(filterMonth, parseInt(e.target.value))}
                      className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* İstatistikler */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
                    <div className="flex flex-col space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-1">Toplam Çalışma</p>
                        <p className="text-2xl font-bold text-white">{stats.totalHours} <span className="text-sm text-gray-400">birim</span></p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-1">Çalışma Günleri</p>
                        <p className="text-2xl font-bold text-white">{stats.uniqueDays} <span className="text-sm text-gray-400">/ {stats.workDays} gün</span></p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-1">Tamamlanma Oranı</p>
                        <p className="text-2xl font-bold text-white">{stats.percentage.toFixed(0)}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-400">Tarih Aralığı</p>
                          <button 
                            onClick={() => document.getElementById('custom-date-range-modal')?.classList.remove('hidden')}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            Değiştir
                          </button>
                        </div>
                        <p className="text-sm font-bold text-white">{startDate.split('-').reverse().join('/')} - {endDate.split('-').reverse().join('/')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Takvim Komponenti */}
                  <div className="sm:col-span-2">
                    {loadingLogs ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="loader"></div>
                      </div>
                    ) : (
                      <Calendar 
                        month={filterMonth} 
                        year={filterYear}
                        workLogs={workLogs}
                        onSelectDate={handleDateSelect}
                        startDate={startDate}
                        endDate={endDate}
                        onMonthChange={(month, year) => {
                          setFilterMonth(month);
                          setFilterYear(year);
                        }}
                        currentMonth={filterMonth}
                        currentYear={filterYear}
                      />
                    )}
                  </div>
                </div>
                
                {/* Form ve liste */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* İş kaydı formu */}
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5" id="new-worklog-form">
                    <h2 className="text-lg font-medium text-white mb-4">
                      {editMode ? 'İş Kaydını Düzenle' : 'Yeni İş Kaydı Ekle'}
                    </h2>
                    
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Proje / Bölüm</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Danışman</label>
                        <input
                          type="text"
                          name="client_name"
                          value={formData.client_name}
                          onChange={handleChange}
                          placeholder="Danışman adı girin"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Kontak Kişi</label>
                        <input
                          type="text"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder="Kontak kişi girin"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Yapılan İş / Problem&Çözüm</label>
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
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Süre (Birim)</label>
                        <div className="relative rounded-md">
                          <input
                            type="text"
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={(e) => {
                              let value = e.target.value;
                              
                              // Sadece sayılar ve nokta karakterine izin ver
                              if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
                                // Boş ise duration'ı boş string olarak ayarla
                                if (value === '') {
                                  setFormData({
                                    ...formData,
                                    duration: ''
                                  });
                                  return;
                                }
                                
                                // Sayısal değer kontrolü
                                const numValue = parseFloat(value);
                                
                                // Geçerli bir sayı ise ve 1'den küçük veya eşitse kaydet
                                if (!isNaN(numValue) && numValue <= 1) {
                                  setFormData({
                                    ...formData,
                                    duration: value
                                  });
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Input boş ise veya geçersiz bir değer ise minimum değere ayarla
                              if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                setFormData({
                                  ...formData,
                                  duration: '0.01'
                                });
                                return;
                              }
                              
                              // Sayısal değere çevir
                              let numValue = parseFloat(e.target.value);
                              
                              // 0.01'den küçükse minimum değere ayarla
                              if (numValue < 0.01) numValue = 0.01;
                              // 1'den büyükse maksimum değere ayarla
                              if (numValue > 1) numValue = 1;
                              
                              // İki ondalık basamağa yuvarla ve string'e çevir
                              const formattedValue = numValue.toFixed(2);
                              
                              setFormData({
                                ...formData,
                                duration: formattedValue
                              });
                            }}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                            placeholder="Örn: 0.25, 0.50, 1.00"
                            style={{ appearance: 'textfield', MozAppearance: 'textfield' }}
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            0.01 ile 1.00 arasında değerler girebilirsiniz (örn: 0.10, 0.25, 0.50, 0.75)
                          </div>
                        </div>
                      </div>
                      
                      {/* Log Time Alanı */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="log_time"
                          checked={formData.log_time}
                          onChange={(e) => setFormData({ ...formData, log_time: e.target.checked })}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <label htmlFor="log_time" className="ml-2 text-sm text-gray-300">
                          Log Time
                        </label>
                      </div>
                      
                      <div className="pt-4 flex gap-3">
                        {editMode && (
                          <button 
                            type="button" 
                            onClick={handleCancelEdit}
                            className="w-1/2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                          >
                            İptal
                          </button>
                        )}
                        <button 
                          type="submit" 
                          className={`${editMode ? 'w-1/2' : 'w-full'} px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors`}
                        >
                          {editMode ? 'Güncelle' : 'İş Kaydı Ekle'}
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
                      <>
                        {/* Masaüstü görünüm */}
                        <div className="hidden md:block overflow-x-auto max-h-[400px] custom-scrollbar">
                          <table className="w-full table-fixed">
                            <thead className="bg-gray-800/70 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">Tarih</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proje / Bölüm</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[70px]">Süre</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-[70px]">Log Time</th>
                                <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider text-center w-[100px]">İşlemler</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                              {workLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-700/20">
                                  <td className="px-4 py-3 text-sm text-gray-200 w-[100px]">
                                    {new Date(log.date).toLocaleDateString('tr-TR')}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="text-white font-medium">{log.project_code}</div>
                                    <div className="text-gray-400 text-xs truncate max-w-[180px]">{log.description}</div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white w-[70px]">{parseFloat(String(log.duration)).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm text-center w-[70px]">
                                    {log.log_time ? (
                                      <span className="text-green-400">✓</span>
                                    ) : (
                                      <span className="text-red-400">✗</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center w-[100px]">
                                    <div className="flex justify-center space-x-3">
                                      <button 
                                        onClick={() => handleEdit(log)}
                                        className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-md p-1.5 transition-colors"
                                        title="Düzenle"
                                      >
                                        <i className="ri-edit-line"></i>
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(log.id)}
                                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-md p-1.5 transition-colors"
                                        title="Sil"
                                      >
                                        <i className="ri-delete-bin-line"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      
                        {/* Mobil görünüm - kart tasarımı (tamamen yeniden düzenlendi) */}
                        <div className="block md:hidden space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                          {workLogs.map((log) => (
                            <div key={log.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-sm text-gray-300 font-medium">{new Date(log.date).toLocaleDateString('tr-TR')}</div>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleEdit(log)}
                                    className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-md p-1.5 transition-colors"
                                  >
                                    <i className="ri-edit-line text-sm"></i>
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(log.id)}
                                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-md p-1.5 transition-colors"
                                  >
                                    <i className="ri-delete-bin-line text-sm"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="text-white font-medium mt-2">{log.project_code}</div>
                              <div className="text-gray-400 text-sm my-2">{log.description}</div>
                              <div className="flex justify-between items-center mt-3">
                                <div className="text-white text-sm font-medium inline-block bg-gray-700/50 px-2 py-1 rounded">
                                  {parseFloat(String(log.duration)).toFixed(2)} birim
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 text-sm">Log Time:</span>
                                  {log.log_time ? (
                                    <span className="text-green-400">✓</span>
                                  ) : (
                                    <span className="text-red-400">✗</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
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
      
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="İş Kaydını Sil"
        message="Bu iş kaydını silmek istediğinize emin misiniz?"
        confirmText="Evet, Sil"
        cancelText="İptal"
        isLoading={deleteModal.isLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Tarih aralığı seçme modal */}
      <div id="custom-date-range-modal" className="hidden fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative">
          <button 
            onClick={() => document.getElementById('custom-date-range-modal')?.classList.add('hidden')}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
          
          <h3 className="text-xl font-bold text-white mb-4">Tarih Aralığı Seçin</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Başlangıç Tarihi</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => {
                  if (new Date(e.target.value) <= new Date(endDate)) {
                    const newStartDate = e.target.value;
                    setStartDate(newStartDate);
                    
                    // Tarih aralığını hesapla ve veritabanına kaydet
                    if (user?.id) {
                      const date = new Date(newStartDate);
                      const month = date.getMonth() + 1;
                      const year = date.getFullYear();
                      
                      saveUserSettings(user.id, {
                        start_date: newStartDate,
                        end_date: endDate,
                        filter_month: month,
                        filter_year: year
                      });
                      
                      loadWorkLogsDateRange(user.id, newStartDate, endDate);
                      calculateWorkDays(newStartDate, endDate);
                      
                      // Başlangıç tarihinin ayını takvimde göster
                      if (month !== filterMonth || year !== filterYear) {
                        setFilterMonth(month);
                        setFilterYear(year);
                      }
                    }
                  } else {
                    toast.error('Başlangıç tarihi, bitiş tarihinden sonra olamaz.');
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bitiş Tarihi</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => {
                  if (new Date(startDate) <= new Date(e.target.value)) {
                    const newEndDate = e.target.value;
                    setEndDate(newEndDate);
                    
                    // Veritabanına kaydet
                    if (user?.id) {
                      saveUserSettings(user.id, {
                        start_date: startDate,
                        end_date: newEndDate,
                        filter_month: filterMonth,
                        filter_year: filterYear
                      });
                      
                      loadWorkLogsDateRange(user.id, startDate, newEndDate);
                      calculateWorkDays(startDate, newEndDate);
                    }
                  } else {
                    toast.error('Bitiş tarihi, başlangıç tarihinden önce olamaz.');
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              />
            </div>
            
            <div className="pt-4 flex justify-between">
              <button 
                onClick={() => {
                  // Mevcut ayın 24'ünden önceki ayın 24'üne olan varsayılan aralığı kullan
                  const defaultRange = calculateDefaultDateRange(filterMonth, filterYear);
                  handleCustomDateRange(defaultRange.start, defaultRange.end);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Varsayılana Döndür
              </button>
              
              <button 
                onClick={() => {
                  // Tarih aralığını uygula ve modal'ı kapat
                  if (user?.id) {
                    loadWorkLogsDateRange(user.id, startDate, endDate);
                    calculateWorkDays(startDate, endDate);
                  }
                  document.getElementById('custom-date-range-modal')?.classList.add('hidden');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 