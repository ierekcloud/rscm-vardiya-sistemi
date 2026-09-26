import React, { useState, useEffect } from 'react';
import { StaffMember, GROUPS_CONFIG, GroupId } from '../types';
import { 
  Users, 
  Save, 
  Sparkles, 
  AlertCircle, 
  X, 
  UserPlus, 
  Trash2, 
  ArrowRightLeft,
  CheckCircle2,
  Info
} from 'lucide-react';

interface StaffManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onSave: (updatedStaff: StaffMember[]) => void;
  departmentName: string;
  departmentId?: string;
  isDark?: boolean;
}

export const StaffManagerModal: React.FC<StaffManagerModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onSave,
  departmentName,
  departmentId,
  isDark = false,
}) => {
  // Düzenleme için yerel personel durumu
  const [currentStaff, setCurrentStaff] = useState<StaffMember[]>(() => [...staffList]);
  
  // Her grubun hızlı personel ekleme input state'i
  const [newNames, setNewNames] = useState<Record<GroupId, string>>({
    A: '',
    B: '',
    C: '',
    D: '',
  });

  // Modal açıldığında mevcut listeyi eşitle
  useEffect(() => {
    setCurrentStaff([...staffList]);
  }, [staffList, isOpen]);

  const is6PersonModel = departmentId === 'dep-noc-6p';
  const hasGroupD = currentStaff.some((s) => s.groupId === 'D');
  const groupKeys: GroupId[] = (is6PersonModel || !hasGroupD) ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];

  if (!isOpen) return null;

  // İsmi güncelle
  const handleNameChange = (id: string, newName: string) => {
    setCurrentStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  // Personel Grubu Değiştir
  const handleGroupChange = (staffId: string, newGroupId: GroupId) => {
    setCurrentStaff((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, groupId: newGroupId } : s));
      // Yeniden sıra numarası ata
      return updated.map((s) => {
        const sameGroup = updated.filter((x) => x.groupId === s.groupId);
        const idx = sameGroup.findIndex((x) => x.id === s.id);
        return { ...s, orderInGroup: idx + 1 };
      });
    });
  };

  // Gruba Personel Ekle
  const handleAddPerson = (groupId: GroupId) => {
    const rawName = newNames[groupId]?.trim();
    if (!rawName) return;

    const sameGroup = currentStaff.filter((s) => s.groupId === groupId);
    const newMember: StaffMember = {
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: rawName,
      groupId,
      orderInGroup: sameGroup.length + 1,
    };

    setCurrentStaff((prev) => [...prev, newMember]);
    setNewNames((prev) => ({ ...prev, [groupId]: '' }));
  };

  // Personel Sil
  const handleDeletePerson = (staffId: string) => {
    setCurrentStaff((prev) => {
      const filtered = prev.filter((s) => s.id !== staffId);
      return filtered.map((s) => {
        const sameGroup = filtered.filter((x) => x.groupId === s.groupId);
        const idx = sameGroup.findIndex((x) => x.id === s.id);
        return { ...s, orderInGroup: idx + 1 };
      });
    });
  };

  // Örnek İsimlerle Doldur
  const handleFillExamples = () => {
    const examples = [
      'Ahmet Yılmaz', 'Mehmet Demir',
      'Mustafa Kaya', 'Ali Şahin',
      'Hasan Çelik', 'Hüseyin Yıldız',
      'İbrahim Erek', 'Kemal Arslan',
      'Caner Aydın', 'Burak Kurt'
    ];
    setCurrentStaff((prev) =>
      prev.map((st, idx) => ({
        ...st,
        name: examples[idx] || `Personel ${idx + 1}`,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStaff.length === 0) {
      alert('Kadronuzda en az 1 personel bulunmalıdır.');
      return;
    }
    onSave(currentStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-3xl max-w-3xl w-full border shadow-2xl overflow-hidden my-6 transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Başlığı */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">
                  {departmentName} - Kadro & Grup Yönetimi
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Toplam {currentStaff.length} Personel
                </span>
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Gruplara personel ekleyin, silin veya kişi sayısını (örn. 3 kişi) serbestçe belirleyin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bilgilendirme Kartı */}
        <div className="px-6 pt-5">
          <div className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs leading-relaxed ${
            isDark 
              ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' 
              : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
          }`}>
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Esnek Matematik Güvencesi: </strong>
              İstediğiniz grubu 3 veya 4 kişi yapabilir, ya da personeli silebilirsiniz. Sistemimiz 
              <strong> 24 saat nöbet = 3 iş günü</strong> kuralı ve <strong>kümülatif devir motoru</strong> sayesinde kişi sayısı kaç olursa olsun nöbetleri ve bakiyeleri tam adaletle otomatik hesaplar.
            </div>
          </div>
        </div>

        {/* Modal Gövdesi */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Nöbet Grupları ve Personel Yapılandırması
            </span>
            <button
              type="button"
              onClick={handleFillExamples}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300' 
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Örnek İsimler Ata
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[52vh] overflow-y-auto custom-scrollbar pr-1">
            {groupKeys.map((grpId) => {
              const grpConfig = GROUPS_CONFIG[grpId];
              const members = currentStaff.filter((s) => s.groupId === grpId);

              return (
                <div
                  key={grpId}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isDark 
                      ? 'border-slate-800 bg-slate-950/40' 
                      : 'border-slate-200 bg-slate-50/70 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Grup Başlığı ve Mevcut Sayı */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${grpConfig.borderBg}`} />
                        <div>
                          <span className="text-xs font-black tracking-tight block">
                            {is6PersonModel ? (
                              grpId === 'A' ? '1. Grup (A)' :
                              grpId === 'B' ? '2. Grup (B)' :
                              '3. Grup (C)'
                            ) : grpConfig.name}
                          </span>
                          {is6PersonModel && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block leading-tight">
                              {grpId === 'A' && 'Pazartesi & Perşembe'}
                              {grpId === 'B' && 'Salı & Cuma'}
                              {grpId === 'C' && 'Salı/Cmt (1. Kişi) • Çar/Paz (2. Kişi)'}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${grpConfig.badgeBg} ${grpConfig.badgeColor}`}>
                        {members.length} Personel
                      </span>
                    </div>

                    {/* Grup İçindeki Personeller */}
                    {members.length === 0 ? (
                      <div className={`p-4 text-center rounded-xl border border-dashed text-xs mb-3 font-medium ${
                        isDark ? 'border-slate-800 text-slate-500 bg-slate-900/30' : 'border-slate-300 text-slate-400 bg-white'
                      }`}>
                        Bu grupta henüz personel yok. Aşağıdan ekleyebilirsiniz.
                      </div>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {members.map((member, mIdx) => (
                          <div 
                            key={member.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-slate-400 w-4 shrink-0 text-center">
                              {mIdx + 1}.
                            </span>

                            {/* İsim Girişi */}
                            <input
                              type="text"
                              required
                              value={member.name}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleNameChange(member.id, e.target.value)}
                              placeholder="Personel Adı"
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                isDark 
                                  ? 'border-slate-700 bg-slate-800 text-white' 
                                  : 'border-slate-300 bg-white text-slate-900'
                              }`}
                            />

                            {/* Grup Değiştirme Seçicisi */}
                            <select
                              value={member.groupId}
                              onChange={(e) => handleGroupChange(member.id, e.target.value as GroupId)}
                              title="Personeli Başka Gruba Taşı"
                              className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer shrink-0 ${
                                isDark
                                  ? 'border-slate-700 bg-slate-800 text-slate-200'
                                  : 'border-slate-300 bg-slate-100 text-slate-700'
                              }`}
                            >
                              <option value="A">{is6PersonModel ? '1. Grup (A)' : 'Grup A'}</option>
                              <option value="B">{is6PersonModel ? '2. Grup (B)' : 'Grup B'}</option>
                              <option value="C">{is6PersonModel ? '3. Grup (C)' : 'Grup C'}</option>
                              {!is6PersonModel && <option value="D">Grup D</option>}
                            </select>

                            {/* Personel Sil Butonu */}
                            <button
                              type="button"
                              onClick={() => handleDeletePerson(member.id)}
                              title="Bu personeli sil"
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bu Gruba Yeni Personel Ekleme Formu */}
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder={`+ ${grpConfig.name.split(' ')[0]} grubuna personel ekle...`}
                        value={newNames[grpId]}
                        onChange={(e) => setNewNames((prev) => ({ ...prev, [grpId]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPerson(grpId);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDark 
                            ? 'border-slate-800 bg-slate-900 text-white placeholder-slate-500' 
                            : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddPerson(grpId)}
                        disabled={!newNames[grpId]?.trim()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alt Butonlar */}
          <div className={`pt-4 border-t flex items-center justify-between gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className="text-xs font-bold text-slate-500">
              * Değişiklikler vardiya çizelgesine anında yansır.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Kadroyu Kaydet & Çizelgeyi Güncelle</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
