import React, { useState } from 'react';
import { DayShift, GROUPS_CONFIG, GroupId } from '../types';
import { Clock, UserCheck, Search } from 'lucide-react';

interface DailyListViewProps {
  shifts: DayShift[];
  isDark?: boolean;
  onDayClick?: (shift: DayShift) => void;
}

export const DailyListView: React.FC<DailyListViewProps> = ({
  shifts,
  isDark = false,
  onDayClick,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'weekend' | GroupId>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShifts = shifts.filter((s) => {
    if (filterType === 'weekend' && !s.isWeekend) return false;
    if (filterType !== 'all' && filterType !== 'weekend' && s.dutyGroupId !== filterType) return false;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchesStaff = s.dutyStaff.some((st) => st.name.toLowerCase().includes(query));
      const matchesDay = s.dayName.toLowerCase().includes(query) || String(s.dayNumber).includes(query);
      if (!matchesStaff && !matchesDay) return false;
    }

    return true;
  });

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isDark
          ? 'bg-[#111827]/95 border-slate-800 text-slate-100 shadow-2xl'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
      }`}
    >
      {/* Filtre ve Arama Çubuğu */}
      <div
        className={`p-3.5 sm:p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-[#0E1526]' : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              placeholder="Personel veya gün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 text-white placeholder-slate-400'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-2xs'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Tüm Günler ({shifts.length})
          </button>
          <button
            onClick={() => setFilterType('weekend')}
            className={`text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
              filterType === 'weekend'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Hafta Sonu
          </button>
          {(['A', 'B', 'C', 'D'] as GroupId[]).map((grp) => (
            <button
              key={grp}
              onClick={() => setFilterType(grp)}
              className={`text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
                filterType === grp
                  ? isDark
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Grup {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Günlük Liste */}
      <div className={`divide-y max-h-[600px] overflow-y-auto custom-scrollbar ${
        isDark ? 'divide-slate-800/70' : 'divide-slate-200/90'
      }`}>
        {filteredShifts.map((shift) => {
          const grpCfg = GROUPS_CONFIG[shift.dutyGroupId];

          return (
            <div
              key={shift.dayNumber}
              onClick={() => onDayClick && onDayClick(shift)}
              className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                shift.isWeekend
                  ? isDark
                    ? 'bg-amber-950/35 hover:bg-amber-950/55 border-l-4 border-l-amber-500'
                    : 'bg-amber-100/70 hover:bg-amber-100 border-l-4 border-l-amber-500'
                  : isDark
                  ? 'hover:bg-slate-800/40'
                  : 'hover:bg-slate-50'
              } ${onDayClick ? 'cursor-pointer' : ''}`}
            >
              {/* Tarih ve Gün */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 tabular-nums border shadow-2xs ${
                    shift.date.getDay() === 0
                      ? isDark
                        ? 'bg-amber-500/35 text-amber-200 font-black border-amber-500/50'
                        : 'bg-amber-300 text-amber-950 font-black border-amber-400'
                      : shift.date.getDay() === 6
                      ? isDark
                        ? 'bg-amber-500/25 text-amber-200 font-black border-amber-500/40'
                        : 'bg-amber-200 text-amber-950 font-black border-amber-300'
                      : isDark
                      ? 'bg-slate-800 text-slate-200 font-semibold border-slate-700'
                      : 'bg-slate-100 text-slate-800 font-semibold border-slate-200'
                  }`}
                >
                  <span className="text-sm leading-none font-black">{shift.dayNumber}</span>
                  <span className="text-[9px] font-black uppercase leading-none mt-0.5">
                    {shift.dayName.slice(0, 3)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${
                      shift.isWeekend
                        ? isDark ? 'text-amber-200' : 'text-amber-950'
                        : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {shift.dayNumber} {shift.date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`text-xs font-semibold ${
                      shift.isWeekend
                        ? isDark ? 'text-amber-400' : 'text-amber-800'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      ({shift.dayName})
                    </span>
                    {shift.date.getDay() === 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border shadow-2xs ${
                        isDark ? 'bg-amber-500/35 text-amber-200 border-amber-500/50' : 'bg-amber-300 text-amber-950 border-amber-400'
                      }`}>
                        Pazar (Tatil)
                      </span>
                    )}
                    {shift.date.getDay() === 6 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border shadow-2xs ${
                        isDark ? 'bg-amber-500/25 text-amber-200 border-amber-500/40' : 'bg-amber-200 text-amber-950 border-amber-300'
                      }`}>
                        Cumartesi
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-[11px] mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>24 Saat ABC Nöbeti (07:30 - Ertesi Sabah 07:30)</span>
                  </div>
                </div>
              </div>

              {/* Nöbetçi Grup ve Personeller */}
              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  <span className={`text-[11px] font-bold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Nöbetçi:
                  </span>
                  {shift.dutyStaff.map((st) => (
                    <span
                      key={st.id}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                      {st.name}
                    </span>
                  ))}
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 ${grpCfg.badgeBg} ${grpCfg.badgeColor}`}
                  >
                    ABC ({shift.dutyGroupId})
                  </span>
                </div>

                {/* Eksik Gün Denkleştirme Nöbeti */}
                {shift.supportGroupId && shift.supportStaff && (
                  <div className={`flex items-center gap-2 flex-wrap sm:justify-end px-2.5 py-1 rounded-lg border ${
                    isDark
                      ? 'bg-sky-950/40 border-sky-500/30'
                      : 'bg-sky-50 border-sky-200'
                  }`}>
                    <span className={`text-[11px] font-bold ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                      Denkleştirme (ABC):
                    </span>
                    {shift.supportStaff.map((st) => (
                      <span
                        key={st.id}
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                          isDark
                            ? 'text-sky-200 bg-sky-900/60 border-sky-500/40'
                            : 'text-sky-800 bg-sky-100 border-sky-300'
                        }`}
                      >
                        {st.name}
                      </span>
                    ))}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white">
                      ABC ({shift.supportGroupId})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredShifts.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            Arama kriterlerinize uygun nöbet günü bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};
