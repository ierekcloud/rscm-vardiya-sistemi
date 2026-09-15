import React, { useState } from 'react';
import { DayShift, GroupId, GROUPS_CONFIG } from '../types';
import { Clock, Users, X, Check, RotateCcw } from 'lucide-react';

interface ShiftOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: DayShift | null;
  onOverride: (dayNumber: number, newGroupId: GroupId) => void;
  onReset: (dayNumber: number) => void;
  isDark?: boolean;
  isAdmin?: boolean;
  onRequestAdminLogin?: () => void;
}

export const ShiftOverrideModal: React.FC<ShiftOverrideModalProps> = ({
  isOpen,
  onClose,
  shift,
  onOverride,
  onReset,
  isDark = false,
  isAdmin = false,
  onRequestAdminLogin,
}) => {
  if (!isOpen || !shift) return null;

  const [selectedGroup, setSelectedGroup] = useState<GroupId>(shift.dutyGroupId);

  const handleSave = () => {
    if (!isAdmin) {
      if (onRequestAdminLogin) onRequestAdminLogin();
      return;
    }
    onOverride(shift.dayNumber, selectedGroup);
    onClose();
  };

  const handleReset = () => {
    if (!isAdmin) {
      if (onRequestAdminLogin) onRequestAdminLogin();
      return;
    }
    onReset(shift.dayNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`rounded-2xl max-w-md w-full border shadow-2xl p-5 sm:p-6 transition-all ${
          isDark
            ? 'bg-[#111827] border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
        }`}
      >
        <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {shift.dayNumber} {shift.date.toLocaleDateString('tr-TR', { month: 'long' })} ({shift.dayName})
            </h3>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nöbet Grubu Değişikliği / Takas
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`p-3 rounded-xl border text-xs mb-4 space-y-1.5 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Vardiya Saati: 07:30 - Ertesi Sabah 07:30 (24 Saat)</span>
          </div>
          <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Users className="w-4 h-4 text-slate-400" />
            <span>Mevcut Nöbetçi: Grup {shift.dutyGroupId} ({shift.dutyStaff.map((s) => s.name).join(', ')})</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Bu gün için Nöbetçi Grubu Seçiniz:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B', 'C', 'D'] as GroupId[]).map((grp) => {
              const cfg = GROUPS_CONFIG[grp];
              const isSelected = selectedGroup === grp;

              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-950 dark:text-white font-black shadow-sm ring-1 ring-indigo-500'
                      : isDark
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{cfg.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-300 font-bold'
                        : isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {cfg.capacity} Kişi
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`flex items-center justify-between pt-3 border-t ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          {shift.hasManualOverride ? (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Orijinal Plana Dön
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Vazgeç
            </button>
            {isAdmin ? (
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer transition-colors"
              >
                Kaydet
              </button>
            ) : (
              <button
                onClick={onRequestAdminLogin}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl shadow-md cursor-pointer transition-colors"
              >
                <span>Yönetici Girişi Yap</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
