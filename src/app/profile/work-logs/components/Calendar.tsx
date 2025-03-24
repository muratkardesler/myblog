import { useState, useEffect } from 'react';
import { WorkLog } from '../page';

interface CalendarProps {
  month: number;
  year: number;
  workLogs: WorkLog[];
  onSelectDate: (date: string) => void;
  startDate?: string; // 24'ünden başlayan tarih aralığı
  endDate?: string; // 24'üne kadar olan tarih aralığı
  onMonthChange: (month: number, year: number) => void;
  currentMonth: number;
  currentYear: number;
  onLeaveDay?: (date: string) => void; // İzinli gün ekleme fonksiyonu
}

// Özel Modal Bileşeni
const WeekendConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  date 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  date: Date;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Arka plan overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal içeriği */}
      <div className="relative bg-gray-800 rounded-xl shadow-xl p-6 w-[400px] border border-purple-500/20">
        <div className="flex items-start mb-4">
          <div className="mr-3 mt-1">
            <i className="ri-information-line text-yellow-400 text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              Hafta Sonu Çalışma Onayı
            </h3>
            <p className="text-gray-300 text-sm">
              {date.toLocaleDateString('tr-TR', { weekday: 'long' })} günü için çalışma kaydı eklemek üzeresiniz. 
              Hafta sonları genellikle çalışma günü değildir.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Yine de kayıt eklemek istiyor musunuz?
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            Evet, Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

// İzin Modal Bileşeni
const LeaveDayModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  date 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  date: Date;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-800 rounded-xl shadow-xl p-6 w-[400px] border border-blue-500/20">
        <div className="flex items-start mb-4">
          <div className="mr-3 mt-1">
            <i className="ri-calendar-event-line text-blue-400 text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              İzinli Gün İşlemi
            </h3>
            <p className="text-gray-300 text-sm">
              {date.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
              tarihini izinli gün olarak işaretlemek istediğinize emin misiniz?
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            İzinli Gün Olarak İşaretle
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Calendar({ month, year, workLogs, onSelectDate, startDate, endDate, onMonthChange, currentMonth, currentYear, onLeaveDay }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<{ 
    date: Date; 
    hasLog: boolean; 
    duration: number; 
    hasFullDuration: boolean;
    isInRange: boolean; // 24'ünden 24'üne aralığında mı?
    isLeaveDay?: boolean; // İzinli gün kontrolü
  }[]>([]);
  const [displayMode, setDisplayMode] = useState<'current' | 'previous'>('current');
  const [weekendModal, setWeekendModal] = useState<{
    isOpen: boolean;
    date: Date | null;
  }>({
    isOpen: false,
    date: null
  });

  const [leaveModal, setLeaveModal] = useState<{
    isOpen: boolean;
    date: Date | null;
  }>({
    isOpen: false,
    date: null
  });

  // Ay adları (Türkçe)
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Hafta günleri (Türkçe)
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'];

  // Başlangıç ve bitiş tarihlerini Date nesnelerine dönüştür (eğer varsa)
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  const handlePrevMonth = () => {
    // Eğer şu anki ayı gösteriyorsak ve bir başlangıç tarihi varsa, başlangıç tarihinin ayını göster
    if (displayMode === 'current' && startDateObj) {
      // Başlangıç tarihinin ay ve yılını al
      const startMonth = startDateObj.getMonth() + 1;
      const startYear = startDateObj.getFullYear();
      
      // Eğer başlangıç tarihi farklı bir ayda ise, o aya geç
      if (startMonth !== currentMonth || startYear !== currentYear) {
        onMonthChange(startMonth, startYear);
        setDisplayMode('previous');
      } else {
        // Başlangıç tarihi aynı ayda ise, bir önceki aya geç
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        onMonthChange(prevMonth, prevYear);
        setDisplayMode('previous');
      }
    } else {
      // Seçili aya geri dön
      if (displayMode === 'previous') {
        onMonthChange(month, year);
        setDisplayMode('current');
      } else {
        // Normal önceki ay davranışı
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        onMonthChange(prevMonth, prevYear);
        setDisplayMode('previous');
      }
    }
  };

  const handleNextMonth = () => {
    if (displayMode === 'previous') {
      onMonthChange(month, year);
      setDisplayMode('current');
    } else {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      onMonthChange(nextMonth, nextYear);
    }
  };

  useEffect(() => {
    const generateCalendarDays = () => {
      // Seçilen ay veya önceki ay
      const calendarMonth = currentMonth;
      const calendarYear = currentYear;
      
      // Gösterilen ayın son günü
      const lastDay = new Date(calendarYear, calendarMonth, 0);
      const daysInMonth = lastDay.getDate();
      
      // Takvimde gösterilecek günleri oluştur
      const days = [];
      
      // Sadece gösterilen ayın günlerini ekle
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(calendarYear, calendarMonth - 1, i);
        // ISO formatı YYYY-MM-DD olmalı ve yerel saati dikkate almamalı
        const dateString = formatDateToYYYYMMDD(currentDate);
        
        // Bu tarihte kayıt var mı kontrolü - tarih formatını doğru şekilde karşılaştır
        const logsOnThisDay = workLogs.filter(log => {
          const logDate = log.date.includes('T') 
            ? log.date.split('T')[0] 
            : log.date;
          return logDate === dateString;
        });
        
        // İzinli gün kontrolü
        const isLeaveDay = logsOnThisDay.some(log => log.is_leave_day);
        
        // Günün toplam duration değerini hesapla ve yuvarla
        const totalDuration = Number(logsOnThisDay.reduce((total, log) => {
          const duration = typeof log.duration === 'string' ? parseFloat(log.duration) : log.duration;
          return total + duration;
        }, 0).toFixed(2));
        
        // Duration değeri tam 1.00 mi kontrol et (yuvarlama hatalarını önlemek için)
        const hasFullDurationLog = logsOnThisDay.some(log => {
          const duration = typeof log.duration === 'string' ? parseFloat(log.duration) : log.duration;
          return Number(duration.toFixed(2)) === 1.00;
        });
        
        // Tarih aralığında mı kontrol et
        const isInRange = isDateInRange(currentDate, startDateObj, endDateObj);
        
        days.push({
          date: currentDate,
          hasLog: logsOnThisDay.length > 0,
          duration: totalDuration,
          hasFullDuration: hasFullDurationLog || Number(totalDuration.toFixed(2)) === 1.00,
          isInRange,
          isLeaveDay
        });
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentMonth, currentYear, workLogs, startDate, endDate]);

  // İki tarih arasında mı kontrol et
  const isDateInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return true; // Tarih aralığı belirlenmemişse tüm günler gösterilsin
    
    // Sadece gün, ay ve yıl için karşılaştırma yap (saat, dakika, saniye olmadan)
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    // Başlangıç ve bitiş tarihlerini dahil et (>= ve <= kullanarak)
    return d >= s && d <= e;
  };

  // Tarih formatını YYYY-MM-DD şeklinde döndüren yardımcı fonksiyon
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Gün tıklandığında çalışacak fonksiyon
  const handleDayClick = (date: Date, isInRange: boolean) => {
    // Sadece tarih aralığı içindeki günlere tıklanabilsin
    if (isInRange) {
      // Hafta sonu kontrolü (6=Cumartesi, 0=Pazar)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
      
      if (isWeekend) {
        // Modal'ı aç
        setWeekendModal({
          isOpen: true,
          date: date
        });
      } else {
        // Normal iş günü - direkt tarihi seç
        onSelectDate(formatDateToYYYYMMDD(date));
      }
    }
  };

  return (
    <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
      {/* Ay/Yıl Başlığı */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevMonth}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/30"
        >
          <i className="ri-arrow-left-s-line text-xl"></i>
        </button>
        
        <h2 className="text-lg font-medium text-white">
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>
        
        <button 
          onClick={handleNextMonth}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/30"
        >
          <i className="ri-arrow-right-s-line text-xl"></i>
        </button>
      </div>
      
      {/* Hafta Günleri */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Takvim Günleri */}
      <div className="grid grid-cols-7 gap-1">
        {/* İlk günün haftanın hangi gününe denk geldiğini hesapla */}
        {Array.from({ length: (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7 }).map((_, index) => (
          <div key={`empty-start-${index}`} className="aspect-square"></div>
        ))}
        
        {calendarDays.map((day, index) => {
          const dayOfWeek = day.date.getDay();
          const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
          
          return (
            <div 
              key={index}
              onClick={() => {
                if (isWeekend) {
                  setWeekendModal({
                    isOpen: true,
                    date: day.date
                  });
                } else {
                  handleDayClick(day.date, day.isInRange);
                }
              }}
              onDoubleClick={() => {
                if (day.isInRange && !isWeekend) {
                  setLeaveModal({
                    isOpen: true,
                    date: day.date
                  });
                }
              }}
              className={`
                aspect-square p-1 relative cursor-pointer
                ${day.isInRange ? 'hover:bg-gray-700/30' : 'opacity-50 cursor-not-allowed'}
                ${isWeekend ? 'border border-red-500/30' : ''}
                ${day.isInRange ? 'border-2 border-green-500/30' : ''}
              `}
            >
              <div className={`
                w-full h-full rounded-lg flex flex-col items-center justify-center
                ${day.isLeaveDay ? 'bg-blue-500/20 border border-blue-500/30' : 
                  day.hasLog ? (day.hasFullDuration ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-yellow-500/20 border border-yellow-500/30') : 
                  'bg-gray-800/50 border border-gray-700/30'}
                ${isWeekend ? 'text-red-400' : day.isLeaveDay ? 'text-blue-400' : 'text-white'}
              `}>
                <span className={`text-sm font-medium ${isWeekend ? 'text-red-400' : day.isLeaveDay ? 'text-blue-400' : ''}`}>
                  {day.date.getDate()}
                </span>
                {day.hasLog && !day.isLeaveDay && (
                  <span className="text-xs mt-1">
                    {day.duration.toFixed(2)}
                  </span>
                )}
                {!day.hasLog && isWeekend && (
                  <i className="ri-rest-time-line text-xs mt-1"></i>
                )}
                {day.isLeaveDay && (
                  <i className="ri-calendar-event-line text-xs mt-1 text-blue-400"></i>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Açıklama */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <i className="ri-checkbox-circle-line text-purple-400"></i>
          <span className="text-gray-300">1.00 birim tamamlanan günler</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-time-line text-yellow-400"></i>
          <span className="text-gray-300">Kısmi çalışma günleri</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-rest-time-line text-red-400"></i>
          <span className="text-gray-300">Hafta sonu tatil günleri</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-calendar-event-line text-blue-400"></i>
          <span className="text-gray-300">İzinli günler</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-checkbox-blank-line text-green-400"></i>
          <span className="text-gray-300">Seçili tarih aralığı</span>
        </div>
      </div>

      {/* Hafta Sonu Onay Modalı */}
      <WeekendConfirmModal
        isOpen={weekendModal.isOpen}
        onClose={() => setWeekendModal({ isOpen: false, date: null })}
        onConfirm={() => {
          if (weekendModal.date) {
            handleDayClick(weekendModal.date, true);
          }
          setWeekendModal({ isOpen: false, date: null });
        }}
        date={weekendModal.date || new Date()}
      />

      {/* İzin Günü Modalı */}
      <LeaveDayModal
        isOpen={leaveModal.isOpen}
        onClose={() => setLeaveModal({ isOpen: false, date: null })}
        onConfirm={() => {
          if (leaveModal.date && onLeaveDay) {
            onLeaveDay(formatDateToYYYYMMDD(leaveModal.date));
          }
          setLeaveModal({ isOpen: false, date: null });
        }}
        date={leaveModal.date || new Date()}
      />
    </div>
  );
} 