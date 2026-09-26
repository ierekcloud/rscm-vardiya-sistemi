import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Copy,
  Check,
  Mail,
  Calendar,
  User,
  Sparkles,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';
import { Department, MonthSummary, StaffMember, DayShift } from '../types';
import { TURKISH_MONTHS } from '../utils/shiftLogic';

interface ShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthSummary;
  department: Department;
  selectedYear: number;
  selectedMonth: number;
  isDark: boolean;
  isAdmin: boolean;
  managerName?: string;
  onApplySwap?: (day1: number, staff1: StaffMember, day2: number, staff2: StaffMember) => void;
  onRequestAdminLogin?: () => void;
}

export const ShiftSwapModal: React.FC<ShiftSwapModalProps> = ({
  isOpen,
  onClose,
  summary,
  department,
  selectedYear,
  selectedMonth,
  isDark,
  isAdmin,
  managerName = 'Dilek Hanım',
  onApplySwap,
  onRequestAdminLogin,
}) => {
  const staffList = department.staff || [];
  const shifts = summary.shifts || [];

  const [staff1Id, setStaff1Id] = useState<string>(staffList[0]?.id || '');
  const [day1, setDay1] = useState<number>(1);
  const [staff2Id, setStaff2Id] = useState<string>(staffList[1]?.id || '');
  const [day2, setDay2] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Personel 1'in nöbetçi olduğu günleri bul
  const staff1DutyDays = useMemo(() => {
    if (!staff1Id) return [];
    return shifts.filter((sh) =>
      [...(sh.dutyStaff || []), ...(sh.supportStaff || [])].some((s) => s.id === staff1Id)
    );
  }, [staff1Id, shifts]);

  // Personel 2'nin nöbetçi olduğu günleri bul
  const staff2DutyDays = useMemo(() => {
    if (!staff2Id) return [];
    return shifts.filter((sh) =>
      [...(sh.dutyStaff || []), ...(sh.supportStaff || [])].some((s) => s.id === staff2Id)
    );
  }, [staff2Id, shifts]);

  // Seçili günleri otomatik ilk uygun günlere eşitle
  React.useEffect(() => {
    if (staff1DutyDays.length > 0 && !staff1DutyDays.some((d) => d.dayNumber === day1)) {
      setDay1(staff1DutyDays[0].dayNumber);
    }
  }, [staff1DutyDays, day1]);

  React.useEffect(() => {
    if (staff2DutyDays.length > 0 && !staff2DutyDays.some((d) => d.dayNumber === day2)) {
      setDay2(staff2DutyDays[0].dayNumber);
    }
  }, [staff2DutyDays, day2]);

  const staff1 = staffList.find((s) => s.id === staff1Id);
  const staff2 = staffList.find((s) => s.id === staff2Id);

  // Kural ve Güvenlik Denetimi (Takas Simülasyonu)
  const swapValidation = useMemo(() => {
    if (!staff1 || !staff2 || !day1 || !day2 || day1 === day2 || staff1Id === staff2Id) {
      return {
        isValid: false,
        error: 'Lütfen iki farklı personel ve farklı nöbet günleri seçiniz.',
      };
    }

    // Takas sonrası yeni nöbet haritasını simüle et
    const simulatedDays: Record<number, string[]> = {};
    shifts.forEach((sh) => {
      simulatedDays[sh.dayNumber] = [...(sh.dutyStaff || []), ...(sh.supportStaff || [])].map((s) => s.id);
    });

    // Day 1'de staff1 çıkar, staff2 ekle
    simulatedDays[day1] = simulatedDays[day1].filter((id) => id !== staff1Id);
    if (!simulatedDays[day1].includes(staff2Id)) simulatedDays[day1].push(staff2Id);

    // Day 2'de staff2 çıkar, staff1 ekle
    simulatedDays[day2] = simulatedDays[day2].filter((id) => id !== staff2Id);
    if (!simulatedDays[day2].includes(staff1Id)) simulatedDays[day1].push(staff1Id);

    // 1. Staff 1 için peş peşe kontrolü
    for (let d = 1; d <= shifts.length - 1; d++) {
      if (simulatedDays[d]?.includes(staff1Id) && simulatedDays[d + 1]?.includes(staff1Id)) {
        return {
          isValid: false,
          error: `Kural İhlali: Bu takas yapılırsa ${staff1.name} ${d} ve ${d + 1} ${TURKISH_MONTHS[selectedMonth]} tarihlerinde üst üste nöbete girmiş olur!`,
        };
      }
    }

    // 2. Staff 2 için peş peşe kontrolü
    for (let d = 1; d <= shifts.length - 1; d++) {
      if (simulatedDays[d]?.includes(staff2Id) && simulatedDays[d + 1]?.includes(staff2Id)) {
        return {
          isValid: false,
          error: `Kural İhlali: Bu takas yapılırsa ${staff2.name} ${d} ve ${d + 1} ${TURKISH_MONTHS[selectedMonth]} tarihlerinde üst üste nöbete girmiş olur!`,
        };
      }
    }

    return {
      isValid: true,
      error: null,
    };
  }, [staff1, staff2, day1, day2, staff1Id, staff2Id, shifts, selectedMonth]);

  if (!isOpen) return null;

  const shift1Obj = shifts.find((s) => s.dayNumber === day1);
  const shift2Obj = shifts.find((s) => s.dayNumber === day2);

  const emailSubject = `NOC Nöbet Takas Talebi - ${(staff1?.name || '').toLocaleUpperCase('tr-TR')} & ${(staff2?.name || '').toLocaleUpperCase('tr-TR')} (${TURKISH_MONTHS[selectedMonth]} ${selectedYear})`;

  const getEmailBody = () => {
    const s1Upper = (staff1?.name || '').toLocaleUpperCase('tr-TR');
    const s2Upper = (staff2?.name || '').toLocaleUpperCase('tr-TR');
    const month = TURKISH_MONTHS[selectedMonth];
    const s1DayName = shift1Obj?.dayName || '';
    const s2DayName = shift2Obj?.dayName || '';

    return `Dilek Hanım Merhaba, 
${month} ${selectedYear} dönemi NOC nöbet çizelgesinde aşağıda belirtilen nöbetlerimizi karşılıklı olarak takas etmek istiyoruz.
• 1. Personel: ${s1Upper} (${day1} ${month} ${s1DayName}) 
• 2. Personel: ${s2Upper} (${day2} ${month} ${s2DayName}) 
Sistem üzerinden kural ve denetim gerçekleştirilmiş olup; her iki personel için de herhangi bir kural ihlali bulunmamaktadır.
İyi çalışmalar.
${s1Upper} & ${s2Upper}`;
  };

  const handleCopyEmail = () => {
    const fullText = `Konu: ${emailSubject}\n\n${getEmailBody()}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(getEmailBody());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleExecuteApply = () => {
    if (!isAdmin) {
      if (onRequestAdminLogin) onRequestAdminLogin();
      return;
    }
    if (onApplySwap && staff1 && staff2 && swapValidation.isValid) {
      onApplySwap(day1, staff1, day2, staff2);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border transition-all duration-200 overflow-hidden my-6 ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-indigo-950/50'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Başlık */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Nöbet Değişimi
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                  E-Posta & Yönetici Onaylı
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Birim Yöneticisi: <strong className="text-slate-900 dark:text-white">{managerName}</strong></span>
                <span>•</span>
                <span>{TURKISH_MONTHS[selectedMonth]} {selectedYear} Dönemi</span>
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

        {/* İçerik */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* Takas Seçim Kartları (2 Personel) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Personel */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                <User className="w-4 h-4" />
                <span>1. Personel (Talep Eden)</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Personel Seçin</label>
                <select
                  value={staff1Id}
                  onChange={(e) => setStaff1Id(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Vereceği Nöbet Günü</label>
                <select
                  value={day1}
                  onChange={(e) => setDay1(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {staff1DutyDays.map((sh) => (
                    <option key={sh.dayNumber} value={sh.dayNumber}>
                      {sh.dayNumber} {TURKISH_MONTHS[selectedMonth]} ({sh.dayName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Personel */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                <User className="w-4 h-4" />
                <span>2. Personel (Takas Yapılacak)</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Personel Seçin</label>
                <select
                  value={staff2Id}
                  onChange={(e) => setStaff2Id(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Alacağı Nöbet Günü</label>
                <select
                  value={day2}
                  onChange={(e) => setDay2(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {staff2DutyDays.map((sh) => (
                    <option key={sh.dayNumber} value={sh.dayNumber}>
                      {sh.dayNumber} {TURKISH_MONTHS[selectedMonth]} ({sh.dayName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kural Denetim Sonuç Kartı */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
              swapValidation.isValid
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : isDark
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {swapValidation.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>

            <div className="flex-1 text-xs leading-relaxed">
              <div className="font-black text-sm mb-0.5">
                {swapValidation.isValid ? '✓ Sistem Uygunluk Verdi: Kural İhlali Yok' : '❌ Takas Kural İhlali Yaratıyor!'}
              </div>
              <p>
                {swapValidation.isValid
                  ? `Bu takas sonucunda her iki personel için de peş peşe nöbet oluşmamakta ve en az 24-72 saat kesintisiz istirahat süresi korunmaktadır.`
                  : swapValidation.error}
              </p>
            </div>
          </div>

          {/* E-Posta Talep Metni Önizlemesi */}
          {swapValidation.isValid && (
            <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Yöneticiye ({managerName}) Gönderilecek E-Posta Şablonu:
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Resmi Talep</span>
              </div>

              <div className="space-y-1">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-900 border-slate-800 text-indigo-300' : 'bg-white border-slate-200 text-indigo-900'}`}>
                  <span className="text-slate-400">Konu: </span>
                  <span>{emailSubject}</span>
                </div>

                <div
                  className={`p-3.5 rounded-xl font-mono text-xs whitespace-pre-line leading-relaxed border ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {getEmailBody()}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
                  <span>{copied ? 'E-Posta Metni Kopyalandı!' : 'Metni Kopyala'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="px-3.5 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>E-Posta İstemcisini Aç (Outlook / Mail)</span>
                </button>
              </div>
            </div>
          )}

          {/* Onay Akışı Bilgilendirme Notu */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            isDark ? 'bg-indigo-950/30 border-indigo-900/50 text-indigo-300' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
          }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
            <div>
              <strong>Onay Süreci Nasıl İşler?</strong>
              <p className="mt-0.5 opacity-85">
                Personel e-postayı ilettikten sonra, <strong>{managerName}</strong> site üzerinden yönetici şifresiyle giriş yapıp <strong>"Değişimi Çizelgeye Uygula"</strong> butonuna basar ve çizelge anında resmi olarak güncellenir.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Alt Kısmı */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <span className="text-xs font-bold text-slate-500">
            {isAdmin ? `👑 Yönetici Modu (${managerName}): Takası doğrudan onaylayabilirsiniz.` : '🔒 Personel Modu: Değişim için yönetici e-posta onayı gereklidir.'}
          </span>

          <div className="flex items-center gap-2">
            {isAdmin && swapValidation.isValid && (
              <button
                type="button"
                onClick={handleExecuteApply}
                className="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{appliedSuccess ? 'Çizelgeye İşlendi!' : 'Değişimi Onayla & Çizelgeye İşle'}</span>
              </button>
            )}

            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (onRequestAdminLogin) onRequestAdminLogin();
                }}
                className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Yönetici Girişi Yap</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
