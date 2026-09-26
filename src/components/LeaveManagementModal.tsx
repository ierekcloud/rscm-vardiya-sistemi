import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar,
  Shield,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { StaffLeave, StaffMember } from '../types';
import { TURKISH_MONTHS } from '../utils/shiftLogic';

interface LeaveManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  leaves: StaffLeave[];
  onAddLeave: (leave: Omit<StaffLeave, 'id'>) => void;
  onDeleteLeave: (id: string) => void;
  selectedMonth: number;
  selectedYear: number;
  totalDaysInMonth: number;
  isDark: boolean;
  isAdmin?: boolean;
  onRequestAdminLogin?: () => void;
}

export const LeaveManagementModal: React.FC<LeaveManagementModalProps> = ({
  isOpen,
  onClose,
  staffList,
  leaves,
  onAddLeave,
  onDeleteLeave,
  selectedMonth,
  selectedYear,
  totalDaysInMonth,
  isDark,
  isAdmin = false,
  onRequestAdminLogin,
}) => {
  const monthName = TURKISH_MONTHS[selectedMonth];
  const formattedMonth = String(selectedMonth + 1).padStart(2, '0');

  const defaultStartDate = `${selectedYear}-${formattedMonth}-01`;
  const defaultEndDate = `${selectedYear}-${formattedMonth}-${String(totalDaysInMonth).padStart(2, '0')}`;

  const [staffId, setStaffId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [error, setError] = useState<string | null>(null);

  // Modal açıldığında form değerlerini sıfırla ve ilk personeli seç
  useEffect(() => {
    if (isOpen) {
      if (staffList.length > 0) {
        setStaffId(staffList[0].id);
      } else {
        setStaffId('');
      }
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      setError(null);
    }
  }, [isOpen, staffList, selectedMonth, selectedYear, totalDaysInMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      if (onRequestAdminLogin) {
        onRequestAdminLogin();
      } else {
        setError('İzin kaydetmek için lütfen Yönetici Girişi yapınız.');
      }
      return;
    }

    if (!staffId) {
      setError('Lütfen izin verilecek personeli seçin.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini belirleyiniz.');
      return;
    }

    const sDay = parseInt(startDate.split('-')[2], 10);
    const eDay = parseInt(endDate.split('-')[2], 10);

    if (isNaN(sDay) || sDay < 1 || sDay > totalDaysInMonth) {
      setError(`Başlangıç günü 1 ile ${totalDaysInMonth} arasında geçerli bir gün olmalıdır.`);
      return;
    }

    if (isNaN(eDay) || eDay < sDay || eDay > totalDaysInMonth) {
      setError(`Bitiş günü ${sDay} ile ${totalDaysInMonth} arasında geçerli bir gün olmalıdır.`);
      return;
    }

    onAddLeave({
      staffId,
      startDay: sDay,
      endDay: eDay,
      reason: 'Yıllık İzin',
      type: 'ANNUAL',
    });

    setError(null);
  };

  const formatDateDisplay = (day: number) => {
    return `${String(day).padStart(2, '0')}.${formattedMonth}.${selectedYear}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border transition-all duration-200 overflow-hidden ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-amber-950/20' 
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Üst Başlık Barı (Resimdeki gibi sade ve şık) */}
        <div className={`px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <h3 className="text-xl font-extrabold tracking-tight">
            İzin Girişi
          </h3>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-6 sm:p-8 space-y-6 text-sm max-h-[80vh] overflow-y-auto">

          {/* Yönetici Girişi Bildirim Çubuğu (Resimdeki gibi) */}
          {!isAdmin ? (
            <div 
              onClick={onRequestAdminLogin}
              className={`w-full py-3 px-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-99 ${
                isDark 
                  ? 'bg-amber-950/20 border-amber-600/50 hover:bg-amber-950/30 text-amber-300' 
                  : 'bg-[#FFFDF5] border-[#FCD34D] hover:bg-[#FFFBEB] text-[#78350F]'
              }`}
              title="Yönetici girişi yapmak için tıklayın"
            >
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2} />
              <span className="font-bold text-sm">İzin girmek için Yönetici Girişi</span>
            </div>
          ) : (
            <div 
              className={`w-full py-2.5 px-5 rounded-2xl border flex items-center justify-center gap-2.5 ${
                isDark 
                  ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300' 
                  : 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="font-bold text-xs sm:text-sm">Yönetici Modu Aktif • İzin Girişi Yapabilirsiniz</span>
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* İzin Giriş Formu (Resimdeki gibi 3 sütun + Buton) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              
              {/* Personel Seçimi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Personel
                </label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B49BF8]/60 transition-all ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  {staffList.length === 0 ? (
                    <option value="">Personel Bulunamadı</option>
                  ) : (
                    staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Başlangıç Tarihi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Başlangıç
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    min={`${selectedYear}-${formattedMonth}-01`}
                    max={`${selectedYear}-${formattedMonth}-${String(totalDaysInMonth).padStart(2, '0')}`}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B49BF8]/60 transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Bitiş Tarihi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Bitiş
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || `${selectedYear}-${formattedMonth}-01`}
                    max={`${selectedYear}-${formattedMonth}-${String(totalDaysInMonth).padStart(2, '0')}`}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B49BF8]/60 transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Kaydet Butonu (Resimdeki mor/lavanta pastel buton) */}
            <div className="pt-1">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl font-bold text-sm text-white bg-[#B49BF8] hover:bg-[#A388F6] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+ İzni Kaydet</span>
              </button>
            </div>
          </form>

          {/* Bu aya temas eden izinler Bölümü */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Bu aya temas eden izinler
            </h4>

            {leaves.length === 0 ? (
              <div className="text-sm text-slate-400 dark:text-slate-500 py-1 font-normal">
                Kayıtlı izin yok.
              </div>
            ) : (
              <div className="space-y-2.5 mt-2">
                {leaves.map((leave) => {
                  const staff = staffList.find((s) => s.id === leave.staffId);
                  const totalDays = leave.endDay - leave.startDay + 1;
                  return (
                    <div
                      key={leave.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isDark 
                          ? 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600' 
                          : 'bg-slate-50/80 border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#B49BF8]/15 text-[#8B5CF6] flex items-center justify-center font-bold text-xs shrink-0">
                          {leave.startDay}
                        </div>
                        <div>
                          <div className="font-bold text-sm flex items-center gap-2">
                            <span>{staff?.name || 'Bilinmeyen Personel'}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#B49BF8]/20 text-[#6D28D9] dark:text-[#C4B5FD]">
                              {formatDateDisplay(leave.startDay)} - {formatDateDisplay(leave.endDay)} ({totalDays} Gün)
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Vardiya çizelgesinde <strong>X</strong> görünür & hedeften düşülür.
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDeleteLeave(leave.id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="İzni Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alt Açıklama Kutusu (Resimdeki gibi sade ve şık kart) */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDark 
              ? 'bg-slate-800/40 border-slate-800 text-slate-400' 
              : 'bg-slate-50/80 border-slate-200 text-slate-600'
          }`}>
            İzinli günler çizelgede <strong className="font-bold text-slate-900 dark:text-slate-200">X</strong> görünür. Personel bu tarihlerde nöbete atanmaz; Pazar dışındaki onaylı izin günleri kişisel aylık hedeften düşülür. Bu nedenle izin tek başına borç veya alacak oluşturmaz.
          </div>

        </div>
      </div>
    </div>
  );
};
