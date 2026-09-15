import React from 'react';
import { DayShift, GROUPS_CONFIG, GroupId } from '../types';
import { Clock, UserCheck, AlertCircle } from 'lucide-react';

interface CalendarViewProps {
  shifts: DayShift[];
  year: number;
  month: number;
  isDark?: boolean;
  onDayClick?: (shift: DayShift) => void;
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  shifts,
  year,
  month,
  isDark = false,
  onDayClick,
}) => {
  // İlk günün haftanın hangi günü olduğunu bulalım (Pazartesi = 0 .. Pazar = 6)
  const firstDayDate = new Date(year, month, 1);
  let firstDayIndex = firstDayDate.getDay() - 1; // 0=Pzt..6=Paz
  if (firstDayIndex === -1) firstDayIndex = 6; // Pazar günüyse 6

  // Boş kutular
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isDark
          ? 'bg-[#111827]/95 border-slate-800 text-slate-100 shadow-2xl'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
      }`}
    >
      {/* Gün İsimleri Başlık */}
      <div
        className={`grid grid-cols-7 border-b text-center text-xs sm:text-sm font-black ${
          isDark ? 'border-slate-800 bg-[#0E1526]' : 'border-slate-200 bg-slate-100/90 text-slate-700'
        }`}
      >
        {WEEKDAYS.map((wd, index) => {
          const isSat = index === 5;
          const isSun = index === 6;
          const isWeekendCol = isSat || isSun;
          return (
            <div
              key={wd}
              className={`py-3 sm:py-3.5 border-r ${
                isSun
                  ? isDark
                    ? 'text-amber-100 bg-amber-500/35 border-amber-500/60 font-black'
                    : 'text-amber-950 bg-amber-300 border-amber-400 font-black'
                  : isSat
                  ? isDark
                    ? 'text-amber-200 bg-amber-500/25 border-amber-500/50 font-black'
                    : 'text-amber-950 bg-amber-200 border-amber-300 font-black'
                  : isDark
                  ? 'text-slate-300 border-slate-800'
                  : 'text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <span>{wd}</span>
                {isWeekendCol && (
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${
                    isDark ? 'text-amber-300' : 'text-amber-900'
                  }`}>
                    {isSun ? 'Tatil' : 'H.Sonu'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Takvim Izgarası */}
      <div
        className={`grid grid-cols-7 divide-x divide-y border-b ${
          isDark
            ? 'divide-slate-800/80 border-slate-800'
            : 'divide-slate-200/90 border-slate-200'
        }`}
      >
        {/* Ay başlangıcından önceki boşluklar */}
        {blankDays.map((b) => (
          <div
            key={`blank-${b}`}
            className={`min-h-[110px] sm:min-h-[125px] p-2 ${
              isDark ? 'bg-slate-900/40' : 'bg-slate-50/60'
            }`}
          />
        ))}

        {/* Günler */}
        {shifts.map((shift) => {
          const isWeekend = shift.isWeekend;
          const isSun = shift.date.getDay() === 0;
          // Günün görevli personellerinden hangi grupların çalıştığını bul
          const uniqueGroupIds = shift.dutyStaff.map(s => s.groupId).filter((value, index, self) => self.indexOf(value) === index) as GroupId[];

          return (
            <div
              key={shift.dayNumber}
              onClick={() => onDayClick && onDayClick(shift)}
              className={`min-h-[110px] sm:min-h-[125px] p-2.5 transition-colors flex flex-col justify-between ${
                isSun
                  ? isDark
                    ? 'bg-amber-950/45 hover:bg-amber-950/65 border-amber-500/40'
                    : 'bg-amber-100/90 hover:bg-amber-200/80 border-amber-300/80'
                  : isWeekend
                  ? isDark
                    ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/30'
                    : 'bg-amber-50 hover:bg-amber-100/70 border-amber-200/80'
                  : isDark
                  ? 'bg-[#111827] hover:bg-slate-800/50'
                  : 'bg-white hover:bg-slate-50'
              } ${onDayClick ? 'cursor-pointer' : ''}`}
            >
              {/* Gün Numarası ve İkon */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm sm:text-base font-black tabular-nums ${
                    isWeekend
                      ? isDark
                        ? 'text-amber-200'
                        : 'text-amber-950'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {shift.dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {isWeekend && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border shadow-2xs ${
                        isSun
                          ? isDark
                            ? 'bg-amber-500/35 text-amber-200 border-amber-500/50'
                            : 'bg-amber-300 text-amber-950 border-amber-400'
                          : isDark
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                          : 'bg-amber-200 text-amber-950 border-amber-300'
                      }`}
                    >
                      {isSun ? 'Pazar' : 'Cumartesi'}
                    </span>
                  )}
                  {shift.hasManualOverride && (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
              </div>

              {/* Görevli Grup ve Personeller */}
              <div className="space-y-1.5 my-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {uniqueGroupIds.map(grpId => {
                    const groupCfg = GROUPS_CONFIG[grpId];
                    if (!groupCfg) return null;
                    return (
                      <span
                        key={grpId}
                        className={`text-[11px] font-black px-2 py-0.5 rounded border ${groupCfg.badgeBg} ${groupCfg.badgeColor}`}
                      >
                        Grup {grpId} (24s)
                      </span>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  {shift.dutyStaff.map((st) => (
                    <div
                      key={st.id}
                      className={`text-xs font-bold flex items-center gap-1.5 truncate px-2 py-1 rounded-md border ${
                        isDark
                          ? 'text-white bg-slate-800/80 border-slate-700/60'
                          : 'text-slate-800 bg-slate-100 border-slate-200'
                      }`}
                      title={st.name}
                    >
                      <UserCheck className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate">{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt Bilgi: Vardiya Saati */}
              <div
                className={`pt-1 border-t flex items-center justify-between text-[10px] font-semibold ${
                  isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  07:30 - 07:30
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">ABC</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
