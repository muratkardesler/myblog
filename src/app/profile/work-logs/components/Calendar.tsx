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
}

export default function Calendar({ month, year, workLogs, onSelectDate, startDate, endDate, onMonthChange, currentMonth, currentYear }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<{ 
    date: Date; 
    hasLog: boolean; 
    duration: number; 
    hasFullDuration: boolean;
    isInRange: boolean; // 24'ünden 24'üne aralığında mı?
  }[]>([]);
  const [displayMode, setDisplayMode] = useState<'current' | 'previous'>('current');

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

      // Gösterilen ayın ilk günü
      const firstDay = new Date(calendarYear, calendarMonth - 1, 1);
      
      // Bir önceki ayın son günleri için ofseti hesapla (0=Pazar, 1=Pazartesi... olduğundan (firstDay.getDay() || 7) - 1 hesabı)
      const offset = (firstDay.getDay() || 7) - 1;
      
      // Gösterilen ayın son günü
      const lastDay = new Date(calendarYear, calendarMonth, 0);
      const daysInMonth = lastDay.getDate();
      
      // Takvimde gösterilecek günleri oluştur
      const days = [];
      
      // Önceki aydan gelen günler (dolgu)
      for (let i = 0; i < offset; i++) {
        const prevMonthLastDate = new Date(calendarYear, calendarMonth - 1, 0).getDate();
        const prevMonthDay = new Date(calendarYear, calendarMonth - 2, prevMonthLastDate - i);
        
        // ISO formatı YYYY-MM-DD
        const dateString = formatDateToYYYYMMDD(prevMonthDay);
        
        // Bu tarihte kayıt var mı kontrolü
        const logsOnThisDay = workLogs.filter(log => {
          const logDate = log.date.includes('T') 
            ? log.date.split('T')[0] 
            : log.date;
          return logDate === dateString;
        });
        
        // Günün toplam duration değerini hesapla
        const totalDuration = logsOnThisDay.reduce((total, log) => total + parseFloat(String(log.duration)), 0);
        
        // Duration değeri tam 1.00 mi kontrol et
        const hasFullDurationLog = logsOnThisDay.some(log => parseFloat(String(log.duration)) === 1.00);
        
        // Tarih aralığında mı kontrol et
        const isInRange = isDateInRange(prevMonthDay, startDateObj, endDateObj);
        
        days.unshift({ 
          date: prevMonthDay, 
          hasLog: logsOnThisDay.length > 0,
          duration: totalDuration,
          hasFullDuration: hasFullDurationLog || totalDuration === 1.00,
          isInRange
        });
      }
      
      // Gösterilen ayın günleri
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
        
        // Günün toplam duration değerini hesapla
        const totalDuration = logsOnThisDay.reduce((total, log) => total + parseFloat(String(log.duration)), 0);
        
        // Duration değeri tam 1.00 mi kontrol et
        const hasFullDurationLog = logsOnThisDay.some(log => parseFloat(String(log.duration)) === 1.00);
        
        // Tarih aralığında mı kontrol et
        const isInRange = isDateInRange(currentDate, startDateObj, endDateObj);
        
        days.push({
          date: currentDate,
          hasLog: logsOnThisDay.length > 0,
          duration: totalDuration,
          hasFullDuration: hasFullDurationLog || totalDuration === 1.00,
          isInRange
        });
      }
      
      // Sonraki aydan gelen günler (dolgu) - toplam 42 gün olacak şekilde (6 hafta)
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const nextMonthDay = new Date(calendarYear, calendarMonth, i);
        
        // ISO formatı YYYY-MM-DD
        const dateString = formatDateToYYYYMMDD(nextMonthDay);
        
        // Bu tarihte kayıt var mı kontrolü
        const logsOnThisDay = workLogs.filter(log => {
          const logDate = log.date.includes('T') 
            ? log.date.split('T')[0] 
            : log.date;
          return logDate === dateString;
        });
        
        // Günün toplam duration değerini hesapla
        const totalDuration = logsOnThisDay.reduce((total, log) => total + parseFloat(String(log.duration)), 0);
        
        // Duration değeri tam 1.00 mi kontrol et
        const hasFullDurationLog = logsOnThisDay.some(log => parseFloat(String(log.duration)) === 1.00);
        
        // Tarih aralığında mı kontrol et
        const isInRange = isDateInRange(nextMonthDay, startDateObj, endDateObj);
        
        days.push({ 
          date: nextMonthDay,
          hasLog: logsOnThisDay.length > 0,
          duration: totalDuration,
          hasFullDuration: hasFullDurationLog || totalDuration === 1.00,
          isInRange
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
      onSelectDate(formatDateToYYYYMMDD(date));
    }
  };

  // Takvim başlığı - şu an görüntülenen ay ve yıl
  const calendarTitle = `${monthNames[currentMonth - 1]} ${currentYear}`;
  
  // Tarih aralığı bilgisi (eğer her iki tarih de seçiliyse)
  const dateRangeInfo = startDateObj && endDateObj 
    ? `${startDateObj.getDate()} ${monthNames[startDateObj.getMonth()]} - ${endDateObj.getDate()} ${monthNames[endDateObj.getMonth()]}`
    : '';

  return (
    <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <button 
            onClick={handlePrevMonth}
            className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded mr-3"
          >
            {displayMode === 'current' && startDateObj ? 'Başlangıç Ayı' : 'Önceki Ay'}
          </button>
          <h2 className="text-lg font-medium text-white">Aylık Takvim</h2>
        </div>
        <div className="flex items-center">
          <div className="text-purple-300 font-medium">{calendarTitle}</div>
          {dateRangeInfo && <div className="text-xs text-gray-400 ml-3">{dateRangeInfo}</div>}
          <button 
            onClick={handleNextMonth}
            className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded ml-4"
          >
            {displayMode === 'previous' ? 'Şimdiki Ay' : 'Sonraki Ay'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {/* Haftanın günleri */}
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-gray-400 text-xs font-medium py-2">
            {day}
          </div>
        ))}
        
        {/* Takvim günleri */}
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.date.getMonth() === currentMonth - 1;
          const isToday = new Date().toDateString() === day.date.toDateString();
          
          return (
            <div 
              key={index} 
              onClick={() => handleDayClick(day.date, day.isInRange)}
              title={day.hasLog ? `${day.date.toLocaleDateString('tr-TR')} - ${day.duration} birim çalışma` : day.date.toLocaleDateString('tr-TR')}
              className={`
                relative p-2 text-center rounded-md transition-colors min-h-14
                ${isCurrentMonth ? 'bg-gray-800/40' : 'bg-gray-800/10 text-gray-500'}
                ${isToday ? 'ring-2 ring-purple-500' : ''}
                ${day.isInRange ? day.hasLog ? 'hover:bg-purple-500/10 cursor-pointer' : 'hover:bg-gray-700/20 cursor-pointer' : 'opacity-40'}
                ${day.isInRange ? 'ring-1 ring-green-500/30' : ''}
              `}
            >
              <div className="text-xs font-medium">{day.date.getDate()}</div>
              
              {day.hasLog && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className={`w-full h-full rounded-md ${day.hasFullDuration ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                </div>
              )}
              
              {day.hasLog && (
                <div className="relative z-10 flex items-center justify-center mt-1">
                  <div className="flex flex-col items-center text-xs">
                    {day.hasFullDuration ? (
                      <i className="ri-checkbox-circle-fill text-purple-400 text-lg"></i>
                    ) : (
                      <i className="ri-time-line text-yellow-400 text-lg"></i>
                    )}
                    {day.duration > 0 && (
                      <span className={`mt-1 font-medium ${day.hasFullDuration ? 'text-white' : 'text-yellow-300'}`}>
                        {day.duration}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center text-xs text-gray-400">
          <i className="ri-checkbox-circle-fill text-purple-400 mr-1"></i>
          <span>1.00 birim tamamlanan günler</span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <i className="ri-time-line text-yellow-400 mr-1"></i>
          <span>Kısmi çalışma günleri</span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <i className="ri-square-line text-green-400 mr-1"></i>
          <span>
            {startDateObj && endDateObj ? (
              `${startDateObj.getDate()} ${monthNames[startDateObj.getMonth()]} - ${endDateObj.getDate()} ${monthNames[endDateObj.getMonth()]} aralığı`
            ) : (
              'Seçili tarih aralığı'
            )}
          </span>
        </div>
      </div>
    </div>
  );
} 