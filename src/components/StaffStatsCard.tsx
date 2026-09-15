import React from 'react';
import { MonthSummary, StaffMember, GROUPS_CONFIG, StaffShiftBalance } from '../types';
import { TURKISH_MONTHS } from '../utils/shiftLogic';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from 'lucide-react';

interface StaffStatsCardProps {
  summary: MonthSummary;
  staffList: StaffMember[];
  departmentName: string;
  isDark?: boolean;
  isAdmin?: boolean;
  onRequestAdminLogin?: () => void;
  onCarryOverToNextMonth?: () => void;
  onUpdateManualCarryover?: (staffId: string, val: number) => void;
}

export const StaffStatsCard: React.FC<StaffStatsCardProps> = ({
  summary,
  staffList,
  departmentName,
  isDark = false,
  isAdmin = false,
  onRequestAdminLogin,
  onCarryOverToNextMonth,
  onUpdateManualCarryover,
}) => {
  const monthName = TURKISH_MONTHS[summary.month];

  // Toplam borçlu ve alacaklı sayıları
  const statsArray = Object.values(summary.staffStats) as StaffShiftBalance[];
  const totalDebtors = statsArray.filter((s) => s.netBalanceDays < 0).length;
  const totalCreditors = statsArray.filter((s) => s.netBalanceDays > 0).length;
  const totalBalanced = statsArray.filter((s) => s.netBalanceDays === 0).length;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-4 sm:p-6 space-y-6 shadow-sm ${
        isDark
          ? 'bg-[#111827]/95 border-slate-800 text-slate-100 shadow-2xl'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
      }`}
    >
      {/* Üst Bilgi ve Hesaplama Formülü */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Personel Çalışma Günü, Alacak & Borç Takip Çizelgesi
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1 Nöbet (24 Saat) = <strong className={isDark ? 'text-white' : 'text-slate-900'}>3 Günlük</strong> normal mesai • Aylık hedef: <strong className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>{summary.targetWorkingDays} gün</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Özet Durum Rozetleri */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
              isDark
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>{totalDebtors} Borçlu</span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
              isDark
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>{totalCreditors} Alacaklı</span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            <span>{totalBalanced} Denk</span>
          </div>
        </div>
      </div>

      {/* Detaylı Personel Tablosu */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
          <thead>
            <tr
              className={`border-b ${
                isDark
                  ? 'border-slate-800 bg-[#0E1526] text-slate-300'
                  : 'border-slate-200 bg-slate-100/90 text-slate-700'
              }`}
            >
              <th className={`py-3 px-3.5 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Personel</th>
              <th className="py-3 px-2 text-center font-black">Grup</th>
              <th className="py-3 px-2 text-center font-black" title="Önceki aydan devreden gün bakiyesi">
                Önceki Devir
              </th>
              <th className="py-3 px-2 text-center font-black">Bu Ay Nöbet</th>
              <th className="py-3 px-2 text-center font-black" title="Nöbet x 3 Gün">
                Eşdeğer Gün
              </th>
              <th className="py-3 px-2 text-center font-black">Hedef Gün</th>
              <th className="py-3 px-2 text-center font-black" title="Eşdeğer Gün - Hedef">
                Bu Ay Farkı
              </th>
              <th
                className={`py-3 px-3 text-center font-black border-l ${
                  isDark
                    ? 'bg-slate-950 text-white border-slate-700'
                    : 'bg-slate-200/80 text-slate-900 border-slate-300'
                }`}
              >
                Net Bakiye (Devreden)
              </th>
              <th className="py-3 px-3 text-center font-black">Durum & Telafi</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200/90'}`}>
            {staffList.map((staff) => {
              const grpCfg = GROUPS_CONFIG[staff.groupId];
              const stats = summary.staffStats[staff.id];
              if (!stats) return null;

              const isDebtor = stats.netBalanceDays < 0;
              const isCreditor = stats.netBalanceDays > 0;
              const isBalanced = stats.netBalanceDays === 0;

              return (
                <tr
                  key={staff.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-indigo-50/40'
                  }`}
                >
                  {/* Personel İsmi */}
                  <td className={`py-3 px-3.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${grpCfg.borderBg} ring-1 ring-slate-400/30`}></span>
                      <span>{staff.name}</span>
                    </div>
                  </td>

                  {/* Grup */}
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded border ${grpCfg.badgeBg} ${grpCfg.badgeColor}`}
                    >
                      {staff.groupId}
                    </span>
                  </td>

                  {/* Önceki Aydan Devir */}
                  <td className="py-3 px-2 text-center font-black tabular-nums">
                    {isAdmin ? (
                      <input
                        type="number"
                        value={stats.previousCarryoverDays}
                        onChange={(e) => onUpdateManualCarryover?.(staff.id, parseInt(e.target.value) || 0)}
                        className={`w-20 text-center px-2 py-1 rounded-lg border text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        title="Manuel Devir Bakiyesi Girişi"
                      />
                    ) : stats.previousCarryoverDays !== 0 ? (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-black inline-block border ${
                          stats.previousCarryoverDays < 0
                            ? isDark
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                            : isDark
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {stats.previousCarryoverDays > 0
                          ? `+${stats.previousCarryoverDays} gün`
                          : `${stats.previousCarryoverDays} gün`}
                      </span>
                    ) : (
                      <span className={isDark ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}>0</span>
                    )}
                  </td>

                  {/* Bu Ay Nöbet */}
                  <td className={`py-3 px-2 text-center font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {stats.totalDuties} Nöbet
                    </span>
                  </td>

                  {/* Eşdeğer Gün */}
                  <td className={`py-3 px-2 text-center font-black tabular-nums ${
                    isDark ? 'text-indigo-300' : 'text-indigo-700'
                  }`}>
                    {stats.equivalentWorkDays} gün
                  </td>

                  {/* Hedef Gün */}
                  <td className={`py-3 px-2 text-center font-bold tabular-nums ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {stats.targetWorkDays} gün
                  </td>

                  {/* Bu Ay Farkı */}
                  <td className="py-3 px-2 text-center font-black tabular-nums">
                    {stats.currentMonthDifference > 0 && (
                      <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                        +{stats.currentMonthDifference} gün
                      </span>
                    )}
                    {stats.currentMonthDifference < 0 && (
                      <span className={isDark ? 'text-rose-400' : 'text-rose-700'}>
                        {stats.currentMonthDifference} gün
                      </span>
                    )}
                    {stats.currentMonthDifference === 0 && (
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>0</span>
                    )}
                  </td>

                  {/* Net Kümülatif Bakiye */}
                  <td
                    className={`py-3 px-3 text-center font-black border-l tabular-nums ${
                      isDark
                        ? 'border-slate-700 bg-slate-950/60'
                        : 'border-slate-300 bg-slate-100/70'
                    }`}
                  >
                    {isDebtor && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border inline-flex items-center gap-1 ${
                          isDark
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        {stats.netBalanceDays} Gün (Borç)
                      </span>
                    )}
                    {isCreditor && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border inline-flex items-center gap-1 ${
                          isDark
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{stats.netBalanceDays} Gün (Alacak)
                      </span>
                    )}
                    {isBalanced && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border inline-flex items-center gap-1 ${
                          isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        0 (Tam Denk)
                      </span>
                    )}
                  </td>

                  {/* Durum & Otomatik Telafi Açıklaması */}
                  <td className="py-3 px-3 text-center text-xs">
                    {isDebtor ? (
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded-lg border ${
                          isDark
                            ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                            : 'text-amber-800 bg-amber-50 border-amber-200'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Gelecek ay ek nöbetle telafi
                      </span>
                    ) : isCreditor ? (
                      <span
                        className={`font-bold px-2 py-1 rounded-lg border ${
                          isDark
                            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        Alacak sonraki aya devredildi
                      </span>
                    ) : (
                      <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>
                        Bakiye sıfırlandı
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alt Aksiyon Çubuğu */}
      <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          * Bu tablo aylık çalışma saati hedefine göre borç ve alacakları otomatik hesaplar.
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={onCarryOverToNextMonth}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all active:scale-95 cursor-pointer bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-indigo-500/25`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Gelecek Aya Bakiyeleri Devret</span>
            </button>
          ) : (
            <button
              onClick={onRequestAdminLogin}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all border shadow-sm cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Devir Yetkisi İçin Giriş Yap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
