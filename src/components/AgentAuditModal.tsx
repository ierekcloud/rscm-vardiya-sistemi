import React from 'react';
import { 
  Bot, 
  Calendar, 
  X, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { MonthSummary, StaffShiftBalance } from '../types';
import { TURKISH_MONTHS } from '../utils/shiftLogic';

interface AgentAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthSummary;
  departmentName?: string;
  isDark: boolean;
}

export const AgentAuditModal: React.FC<AgentAuditModalProps> = ({
  isOpen,
  onClose,
  summary,
  departmentName,
  isDark,
}) => {
  if (!isOpen) return null;

  const report = summary.auditReport;
  const monthName = TURKISH_MONTHS[summary.month];
  const nextMonthName = TURKISH_MONTHS[(summary.month + 1) % 12];

  // 5'li günlere denk gelenler
  const highlights: {
    staffName: string;
    dayName: string;
    count: number;
    diffDays: number;
    prevCarryover: number;
    netBalance: number;
  }[] = [];

  if (report?.fiveDaysAnomalies) {
    report.fiveDaysAnomalies.forEach((anomaly) => {
      anomaly.affectedStaff.forEach((aff) => {
        if (aff.shiftsOnThisDayCount >= 2) {
          const stat = summary.staffStats[aff.staffId];
          highlights.push({
            staffName: aff.staffName,
            dayName: anomaly.dayName,
            count: aff.shiftsOnThisDayCount,
            diffDays: aff.currentMonthDifference,
            prevCarryover: stat?.previousCarryoverDays || 0,
            netBalance: stat?.netBalanceDays || aff.netBalanceDays || 0,
          });
        }
      });
    });
  }

  // Gelecek aya devreden net bakiyeler (Alacaklılar ve Borçlular)
  const allStats = (Object.values(summary.staffStats) as StaffShiftBalance[]);
  const debtors = allStats.filter((s) => s.netBalanceDays < 0);
  const creditors = allStats.filter((s) => s.netBalanceDays > 0);
  const balanced = allStats.filter((s) => s.netBalanceDays === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border transition-all duration-200 overflow-hidden ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-cyan-950/20' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Üst Başlık */}
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  Akıllı Denetçi Raporu
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {monthName} {summary.year}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-200">{departmentName || 'NOC'}</span>
                {(departmentName === 'NOC' || !departmentName) && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    PİLOT BİRİM
                  </span>
                )}
                <span>• Nöbet & Devir Analizi</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-5 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
          {/* 1. Takvim Durumu */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            isDark ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900'
          }`}>
            <Calendar className="w-5 h-5 text-cyan-500 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong>Takvim Durumu:</strong> {monthName} ayında{' '}
              {report?.fiveDaysAnomalies && report.fiveDaysAnomalies.length > 0 ? (
                <span className="font-semibold underline">
                  {report.fiveDaysAnomalies.map((a) => `5 ${a.dayName}`).join(' ve ')} bulunmaktadır.
                </span>
              ) : (
                '5 adet tekrarlayan özel bir gün yoktur, dağılım normaldir.'
              )}
            </div>
          </div>

          {/* 2. 5'li Günlere Denk Gelen Personeller */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              5'li Günlere Denk Gelen Personeller
            </h4>

            {highlights.length === 0 ? (
              <div className={`p-3 rounded-lg border text-xs text-center ${
                isDark ? 'bg-slate-800/40 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                Bu ay personeller arasında 5'li gün fazlalığı oluşturan bir durum bulunmamaktadır.
              </div>
            ) : (
              <div className="space-y-2">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed ${
                      isDark 
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-100' 
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <div>
                      <strong className="text-amber-600 dark:text-amber-400">{h.staffName}:</strong>{' '}
                      {h.count} kez {h.dayName} gününe nöbetçi geldi.{' '}
                      {h.diffDays > 0 ? (
                        <span>Bu ay tek başına <strong>+{h.diffDays} gün</strong> fazla mesai üretti. </span>
                      ) : h.diffDays < 0 ? (
                        <span>Bu ay tek başına <strong>{h.diffDays} gün</strong> eksik mesai yaptı. </span>
                      ) : (
                        <span>Nöbet sayısı hedefe tam denk geldi. </span>
                      )}
                      {h.netBalance === 0 && h.prevCarryover !== 0 ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          (Geçmişten gelen {h.prevCarryover > 0 ? `+${h.prevCarryover}` : h.prevCarryover}g devir bu ayki telafi nöbetiyle kapatıldı ve net bakiye 0 güne eşitlendi. Gelecek aya devreden alacak kalmadı.)
                        </span>
                      ) : h.netBalance > 0 ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          (Net alacak: +{h.netBalance} gün, {nextMonthName} ayına devredildi.)
                        </span>
                      ) : h.netBalance < 0 ? (
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          (Net borç: {h.netBalance} gün, {nextMonthName} ayına devredildi.)
                        </span>
                      ) : (
                        <span className="text-slate-500">(Net bakiye: 0 gün.)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Gelecek Aya Devreden Net Bakiyeler */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              Gelecek Aya Devreden Net Bakiyeler ({nextMonthName} Öncesi Durum)
            </h4>

            {creditors.length === 0 && debtors.length === 0 ? (
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <strong>Tüm Ekibin Bakiyesi Sıfırlandı (Net: 0 Gün):</strong> Geçmiş aylardan gelen tüm alacak ve borçlar bu ay tutulan nöbetlerle telafi edilmiş ve eşitlenmiştir. Gelecek aya devreden <strong>hiçbir personelin alacağı veya borcu yoktur</strong>.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Net Alacaklılar */}
                <div className={`p-3.5 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    Net Alacaklılar ({nextMonthName}'a devreden):
                  </div>
                  {creditors.length === 0 ? (
                    <div className="text-xs text-slate-400">Gelecek aya devreden alacaklı yok.</div>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {creditors.map((c) => (
                        <li key={c.staff.id} className="flex items-center justify-between">
                          <span>{c.staff.name}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{c.netBalanceDays} Gün Alacak
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Net Borçlular */}
                <div className={`p-3.5 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                    Net Borçlular ({nextMonthName}'a devreden):
                  </div>
                  {debtors.length === 0 ? (
                    <div className="text-xs text-slate-400">Gelecek aya devreden borçlu yok.</div>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {debtors.map((d) => (
                        <li key={d.staff.id} className="flex items-center justify-between">
                          <span>{d.staff.name}</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {d.netBalanceDays} Gün Borç
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Alt Bilgi */}
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Kural:</strong> 1 Nöbet = 3 Gün mesai kabul edilir. Tüm alacak ve borçlar bir sonraki aya kuruşu kuruşuna aktarılır ve otomatik dengelenir.
            </span>
          </div>
        </div>

        {/* Alt Kapat Butonu */}
        <div className={`px-5 py-3 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Matematiksel Doğrulama Motoru Aktif</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer transition-colors"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
