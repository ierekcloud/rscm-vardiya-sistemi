import React, { useState } from 'react';
import { MonthSummary, StaffMember, getGroupConfig, StaffShiftBalance } from '../types';
import { TURKISH_MONTHS } from '../utils/shiftLogic';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Bot,
  Calendar,
  Clock,
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
  const [activeView, setActiveView] = useState<'monthly' | 'weekly'>('monthly');

  // Toplam borçlu ve alacaklı sayıları
  const statsArray = Object.values(summary.staffStats) as StaffShiftBalance[];
  const totalDebtors = statsArray.filter((s) => s.netBalanceDays < 0).length;
  const totalCreditors = statsArray.filter((s) => s.netBalanceDays > 0).length;
  const totalBalanced = statsArray.filter((s) => s.netBalanceDays === 0).length;

  const isIndividualModel =
    departmentName.toLowerCase().includes('grupsuz') ||
    staffList.some((s) => s.groupId?.startsWith('P')) ||
    staffList.some((s) => s.roleNote?.includes('Tek Kişi'));

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
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Personel Çalışma Günü, Alacak & Borç Takip Çizelgesi
                </h3>
                {isIndividualModel && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                    6 Haftalık Tekil Döngü
                  </span>
                )}
              </div>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1 Nöbet (24 Saat) = <strong className={isDark ? 'text-white' : 'text-slate-900'}>3 Günlük</strong> normal mesai • Aylık hedef: <strong className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>{summary.targetWorkingDays} gün</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Görünüm Değiştirici (Aylık vs Haftalık) & Özet Durum Rozetleri */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Haftalık / Aylık Görünüm Butonları */}
          {summary.weeklyStats && summary.weeklyStats.length > 0 && (
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setActiveView('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeView === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aylık Bakiye
              </button>
              <button
                type="button"
                onClick={() => setActiveView('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Haftalık Döküm</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
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
      </div>

      {/* 6 Haftalık Döngü Bilgilendirme Bannerı (Grupsuz Model İçin) */}
      {isIndividualModel && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark
            ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-sky-950/40 border-indigo-800/40 text-indigo-200'
            : 'bg-gradient-to-r from-indigo-50 via-white to-sky-50 border-indigo-200 text-indigo-950 shadow-xs'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  6 Haftalık Kusursuz Tekil Döngü
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Herkes Tek Kişi • 42 Günde Tam 7 Nöbet (168 Saat)
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-1 text-slate-600 dark:text-slate-300">
                Bu modelde 6 personel her hafta nöbet sırasını kaydırır. Her personel 6 haftalık periyotta her günün nöbetini (Pzt-Paz) tam birer kez tutar ve her 6 haftada tam 7 nöbet tamamlar. İki nöbet arası daima <strong>5 gün dinlenme (120 saat)</strong> mevcuttur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🤖 AKILLI AJAN BİLDİRİM VE DENKLEŞTİRME BİLGİ KUTUSU */}
      {summary.auditReport && summary.auditReport.fiveDaysAnomalies.length > 0 && !isIndividualModel && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isDark 
            ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border-cyan-700/40 text-cyan-200' 
            : 'bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-cyan-200 text-cyan-950 shadow-xs'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-500 shrink-0 mt-0.5">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  Otonom Takvim & Bakiye Ajanı
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {summary.auditReport.fiveDaysAnomalies.map(a => `5 ${a.dayName}`).join(' ve ')} Tespit Edildi
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Bu ay takvim gereği bazı günler 5 kez tekrarlamıştır. Bu günlere denk gelerek fazla mesai üreten personellerin hak edişleri tespit edilmiş ve <strong>bir sonraki ayın devir bakiyesine Alacak (+) olarak işlenmiştir</strong>. Hiçbir mesai hakkı kaybolmaz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📅 HAFTALIK HESAPLAMA GÖRÜNÜMÜ */}
      {activeView === 'weekly' && summary.weeklyStats && summary.weeklyStats.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{monthName} {summary.year} Haftalık Nöbet ve Çalışma Saati Dağılımı</span>
            </h4>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Standart Hafta: 1 Nöbet (24 Saat) • Çift Nöbetli Hafta: 2 Nöbet (48 Saat)
            </span>
          </div>

          <div className="overflow-x-auto w-full custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-[#0E1526] text-slate-300' : 'border-slate-200 bg-slate-100/90 text-slate-700'}`}>
                  <th className={`py-3 px-3.5 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Personel Adı</th>
                  <th className="py-3 px-2 text-center font-black">Sıra/Grup</th>
                  {summary.weeklyStats.map((w) => (
                    <th key={w.weekNumber} className="py-3 px-2 text-center font-black min-w-[120px]">
                      <div>{w.weekNumber}. Hafta</div>
                      <div className="text-[10px] font-medium opacity-75">({w.startDay} - {w.endDay} {monthName.slice(0, 3)})</div>
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-l border-indigo-500/20">
                    Ay Toplamı
                  </th>
                  <th className="py-3 px-2 text-center font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    Toplam Saat
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200/90'}`}>
                {staffList.map((staff) => {
                  const grpCfg = getGroupConfig(staff.groupId);
                  const stat = summary.staffStats[staff.id];

                  return (
                    <tr key={staff.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-indigo-50/40'}`}>
                      <td className={`py-3 px-3.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${grpCfg.borderBg} ring-1 ring-slate-400/30`}></span>
                          <span>{staff.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs font-black px-2 py-0.5 rounded border ${grpCfg.badgeBg} ${grpCfg.badgeColor}`}>
                          {staff.groupId}
                        </span>
                      </td>

                      {summary.weeklyStats?.map((w) => {
                        const wData = w.staffWeeklyDuties[staff.id];
                        const dutiesCount = wData ? wData.dutiesCount : 0;
                        const isDouble = dutiesCount >= 2;

                        return (
                          <td key={w.weekNumber} className="py-3 px-2 text-center">
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${
                                dutiesCount === 0
                                  ? isDark ? 'bg-slate-800/60 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                                  : isDouble
                                  ? isDark ? 'bg-indigo-500/25 border-indigo-500/40 text-indigo-300 font-black ring-1 ring-indigo-500/30' : 'bg-indigo-100 border-indigo-300 text-indigo-900 font-black'
                                  : isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              }`}>
                                {dutiesCount} Nöbet ({dutiesCount * 24}s)
                              </span>
                              {wData && wData.dutyDays.length > 0 && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  Gün: {wData.dutyDays.join(', ')}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      <td className="py-3 px-2 text-center font-black tabular-nums border-l border-indigo-500/20">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs">
                          {stat?.totalDuties || 0} Nöbet
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center font-black tabular-nums text-indigo-600 dark:text-indigo-400">
                        {stat?.totalHours || 0} Saat
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detaylı Aylık Personel Tablosu */
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
                <th className="py-3 px-2 text-center font-black">Grup/Sıra</th>
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
                const grpCfg = getGroupConfig(staff.groupId);
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
                      {stats.leaveDays && stats.leaveDays > 0 ? (
                        <div className="flex flex-col items-center leading-tight">
                          <span className={`font-black ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                            {stats.targetWorkDays} gün
                          </span>
                          <span className="text-[10px] text-amber-500 font-semibold" title={`${stats.leaveDays} gün izin düşüldü`}>
                            ({stats.leaveDays}g İzin Düşüldü)
                          </span>
                        </div>
                      ) : (
                        <span>{stats.targetWorkDays} gün</span>
                      )}
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

                    {/* Net Bakiye Durumu */}
                    <td
                      className={`py-3 px-3 text-center font-black tabular-nums border-l ${
                        isDark
                          ? 'bg-slate-900/80 text-white border-slate-700'
                          : 'bg-slate-100/80 text-slate-900 border-slate-300'
                      }`}
                    >
                      {isCreditor && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                            isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          +{stats.netBalanceDays} Gün (Alacaklı)
                        </span>
                      )}
                      {isDebtor && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                            isDark
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                          {stats.netBalanceDays} Gün (Borçlu)
                        </span>
                      )}
                      {isBalanced && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                            isDark
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
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
      )}

      {/* Alt Aksiyon Çubuğu */}
      <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          * Bu tablo aylık ve haftalık çalışma saati hedefine göre borç ve alacakları otomatik hesaplar.
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
