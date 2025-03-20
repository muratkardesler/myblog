'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/supabase';
import * as XLSX from 'xlsx';

// İş kaydı tipi
interface WorkLog {
  id: string;
  user_id: string;
  date: string;
  project_code: string;
  client_name: string;
  contact_person: string;
  description: string;
  duration: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Rapor parametreleri
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedReport, setSelectedReport] = useState('monthly');
  
  // Rapor verileri
  const [reportData, setReportData] = useState<WorkLog[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    totalDays: 0,
    completedDays: 0,
    totalDuration: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Raporlar sayfası oturum kontrolü başladı");
        const { success, profile } = await getCurrentUser();

        if (!success || !profile) {
          console.log("Oturum bulunamadı, giriş sayfasına yönlendiriliyor");
          router.push('/auth/login');
          return;
        }

        console.log("Kullanıcı profili bulundu:", profile.full_name);
        setUser(profile as User);
        setAuthChecked(true);
        setLoading(false);
        
        // Kullanıcı bilgileri yüklendikten sonra rapor verilerini getir
        if (selectedReport === 'monthly') {
          loadMonthlyReport(profile.id);
        }
      } catch (error) {
        console.error('Profil verisi yüklenirken hata:', error);
        setLoading(false);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, selectedYear, selectedMonth, selectedReport]);

  // Aylık rapor verilerini getirme
  const loadMonthlyReport = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoadingReport(true);
      
      // Ay başlangıç ve bitiş tarihlerini hesapla
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      // İş kayıtlarını getir
      const { data: logs, error: logsError } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
        
      if (logsError) throw logsError;
      
      // Aylık istatistikleri hesaplamak için fonksiyonu çağır
      const { data: statsData, error: statsError } = await supabase
        .rpc('calculate_monthly_work', {
          p_user_id: userId,
          p_year: selectedYear,
          p_month: selectedMonth
        });
        
      if (statsError) {
        console.error('İstatistik hesaplanırken hata:', statsError);
        // İstatistik fonksiyonu hata verirse manuel hesapla
        calculateStats(logs || [], startDate, endDate);
      } else if (statsData && statsData.length > 0) {
        setMonthlyStats({
          totalDays: statsData[0].total_days || 0,
          completedDays: statsData[0].completed_days || 0,
          totalDuration: statsData[0].total_duration || 0,
          completionPercentage: statsData[0].completion_percentage || 0
        });
      }
      
      setReportData(logs || []);
    } catch (error) {
      console.error('Rapor verisi yüklenirken hata:', error);
      toast.error('Rapor verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoadingReport(false);
    }
  };

  // Manuel istatistik hesaplama (API fonksiyonu çalışmazsa)
  const calculateStats = (logs: WorkLog[], startDate: string, endDate: string) => {
    // İş günü sayısı (hafta içi günleri)
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workDays = 0;
    
    // Başlangıç ve bitiş tarihleri arasındaki her gün için kontrol
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      // Hafta içi mi? (0: Pazar, 6: Cumartesi)
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    
    // Toplam süre hesapla
    const totalDuration = logs.reduce((sum, log) => sum + parseFloat(String(log.duration)), 0);
    
    // Benzersiz günleri hesapla
    const uniqueDates = new Set(logs.map(log => log.date));
    const completedDays = uniqueDates.size;
    
    setMonthlyStats({
      totalDays: workDays,
      completedDays: completedDays,
      totalDuration: totalDuration,
      completionPercentage: workDays > 0 ? (completedDays / workDays) * 100 : 0
    });
  };

  // Excel raporu oluşturma ve indirme
  const handleExportExcel = () => {
    try {
      if (reportData.length === 0) {
        toast.error('İndirilecek rapor verisi bulunamadı.');
        return;
      }
      
      // Ay adını al
      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      const monthName = monthNames[selectedMonth - 1];
      
      // Excel için veri oluştur
      const workbook = XLSX.utils.book_new();
      
      // İstatistik sayfası oluştur
      const statsData = [
        ['Rapor Türü', 'Aylık İş Raporu'],
        ['Dönem', `${monthName} ${selectedYear}`],
        [''],
        ['Toplam İş Günü', monthlyStats.totalDays.toString()],
        ['Çalışılan Gün Sayısı', monthlyStats.completedDays.toString()],
        ['Toplam Çalışma Süresi', monthlyStats.totalDuration.toFixed(2)],
        ['Tamamlanma Oranı', `%${monthlyStats.completionPercentage.toFixed(0)}`]
      ];
      
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Özet');
      
      // İş detayları sayfası oluştur
      const excelData = reportData.map(log => ({
        'Tarih': new Date(log.date).toLocaleDateString('tr-TR'),
        'Proje Kodu': log.project_code,
        'Müşteri': log.client_name,
        'İletişim Kişisi': log.contact_person || '-',
        'Açıklama': log.description,
        'Süre (birim)': parseFloat(String(log.duration)).toFixed(2),
      }));
      
      const detailsSheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Detaylar');
      
      // Dosyayı indir
      XLSX.writeFile(workbook, `İş_Raporu_${user?.full_name.replace(' ', '_')}_${monthName}_${selectedYear}.xlsx`);
      toast.success('Rapor başarıyla indirildi.');
    } catch (error) {
      console.error('Excel dosyası oluşturulurken hata:', error);
      toast.error('Rapor oluşturulurken bir hata oluştu.');
    }
  };

  // Ay ve yıl değişikliklerini işleme
  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

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
                  <a 
                    href="/profile" 
                    className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                  >
                    <i className="ri-user-line mr-3 text-gray-400"></i>
                    <span>Profil Bilgilerim</span>
                  </a>
                  <a 
                    href="/profile/work-logs" 
                    className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                  >
                    <i className="ri-time-line mr-3 text-gray-400"></i>
                    <span>İş Takibi</span>
                  </a>
                  <a 
                    href="/profile/reports" 
                    className="flex items-center px-3 py-2 text-white bg-purple-500/20 rounded-lg"
                  >
                    <i className="ri-file-chart-line mr-3 text-purple-400"></i>
                    <span>Raporlar</span>
                  </a>
                </nav>
              </div>
            </div>

            {/* Sağ içerik - Raporlar */}
            <div className="lg:col-span-9">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h1 className="text-2xl font-bold text-white mb-6">Raporlar</h1>
                
                {/* Rapor kriterleri */}
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5 mb-8">
                  <h2 className="text-lg font-medium text-white mb-4">Rapor Kriterleri</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Rapor Türü</label>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                        value={selectedReport}
                        onChange={(e) => setSelectedReport(e.target.value)}
                      >
                        <option value="monthly">Aylık Rapor</option>
                        <option value="project" disabled>Proje Bazlı Rapor (Yakında)</option>
                        <option value="client" disabled>Müşteri Bazlı Rapor (Yakında)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Ay</label>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                        value={selectedMonth}
                        onChange={(e) => handleMonthYearChange(parseInt(e.target.value), selectedYear)}
                      >
                        {months.map((month, index) => (
                          <option key={index} value={index + 1}>{month}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Yıl</label>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                        value={selectedYear}
                        onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Rapor özeti */}
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5 mb-8">
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Rapor Özeti</h2>
                    
                    <button
                      onClick={handleExportExcel}
                      disabled={loadingReport || reportData.length === 0}
                      className="flex items-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-file-excel-2-line mr-2"></i>
                      Excel Olarak İndir
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Toplam İş Günü</p>
                      <p className="text-2xl font-bold text-white">{monthlyStats.totalDays}</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Çalışılan Günler</p>
                      <p className="text-2xl font-bold text-white">{monthlyStats.completedDays}</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Toplam Çalışma</p>
                      <p className="text-2xl font-bold text-white">{monthlyStats.totalDuration.toFixed(2)} <span className="text-sm text-gray-400">birim</span></p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-sm text-gray-400 mb-1">Tamamlanma Oranı</p>
                      <p className="text-2xl font-bold text-white">{monthlyStats.completionPercentage.toFixed(0)}%</p>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${monthlyStats.completionPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rapor detayları */}
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
                  <h2 className="text-lg font-medium text-white mb-4">Rapor Detayları</h2>
                  
                  {loadingReport ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : reportData.length > 0 ? (
                    <div className="overflow-auto max-h-[400px] custom-scrollbar">
                      <table className="min-w-full">
                        <thead className="bg-gray-800/70 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proje</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Müşteri</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Açıklama</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Süre</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                          {reportData.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-700/20">
                              <td className="px-4 py-3 text-sm text-gray-200">
                                {new Date(log.date).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">{log.project_code}</td>
                              <td className="px-4 py-3 text-sm text-gray-300">{log.client_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                <div className="truncate max-w-[250px]">{log.description}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-white">{parseFloat(String(log.duration)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-800/30 text-center py-8 px-4 rounded-lg">
                      <i className="ri-file-list-3-line text-4xl text-gray-500 mb-2"></i>
                      <p className="text-gray-400">Seçilen dönem için iş kaydı bulunmuyor.</p>
                    </div>
                  )}
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