import React from 'react';
import { DayShift, StaffMember, GROUPS_CONFIG, MonthSummary } from '../types';

interface MatrixTableViewProps {
  shifts: DayShift[];
  staffList: StaffMember[];
  summary: MonthSummary;
  isDark?: boolean;
  selectedStaffId?: string | null;
  onSelectStaff?: (staffId: string) => void;
}

export const MatrixTableView: React.FC<MatrixTableViewProps> = ({
  shifts,
  staffList,
  summary,
  isDark = false,
  selectedStaffId,
  onSelectStaff,
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-md ${
        isDark
          ? 'bg-[#0F1629]/95 border-slate-800/80 text-slate-100 shadow-2xl'
          : 'bg-white/95 border-slate-200/80 text-slate-800 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)]'
      }`}
    >
      {/* Tablo Üst Başlık Çubuğu */}
      <div
        className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-[#0B101E]/90 border-slate-800/80'
            : 'bg-slate-50/90 border-slate-200/80 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {shifts.length} Günlük Resmi Vardiya Çizelgesi
          </span>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
              isDark
                ? 'text-indigo-300 bg-indigo-950/80 border-indigo-500/30'
                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
            }`}
          >
            {staffList.length} Personel
          </span>
          <span className={`text-xs font-medium hidden md:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            • 24 Saatlik Döngü (07:30 - 07:30) • 1 Nöbet = 3 Gün Eşdeğer
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-bold">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black shadow-xs ${
              isDark
                ? 'bg-amber-500/25 text-amber-200 border-amber-500/50'
                : 'bg-amber-200/90 text-amber-950 border-amber-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/50 animate-pulse"></span>
            Hafta Sonu (Cmt & Paz)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 text-white font-black shadow-sm">
            ABC Nöbeti
          </span>
        </div>
      </div>

      {/* Tablo Gövdesi - Geniş ve Okunaklı Matris */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            {/* Gün Numaraları ve Hafta Sonu Vurgusu */}
            <tr
              className={`border-b ${
                isDark
                  ? 'bg-[#0B1120] border-slate-800 text-slate-300'
                  : 'bg-slate-100/90 border-slate-200 text-slate-700'
              }`}
            >
              <th
                className={`sticky left-0 z-20 px-2 py-1 text-xs sm:text-sm font-black border-r w-36 min-w-[130px] shadow-[2px_0_6px_rgba(0,0,0,0.06)] ${
                  isDark
                    ? 'bg-[#0E1526] text-white border-slate-800'
                    : 'bg-slate-100 text-slate-900 border-slate-200'
                }`}
              >
                Personel Adı
              </th>
              <th
                className={`px-1.5 py-1 text-xs font-black text-center border-r w-11 min-w-[36px] ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
              >
                Grup
              </th>

              {shifts.map((s) => {
                const dayOfWeek = s.date.getDay();
                const isSat = dayOfWeek === 6;
                const isSun = dayOfWeek === 0;
                const isWeekend = isSat || isSun;

                return (
                  <th
                    key={s.dayNumber}
                    className={`px-0 py-1 text-center min-w-[28px] sm:min-w-[32px] w-[30px] transition-colors border-r ${
                      isSun
                        ? isDark
                          ? 'bg-amber-500/35 text-amber-100 border-amber-500/60 font-black'
                          : 'bg-amber-300 text-amber-950 border-amber-400 font-black'
                        : isSat
                        ? isDark
                          ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 font-black'
                          : 'bg-amber-200 text-amber-950 border-amber-300 font-black'
                        : isDark
                        ? 'text-slate-300 border-slate-800/80 hover:bg-slate-800/30'
                        : 'text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={`${s.dayNumber} ${s.dayName}${isWeekend ? ' (Hafta Sonu)' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center leading-none py-0.5">
                      <span
                        className={`text-xs sm:text-sm font-black tabular-nums ${
                          isWeekend
                            ? isDark
                              ? 'text-amber-200'
                              : 'text-amber-950'
                            : isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {s.dayNumber}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase mt-0.5 tracking-tight ${
                          isSun
                            ? isDark
                              ? 'text-amber-300'
                              : 'text-amber-950 font-black'
                            : isSat
                            ? isDark
                              ? 'text-amber-300'
                              : 'text-amber-900 font-black'
                            : isDark
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {s.dayName.slice(0, 3)}
                      </span>
                    </div>
                  </th>
                );
              })}

              <th
                className={`px-1 py-1.5 text-[11px] font-black text-center border-l w-12 min-w-[48px] ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/70 text-slate-200'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
                title="Bu Ay Tutulan Nöbet Sayısı"
              >
                Vardiya Günü
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200/90'}`}>
            {staffList.map((staff) => {
              const grpCfg = GROUPS_CONFIG[staff.groupId];
              const stats = summary.staffStats[staff.id];
              const isSelected = selectedStaffId === staff.id;

              return (
                <tr
                  key={staff.id}
                  onClick={() => onSelectStaff && onSelectStaff(staff.id)}
                  className={`transition-colors cursor-pointer h-7 ${
                    isSelected
                      ? isDark
                        ? 'bg-indigo-950/70 ring-1 ring-indigo-500'
                        : 'bg-indigo-50/90 ring-1 ring-indigo-400'
                      : isDark
                      ? 'hover:bg-slate-800/50'
                      : 'hover:bg-indigo-50/40'
                  }`}
                >
                  {/* Personel Adı (Sabit Sütun) */}
                  <td
                    className={`sticky left-0 z-10 px-2 py-1.5 text-[11px] sm:text-xs font-bold border-r truncate shadow-[2px_0_6px_rgba(0,0,0,0.05)] ${
                      isSelected
                        ? isDark
                          ? 'bg-[#1a233b] text-indigo-200 border-indigo-500/50'
                          : 'bg-indigo-100 text-indigo-950 border-indigo-300'
                        : isDark
                        ? 'bg-[#0E1526] text-white border-slate-800'
                        : 'bg-white text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="truncate flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${grpCfg.borderBg} shrink-0 ring-1 ring-slate-400/30`}></span>
                      <span className={`truncate ${isSelected ? 'font-black' : ''}`}>{staff.name}</span>
                    </div>
                  </td>

                  {/* Grup Rozeti */}
                  <td className={`px-0.5 py-1.5 text-center border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span
                      className={`text-[10px] sm:text-[11px] font-black px-1 py-0.5 rounded border ${grpCfg.badgeBg} ${grpCfg.badgeColor}`}
                    >
                      {staff.groupId}
                    </span>
                  </td>

                  {/* 31 Günlük Hücreler */}
                  {shifts.map((shift) => {
                    const isDuty =
                      shift.dutyStaff.some((s) => s.id === staff.id) ||
                      (shift.supportStaff ? shift.supportStaff.some((s) => s.id === staff.id) : false);
                    const dayOfWeek = shift.date.getDay();
                    const isSat = dayOfWeek === 6;
                    const isSun = dayOfWeek === 0;
                    const isWeekend = isSat || isSun;

                    const cellBg = isSun
                      ? isDark
                        ? 'bg-amber-950/50 border-r border-amber-500/40'
                        : 'bg-amber-100/90 border-r border-amber-300/90'
                      : isSat
                      ? isDark
                        ? 'bg-amber-950/35 border-r border-amber-500/35'
                        : 'bg-amber-50/90 border-r border-amber-200/90'
                      : isDark
                      ? 'border-r border-slate-800/60'
                      : 'border-r border-slate-200/80';

                    return (
                      <td key={shift.dayNumber} className={`text-center p-0 ${cellBg} relative`}>
                        {isDuty ? (
                          <div
                            className={`absolute inset-0 flex items-center justify-center font-black text-[10px] sm:text-[11px] leading-none tracking-tight shadow-xs bg-indigo-600 text-white ring-1 ring-inset ${isDark ? 'ring-indigo-500' : 'ring-indigo-400'}`}
                            title={`${staff.name} - 24 Saat ABC Nöbeti`}
                          >
                            ABC
                          </div>
                        ) : (
                          <div
                            className={`absolute inset-0 flex items-center justify-center text-xs font-black select-none ${
                              isWeekend
                                ? isDark
                                  ? 'text-amber-500/50'
                                  : 'text-amber-600/70'
                                : isDark
                                ? 'text-slate-700'
                                : 'text-slate-300'
                            }`}
                          >
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Toplam Nöbet */}
                  <td
                    className={`px-1 py-1.5 text-center font-black border-l tabular-nums text-[11px] sm:text-xs ${
                      isDark
                        ? 'text-white border-slate-800 bg-slate-900/20'
                        : 'text-slate-900 border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    {stats?.totalDuties || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
