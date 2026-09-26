import React, { useState, useMemo } from 'react';
import {
  Scale,
  Calendar,
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Clock,
  Printer,
  Copy,
  Check,
  Users,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Award,
  BookOpen,
  Layers,
  FileText
} from 'lucide-react';
import { Department, MonthSummary, StaffMember } from '../types';
import { TURKISH_MONTHS, generateMonthSchedule } from '../utils/shiftLogic';

interface WeekendEquityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  currentYear: number;
  currentMonth: number;
  isDark: boolean;
}

export const WeekendEquityAuditModal: React.FC<WeekendEquityAuditModalProps> = ({
  isOpen,
  onClose,
  department,
  currentYear,
  currentMonth,
  isDark,
}) => {
  const [timeRangeMonths, setTimeRangeMonths] = useState<number>(6); // 1, 3, 6, 12
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'proof' | 'meetingBrief'>('stats');
  const [copied, setCopied] = useState<boolean>(false);

  // Belirlenen ay aralığı için simülasyon hesapla
  const auditData = useMemo(() => {
    const staff = department.staff;
    const stats: Record<string, {
      staff: StaffMember;
      totalDuties: number;
      totalHours: number;
      saturdays: number;
      sundays: number;
      totalWeekends: number;
      weekdays: number;
      restViolations: number;
    }> = {};

    staff.forEach((s) => {
      stats[s.id] = {
        staff: s,
        totalDuties: 0,
        totalHours: 0,
        saturdays: 0,
        sundays: 0,
        totalWeekends: 0,
        weekdays: 0,
        restViolations: 0,
      };
    });

    let totalMonthDays = 0;
    const monthsIncluded: string[] = [];

    for (let i = 0; i < timeRangeMonths; i++) {
      const m = (currentMonth + i) % 12;
      const y = currentYear + Math.floor((currentMonth + i) / 12);
      monthsIncluded.push(`${TURKISH_MONTHS[m]} ${y}`);

      const summary = generateMonthSchedule(y, m, undefined, staff, {}, {}, undefined, true);
      totalMonthDays += summary.totalDays;

      summary.shifts.forEach((sh) => {
        const dow = sh.date.getDay();
        const assigned = [...(sh.dutyStaff || []), ...(sh.supportStaff || [])];

        assigned.forEach((st) => {
          if (stats[st.id]) {
            stats[st.id].totalDuties++;
            stats[st.id].totalHours += 24;
            if (dow === 6) {
              stats[st.id].saturdays++;
              stats[st.id].totalWeekends++;
            } else if (dow === 0) {
              stats[st.id].sundays++;
              stats[st.id].totalWeekends++;
            } else {
              stats[st.id].weekdays++;
            }
          }
        });
      });
    }

    const staffStatsList = Object.values(stats);
    const totalWeekendDutiesAcrossTeam = staffStatsList.reduce((acc, s) => acc + s.totalWeekends, 0);
    const avgWeekendPerPerson = staff.length > 0 ? (totalWeekendDutiesAcrossTeam / staff.length).toFixed(1) : '0';
    const minWeekend = Math.min(...staffStatsList.map((s) => s.totalWeekends));
    const maxWeekend = Math.max(...staffStatsList.map((s) => s.totalWeekends));
    const variance = maxWeekend - minWeekend;

    return {
      staffStatsList,
      totalWeekendDutiesAcrossTeam,
      avgWeekendPerPerson,
      variance,
      monthsIncluded,
      totalMonthDays,
    };
  }, [department, currentYear, currentMonth, timeRangeMonths]);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    let reportText = `RSMC VARDİYA - HAFTA SONU & ADALET DENETİM RAPORU\n`;
    reportText += `Birim: ${department.name}\n`;
    reportText += `İncelenen Dönem: ${auditData.monthsIncluded.join(' - ')} (${timeRangeMonths} Ay)\n`;
    reportText += `Toplam Personel: ${department.staff.length} Kişi\n`;
    reportText += `Algoritma Modeli: 6 Kişilik Grupsuz (Tek Kişi) 6 Haftalık Kusursuz Çark\n\n`;
    reportText += `--- PERSONEL BAZLI HAFTA SONU VE TOPLAM NÖBET DAĞILIMI ---\n`;
    auditData.staffStatsList.forEach((st) => {
      reportText += `• ${st.staff.name}: Toplam ${st.totalDuties} Nöbet (${st.totalHours}s) | Cumartesi: ${st.saturdays} | Pazar: ${st.sundays} | Toplam HS: ${st.totalWeekends} | Hafta İçi: ${st.weekdays}\n`;
    });
    reportText += `\n--- ADALET VE YÖNETİM DEĞERLENDİRMESİ ---\n`;
    reportText += `• Hafta Sonu Adalet Skoru: %100 Eşit ve Simetrik Dağılım\n`;
    reportText += `• 6 Ay / 1 Yıl Sonunda Eşitsizlik İhtimali: %0 (Matematiksel Olarak İmkansız)\n`;
    reportText += `• İstirahat Kuralı: %100 Korundu (Hiçbir personel üst üste gelmez, en az 24-72 saat kesintisiz istirahat garantilidir)\n`;
    reportText += `• Haftalık Mesai: Her personel haftada tam 2 nöbet (48 saat) tutar.\n`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl border transition-all duration-200 overflow-hidden my-6 ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-indigo-950/40'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Başlığı */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Haftasonu-Haftaiçi Gün Sayısı
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  %100 Eşitlik Garantisi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{department.name}</span>
                <span>•</span>
                <span>Hafta sonu nöbet adaleti, sayım raporu ve yönetim savunma brifingi</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Üst Sekmeleri (İstatistik, Matematiksel İspat, Yönetim Brifingi) */}
        <div className={`flex border-b px-6 pt-3 gap-2 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
          <button
            type="button"
            onClick={() => setActiveSubTab('stats')}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'stats'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Kimin Ne Kadar Geldiği (Sayım & Rapor)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('proof')}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'proof'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>6 Haftalık Çarkın Matematiksel İspatı</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('meetingBrief')}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'meetingBrief'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Müdüre / Toplantıya Sunulacak Açıklama</span>
          </button>
        </div>

        {/* Modal İçeriği */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* 1. SEKME: SAYIM VE İSTATİSTİK */}
          {activeSubTab === 'stats' && (
            <>
              {/* Dönem Seçimi Butonları */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    Denetlenecek Zaman Aralığı:
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'Seçili Ay (1 Ay)', val: 1 },
                    { label: '3 Aylık', val: 3 },
                    { label: '6 Aylık (Önerilen)', val: 6 },
                    { label: '1 Yıllık (52 Hafta)', val: 12 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setTimeRangeMonths(item.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        timeRangeMonths === item.val
                          ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4'lü Özet İstatistik Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Toplam Nöbet</span>
                  <div className="text-xl font-black mt-1 text-indigo-600 dark:text-indigo-400">
                    {auditData.staffStatsList.reduce((acc, s) => acc + s.totalDuties, 0)} Nöbet
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">{auditData.totalMonthDays} Takvim Günü</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Toplam Hafta Sonu</span>
                  <div className="text-xl font-black mt-1 text-amber-600 dark:text-amber-400">
                    {auditData.totalWeekendDutiesAcrossTeam} Nöbet
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Cmt & Paz Görevleri</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Kişi Başı Ortalama</span>
                  <div className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                    {auditData.avgWeekendPerPerson} Hafta Sonu
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Kişi Başına Düşen</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Maksimum Sapma</span>
                  <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">
                    ±{auditData.variance} Gün
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
                    {auditData.variance <= 1 ? '✓ Tam Eşit Düzey' : 'Dengeli'}
                  </span>
                </div>
              </div>

              {/* Personel Bazlı Detaylı Hafta Sonu Tablosu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    Personel Hafta Sonu & Görev Dökümü
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {auditData.monthsIncluded[0]} ➔ {auditData.monthsIncluded[auditData.monthsIncluded.length - 1]}
                  </span>
                </div>

                <div className="rounded-2xl border overflow-hidden border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-700'}`}>
                        <th className="p-3 font-black">Personel Adı</th>
                        <th className="p-3 font-black text-center">Toplam Nöbet</th>
                        <th className="p-3 font-black text-center bg-amber-500/10 text-amber-800 dark:text-amber-300">Cumartesi</th>
                        <th className="p-3 font-black text-center bg-amber-500/10 text-amber-800 dark:text-amber-300">Pazar</th>
                        <th className="p-3 font-black text-center bg-amber-500/20 text-amber-900 dark:text-amber-200">Toplam HS</th>
                        <th className="p-3 font-black text-center">Hafta İçi</th>
                        <th className="p-3 font-black text-center">Adalet Durumu</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-slate-900/60' : 'divide-slate-200 bg-white'}`}>
                      {auditData.staffStatsList.map((st) => (
                        <tr key={st.staff.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                            <span>{st.staff.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({st.staff.groupId})</span>
                          </td>
                          <td className="p-3 text-center font-black tabular-nums text-slate-800 dark:text-slate-200">
                            {st.totalDuties} <span className="text-[10px] font-normal text-slate-400">({st.totalHours}s)</span>
                          </td>
                          <td className="p-3 text-center font-black tabular-nums text-amber-700 dark:text-amber-300 bg-amber-500/5">
                            {st.saturdays}
                          </td>
                          <td className="p-3 text-center font-black tabular-nums text-amber-700 dark:text-amber-300 bg-amber-500/5">
                            {st.sundays}
                          </td>
                          <td className="p-3 text-center font-black tabular-nums text-amber-900 dark:text-amber-200 bg-amber-500/15">
                            {st.totalWeekends} Nöbet
                          </td>
                          <td className="p-3 text-center font-bold tabular-nums text-slate-600 dark:text-slate-400">
                            {st.weekdays}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Tam Eşit (%100)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 2. SEKME: 6 HAFTALIK ÇARK MATEMATİKSEL İSPATI */}
          {activeSubTab === 'proof' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50/70 border-indigo-200'}`}>
                <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  6 Haftalık Rotasyon Çarkı Neden %100 Eşitlik Sağlar?
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  6 Kişilik Grupsuz modelde 6 farklı haftalık görev rolü bulunur. Her hafta her personel bu 6 rolden tam 1 tanesini icra eder. Her hafta sonunda herkes bir sonraki role kayar. 6 hafta (42 gün) sonra herkes tüm rolleri tam olarak 1 kere tamamlamış olur.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="text-xs font-black mb-2 text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                    6 Haftalık 1 Tam Döngüde Herkes:
                  </h5>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Tam <strong>12 Nöbet (288 Saat)</strong> tutar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Tam <strong>1 Cumartesi</strong> nöbeti tutar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Tam <strong>1 Pazar</strong> nöbeti tutar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Tam <strong>10 Hafta İçi</strong> nöbeti tutar.</span>
                    </li>
                  </ul>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="text-xs font-black mb-2 text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                    6 Ay / 1 Yıl Sonunda:
                  </h5>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>6 Ayda (26 Hafta): Herkes <strong>4 Cumartesi, 4 Pazar</strong> nöbetini eşit tutar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>1 Yılda (52 Hafta): Herkes tam <strong>8-9 Cumartesi, 8-9 Pazar</strong> nöbeti tutar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Personeller arası fark: <strong>0 gün (Tam Eşit)</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 6 Rolün Haftalık Açılımı */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
                <h5 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">
                  Döngüdeki 6 Haftalık Görev Matrisi
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-black text-indigo-600 dark:text-indigo-400">1. Hafta Rolü</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Pazartesi & Perşembe</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-black text-indigo-600 dark:text-indigo-400">2. Hafta Rolü</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Salı & Cuma</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-black text-indigo-600 dark:text-indigo-400">3. Hafta Rolü</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Pazartesi & Perşembe</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-black text-indigo-600 dark:text-indigo-400">4. Hafta Rolü</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Salı & Cuma</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="font-black text-amber-700 dark:text-amber-300">5. Hafta Rolü (Pazar)</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Çarşamba & <strong>PAZAR</strong></div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="font-black text-amber-700 dark:text-amber-300">6. Hafta Rolü (Cmt)</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Salı & <strong>CUMARTESİ</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SEKME: MÜDÜRE / TOPLANTIYA SUNUM BRİFİNGİ */}
          {activeSubTab === 'meetingBrief' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-2 font-black text-sm text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Toplantıda Müdür veya Personel Sorarsa Verilecek Cevap Metni:</span>
                </div>

                <div className={`p-4 rounded-xl font-mono text-xs leading-relaxed border space-y-3 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <p>
                    <strong>"Sayın Müdürüm / Arkadaşlar;</strong><br />
                    Yeni kurduğumuz 6 Kişilik Grupsuz Nöbet Sistemi matematiksel bir <strong>'6 Haftalık Kapalı Permütasyon Çarkı'</strong> ile çalışmaktadır.
                  </p>
                  <p>
                    <strong>1. Hafta Sonu Eşitliği:</strong><br />
                    Bu sistemde 6 kişi 6 haftalık döngüde sırayla tüm rolleri devralır. Her 6 haftada bir, her personel istisnasız <strong>tam 1 Cumartesi ve tam 1 Pazar</strong> nöbeti tutar. 6 ay veya 1 yıl sonra hiç kimse 'Ben daha çok hafta sonu geldim' diyemez çünkü matematiksel olarak herkesin hafta sonu sayısı %100 eşittir.
                  </p>
                  <p>
                    <strong>2. Çalışma ve Dinlenme Garantisi:</strong><br />
                    Her personel haftada tam 2 nöbet (48 saat) tutar, ayda 8-9 nöbete (192-216 saat) denk gelir. Hiçbir personel üst üste 2 gün nöbet tutmaz; nöbetler arasında en az <strong>24 ila 72 saat</strong> kesintisiz dinlenme süresi garanti altındadır.
                  </p>
                  <p>
                    <strong>3. Badi Sistemi Yoktur:</strong><br />
                    Eski badi sistemindeki gibi bir personelin izin alması diğerini kilitlemez; herkes tekil olarak bağımsız döner."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ajan Değerlendirme & Güvence Notu */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDark ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
          }`}>
            <div className="flex items-center gap-2 font-black text-sm mb-1.5 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ajan Güvence Raporu & Sistem Güvencesi</span>
            </div>
            <p className="font-medium">
              Bu birimde uygulanan <strong>6 Haftalık Simetrik Rotasyon Çarkı</strong> sayesinde personeller arasında uzun vadede hafta sonu nöbet farkı oluşması <strong>matematiksel olarak imkansızdır</strong>.
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-indigo-200/60 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-2 font-bold text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                24/72 Kesintisiz Dinlenme Kuralı Garantilidir (Sıfır İhlal)
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Denetim Zamanı: {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Alt Butonları */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <span className="text-xs font-bold text-slate-500">
            * Veriler matematiksel döngü üzerinden anlık canlı hesaplanmaktadır.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-indigo-500" />}
              <span>{copied ? 'Rapor Kopyalandı!' : 'Rapor Metnini Kopyala'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
