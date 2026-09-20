import React, { useState } from 'react';
import { 
  Palmtree, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  UserCheck
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
}) => {
  const monthName = TURKISH_MONTHS[selectedMonth];

  const [staffId, setStaffId] = useState<string>('');
  const [startDay, setStartDay] = useState<string>('');
  const [endDay, setEndDay] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Modal kapandığında veya açıldığında formu sıfırla
  React.useEffect(() => {
    if (isOpen) {
      setStaffId('');
      setStartDay('');
      setEndDay('');
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!staffId) {
      setError('Lütfen izin verilecek personeli seçin.');
      return;
    }

    const sDay = parseInt(startDay, 10);
    const eDay = parseInt(endDay, 10);

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
      reason: reason.trim() || 'Yıllık İzin',
      type: 'ANNUAL',
    });

    // Başarıyla eklendikten sonra form alanlarını temizle
    setStaffId('');
    setStartDay('');
    setEndDay('');
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className={`relative w-full max-w-xl rounded-2xl shadow-2xl border transition-all duration-200 overflow-hidden ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-amber-950/20' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Modal Başlığı */}
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Personel İzin Yönetimi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {monthName} {selectedYear} • İzinli Günleri Belirleme & Bakiye Düşümü
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

          {/* İzin Formu */}
          <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-4 ${
            isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" />
                Yeni İzin / Rapor Ekle
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                1 Nöbet = 3 Gün Esası
              </span>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Personel Seçimi */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Personel:
                </label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="" disabled className="text-slate-400">
                    -- Personel Seçiniz --
                  </option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Grup {s.groupId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Başlangıç Günü */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Başlangıç Günü:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={totalDaysInMonth}
                    placeholder="Örn: 1"
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">
                    {monthName}
                  </span>
                </div>
              </div>

              {/* Bitiş Günü */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Bitiş Günü:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={startDay ? Number(startDay) : 1}
                    max={totalDaysInMonth}
                    placeholder="Örn: 10"
                    value={endDay}
                    onChange={(e) => setEndDay(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">
                    {monthName}
                  </span>
                </div>
              </div>

              {/* Açıklama / Tür */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  İzin Nedeni / Türü:
                </label>
                <input
                  type="text"
                  placeholder="Örn: Yıllık İzin, Rapor, Mazeret"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>İzni Kaydet ve Tabloya Uygula</span>
            </button>
          </form>

          {/* Mevcut İzinler Listesi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Bu Ay Tanımlı İzinler ({leaves.length})</span>
              <span className="text-[11px] font-normal text-slate-400">
                (İzinli günlerde tabloda <strong>X</strong> görünür)
              </span>
            </h4>

            {leaves.length === 0 ? (
              <div className={`p-4 rounded-xl border text-center text-xs ${
                isDark ? 'bg-slate-800/30 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                Bu ay için henüz kayıtlı bir izin bulunmamaktadır.
              </div>
            ) : (
              <div className="space-y-2">
                {leaves.map((leave) => {
                  const staff = staffList.find((s) => s.id === leave.staffId);
                  const totalDays = leave.endDay - leave.startDay + 1;
                  return (
                    <div
                      key={leave.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isDark 
                          ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600' 
                          : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                            <span>{staff?.name || 'Bilinmeyen Personel'}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              {leave.startDay} - {leave.endDay} {monthName} ({totalDays} Gün)
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {leave.reason || 'İzin'} • Vardiyada <strong>X</strong> olarak işaretlenir & hedeften düşülür.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteLeave(leave.id)}
                        className={`p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer`}
                        title="İzni Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Akıllı Prensip Açıklaması */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            isDark ? 'bg-amber-950/20 border-amber-800/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Sistem Nasıl Çalışır?</strong>
              <br />
              Personel izinli olduğu günlerde (örneğin 2-12 arası) vardiya listesinde o günlere otomatik <strong>"X"</strong> konur ve nöbete çağrılmaz. İzin günleri personelin aylık çalışma hedefinden otomatik düşülür; böylece az nöbet tuttuğu için <strong>asla haksız borçlu çıkmaz</strong>. İstediğiniz zaman bu izni silebilirsiniz.
            </div>
          </div>

        </div>

        {/* Modal Alt Kısmı */}
        <div className={`px-5 py-3 border-t flex justify-end ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white cursor-pointer transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
