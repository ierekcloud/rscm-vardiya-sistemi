import React, { useState, useEffect } from 'react';
import { DayShift, GROUPS_CONFIG } from '../types';
import { Clock, Calendar as CalendarIcon, UserCheck, ShieldCheck } from 'lucide-react';
import { TURKISH_MONTHS } from '../utils/shiftLogic';

interface TodayLiveWidgetProps {
  shifts: DayShift[];
  selectedYear: number;
  selectedMonth: number;
  departmentName: string;
  isDark: boolean;
  onSelectDay?: (shift: DayShift) => void;
}

export const TodayLiveWidget: React.FC<TodayLiveWidgetProps> = ({
  shifts,
  selectedYear,
  selectedMonth,
  departmentName,
  isDark,
  onSelectDay,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Bugünün gün numarasını belirle (seçili ay/yıl şimdiki zamanla örtüşüyorsa gerçek gün, değilse ayın ilk günü)
  const isCurrentRealMonth =
    currentTime.getFullYear() === selectedYear && currentTime.getMonth() === selectedMonth;
  const activeDayNumber = isCurrentRealMonth ? currentTime.getDate() : 1;

  const activeShift = shifts.find((s) => s.dayNumber === activeDayNumber) || shifts[0];
  const dutyGroupCfg = activeShift ? GROUPS_CONFIG[activeShift.dutyGroupId] : null;

  // Formatlı tarih
  const formattedLiveDate = currentTime.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedLiveTime = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
        isDark
          ? 'bg-[#111827]/95 border-slate-800 text-slate-100 shadow-2xl'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Sol Kolon: Canlı Tarih & Saat */}
          <div
            className={`lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r pb-4 lg:pb-0 lg:pr-5 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                Canlı Tarih & Sistem Saati
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums font-mono ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formattedLiveTime}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Canlı Zaman
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <CalendarIcon className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {formattedLiveDate}
              </span>
            </div>
          </div>

          {/* Orta Kolon: Bugünün Nöbetçi Personelleri ve Vardiya Döngüsü */}
          <div
            className={`lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r pb-4 lg:pb-0 lg:pr-5 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isDark ? 'text-indigo-400' : 'text-indigo-700'
                }`}
              >
                Günün Nöbetçi Grubu (07:30 - 07:30)
              </span>
              {activeShift && dutyGroupCfg && (
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${dutyGroupCfg.badgeBg} ${dutyGroupCfg.badgeColor}`}
                >
                  Grup {activeShift.dutyGroupId} (ABC)
                </span>
              )}
            </div>

            {activeShift ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeShift.dutyStaff.map((st) => (
                    <div
                      key={st.id}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        isDark
                          ? 'bg-slate-800/90 text-white border-slate-700'
                          : 'bg-slate-100 text-slate-900 border-slate-200'
                      }`}
                      title={st.name}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{st.name}</span>
                      <span
                        className={`text-[9px] font-black px-1 rounded ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        ABC
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className={`text-[11px] font-medium flex items-center gap-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{departmentName} birimi 24 saat kesintisiz hizmet vermektedir.</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Vardiya bilgisi yükleniyor...</div>
            )}
          </div>

          {/* Sağ Kolon: Günlük Mini Takvim Şeridi */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                {TURKISH_MONTHS[selectedMonth]} {selectedYear} Günlük Takvim
              </span>
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                Güne tıklayıp inceleyin
              </span>
            </div>

            {/* Yatay Kaydırılabilir Gün Şeridi */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
              {shifts.map((s) => {
                const isSelected = s.dayNumber === activeDayNumber;
                const isWeekend = s.isWeekend;

                return (
                  <button
                    key={s.dayNumber}
                    type="button"
                    onClick={() => onSelectDay && onSelectDay(s)}
                    className={`shrink-0 w-10 py-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40 scale-105'
                        : isWeekend
                        ? isDark
                          ? 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/40'
                          : 'bg-amber-100 border-amber-300 text-amber-950 hover:bg-amber-200'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase leading-none">
                      {s.dayName.slice(0, 3)}
                    </span>
                    <span className="text-xs sm:text-sm font-black tabular-nums leading-none mt-1">
                      {s.dayNumber}
                    </span>
                    <span
                      className={`text-[9px] font-black mt-0.5 leading-none ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {s.dutyGroupId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
