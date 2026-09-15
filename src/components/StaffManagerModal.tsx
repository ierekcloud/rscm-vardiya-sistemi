import React, { useState } from 'react';
import { StaffMember, GROUPS_CONFIG, GroupId } from '../types';
import { Users, Save, Sparkles, AlertCircle, X } from 'lucide-react';

interface StaffManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onSave: (updatedStaff: StaffMember[]) => void;
  departmentName: string;
}

export const StaffManagerModal: React.FC<StaffManagerModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onSave,
  departmentName,
}) => {
  if (!isOpen) return null;

  // Grup bazlı personelleri hazırlayalım
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    staffList.forEach((st) => {
      initial[st.id] = st.name;
    });
    return initial;
  });

  const handleNameChange = (id: string, newName: string) => {
    setFormData((prev) => ({ ...prev, [id]: newName }));
  };

  const handleFillExamples = () => {
    const examples = [
      'Ahmet Yılmaz', 'Mehmet Demir',
      'Mustafa Kaya', 'Ali Şahin',
      'Hasan Çelik', 'Hüseyin Yıldız',
      'İbrahim Erek'
    ];
    const updated: Record<string, string> = {};
    staffList.forEach((st, idx) => {
      updated[st.id] = examples[idx] || `Personel ${idx + 1}`;
    });
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedList: StaffMember[] = staffList.map((st) => ({
      ...st,
      name: formData[st.id]?.trim() || `Personel (${st.groupId})`,
    }));
    onSave(updatedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                {departmentName} - 7 Personel İsim Listesi
              </h3>
              <p className="text-xs text-stone-500">
                4 grup ve toplam 7 personel kuralı (2+2+2+1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                1. Grup: 2 kişi • 2. Grup: 2 kişi • 3. Grup: 2 kişi • 4. Grup: 1 kişi (Toplam 7 Personel)
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillExamples}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Örnek İsimler
            </button>
          </div>

          <div className="space-y-4">
            {(['A', 'B', 'C', 'D'] as GroupId[]).map((grpId) => {
              const grpConfig = GROUPS_CONFIG[grpId];
              const members = staffList.filter((s) => s.groupId === grpId);

              return (
                <div
                  key={grpId}
                  className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${grpConfig.badgeBg} ${grpConfig.badgeColor}`}
                      >
                        {grpConfig.name}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {grpConfig.capacity} Personel Kapasitesi
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {members.map((member, mIdx) => (
                      <div key={member.id} className="relative">
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">
                          {grpId === 'D' ? 'Tek Görevli Personel' : `${mIdx + 1}. Personel`}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData[member.id] || ''}
                          onChange={(e) => handleNameChange(member.id, e.target.value)}
                          placeholder={`${member.name || 'Ad Soyad giriniz'}`}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Personel Listesini Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
