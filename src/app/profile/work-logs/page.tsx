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
import { CheckIcon, XMarkIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  is_leave_day?: boolean; // İzinli gün kontrolü
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
    client_name: user?.full_name || '',
    contact_person: '',
    description: '',
    duration: '1.00',
    log_time: false,
    is_leave_day: false // İzinli gün kontrolü eklendi
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
      
      // Aktif çalışma var mı kontrol et (izinli günler hariç)
      const activeWorkLog = data?.find(log => log.end_time === null && !log.is_leave_day);
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

  // useEffect ile kullanıcı bilgileri değiştiğinde sadece danışman alanını güncelle
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        client_name: user.full_name || ''
      }));
    }
  }, [user]);

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
    setEditMode(true);
    setEditId(log.id);
    setFormData({
      date: log.date.split('T')[0],
      project_code: log.project_code,
      client_name: log.client_name || user?.full_name || '',
      contact_person: log.contact_person || user?.full_name || '',
      description: log.description,
      duration: String(log.duration),
      log_time: log.log_time,
      is_leave_day: log.is_leave_day || false
    });
    
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
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
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
            is_leave_day: formData.is_leave_day,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);
          
        if (updateError) throw updateError;
        
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
            is_leave_day: formData.is_leave_day,
            is_completed: true
          });
          
        if (insertError) throw insertError;
        
        // O güne ait toplam süreyi hesapla
        const { data: dayLogs } = await supabase
          .from('work_logs')
          .select('duration')
          .eq('user_id', userId)
          .eq('date', formData.date);

        const totalDuration = (dayLogs || []).reduce((sum, log) => {
          return sum + parseFloat(String(log.duration));
        }, parseFloat(formData.duration));

        // Eğer toplam süre 1'e ulaşmadıysa aynı tarihi koru
        // 1'e ulaştıysa bir sonraki güne geç
        const currentDate = new Date(formData.date);
        const nextDate = totalDuration >= 1 
          ? new Date(currentDate.setDate(currentDate.getDate() + 1)) 
          : currentDate;

        // Formu temizle
        setFormData({
          date: nextDate.toISOString().slice(0, 10),
          project_code: '',
          client_name: user?.full_name || '',
          contact_person: '',
          description: '',
          duration: '1.00',
          log_time: false,
          is_leave_day: false
        });
        
        toast.success('İş kaydı başarıyla eklendi.');
      }
      
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
      client_name: user?.full_name || '',
      contact_person: '',
      description: '',
      duration: '1.00',
      log_time: false,
      is_leave_day: false
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

  // Mevcut ay için toplam çalışma bilgisini hesapla
  const calculateMonthlyStats = () => {
    if (!workLogs.length) return { 
      totalHours: 0, 
      percentage: 0, 
      workDays: workingDaysCount, 
      totalDays: 0,
      uniqueDays: 0
    };
    
    // İzinli olmayan günlerin kayıtlarını filtrele
    const nonLeaveLogs = workLogs.filter(log => !log.is_leave_day);
    
    // Toplam çalışma süresi (izinli günler hariç)
    const totalHours = nonLeaveLogs.reduce((sum, log) => sum + parseFloat(String(log.duration)), 0);
    
    // Kayıt yapılan benzersiz günler - izinli günler hariç
    const uniqueDatesSet = new Set(nonLeaveLogs.map(log => {
      return log.date.includes('T') ? log.date.split('T')[0] : log.date;
    }));
    const uniqueDays = uniqueDatesSet.size;
    
    // İzinli günleri say
    const leaveDays = new Set(workLogs.filter(log => log.is_leave_day).map(log => 
      log.date.includes('T') ? log.date.split('T')[0] : log.date
    )).size;
    
    // Yüzde hesapla (iş günü tamamlama yüzdesi) - izinli günler çalışma gününden düşülür
    const adjustedWorkDays = workingDaysCount - leaveDays;
    const percentage = adjustedWorkDays > 0 ? (uniqueDays / adjustedWorkDays) * 100 : 0;
    
    return {
      totalHours,
      workDays: adjustedWorkDays,
      uniqueDays,
      totalDays: 0,
      percentage: Math.min(percentage, 100) // Yüzde 100'ü geçmesin
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

  // İzinli gün ekleme fonksiyonu
  const handleLeaveDay = async (date: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        toast.error('Oturum bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }
      
      const userId = authData.user.id;
      
      // İzinli gün kaydını ekle
      const { error: insertError } = await supabase
        .from('work_logs')
        .insert({
          user_id: userId,
          date: date,
          project_code: 'İZİN',
          client_name: user?.full_name || '',
          contact_person: '',
          description: 'İzinli Gün',
          duration: '1.00',
          log_time: false,
          is_completed: true,
          is_leave_day: true
        });
        
      if (insertError) {
        console.error("İzinli gün eklenirken hata:", insertError);
        throw insertError;
      }
      
      toast.success('İzinli gün başarıyla eklendi.');
      
      // Kayıtları yenile
      loadWorkLogsDateRange(userId, startDate, endDate);
      
    } catch (error) {
      console.error('İzinli gün eklenirken hata:', error);
      toast.error('İzinli gün eklenirken bir hata oluştu.');
    }
  };

  // Tarih formatı fonksiyonu
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
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
              <div className="space-y-6 sticky top-24">
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
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
                        placeholder="örn: SAFİR"
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
                            
                            if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
                              if (value === '') {
                                setFormData({
                                  ...formData,
                                  duration: ''
                                });
                                return;
                              }
                              
                              const numValue = parseFloat(value);
                              
                              if (!isNaN(numValue) && numValue <= 1) {
                                setFormData({
                                  ...formData,
                                  duration: value
                                });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                              setFormData({
                                ...formData,
                                duration: '0.01'
                              });
                              return;
                            }
                            
                            let numValue = parseFloat(e.target.value);
                            
                            if (numValue < 0.01) numValue = 0.01;
                            if (numValue > 1) numValue = 1;
                            
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
                    
                    {/* Log Time ve İzinli Gün Alanları */}
                    <div className="flex items-center space-x-6">
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

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_leave_day"
                          checked={formData.is_leave_day}
                          onChange={(e) => {
                            const isLeaveDay = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              is_leave_day: isLeaveDay,
                              project_code: isLeaveDay ? 'İZİN' : '',
                              description: isLeaveDay ? 'İzinli Gün' : '',
                              duration: '1.00',
                              contact_person: ''
                            });
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="is_leave_day" className="ml-2 text-sm text-gray-300">
                          İzinli Gün
                        </label>
                      </div>
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
                
                {/* İstatistikler ve Takvim */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
                    <div className="flex flex-col space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-1">Toplam Çalışma</p>
                        <p className="text-2xl font-bold text-white">
                          {Number(stats.totalHours).toFixed(2)} <span className="text-sm text-gray-400">birim</span>
                        </p>
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
                        onLeaveDay={handleLeaveDay}
                      />
                    )}
                  </div>
                </div>
                
                {/* İş Kayıtları Listesi */}
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700/40">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
                            Tarih
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Proje / Bölüm
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[80px]">
                            Süre
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
                            Log Time
                          </th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-[100px]">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/40">
                        {workLogs.map((log, index) => (
                          <tr 
                            key={log.id} 
                            className={`hover:bg-gray-700/20 transition-colors ${
                              log.is_leave_day ? 'bg-blue-900/10' : 
                              index % 2 === 0 ? 'bg-gray-800/30' : ''
                            }`}
                          >
                            <td className="py-4 pl-6 pr-3 whitespace-nowrap w-[120px]">
                              <div className="text-sm text-gray-200">
                                {formatDate(log.date)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-white whitespace-nowrap">
                                  {log.project_code}
                                </span>
                                {!log.is_leave_day && log.description && (
                                  <span className="text-xs text-gray-400 mt-1 line-clamp-1">
                                    {log.description}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-[80px]">
                              <div className="text-sm text-gray-200">
                                {log.duration}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap w-[100px]">
                              <div className="flex justify-center">
                                {log.log_time ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    Evet
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    Hayır
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap w-[100px]">
                              <div className="flex justify-end items-center space-x-3">
                                <button
                                  onClick={() => handleEdit(log)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(log.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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