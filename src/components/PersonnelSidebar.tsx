import React, { useState } from 'react';
import { Department, GroupId, GROUPS_CONFIG, MonthSummary, StaffMember } from '../types';
import {
  Users,
  ChevronDown,
  ChevronUp,
  UserCheck,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Edit3,
  Check,
  Sparkles,
  Search,
  Shield,
} from 'lucide-react';

interface PersonnelSidebarProps {
  department: Department;
  summary: MonthSummary;
  isDark?: boolean;
  isScheduleGenerated?: boolean;
  isAdmin?: boolean;
  onRequestAdminLogin?: () => void;
  onUpdateStaffName: (staffId: string, newName: string) => void;
  onFillDemoNames: () => void;
  selectedStaffId?: string | null;
  onSelectStaff?: (staffId: string) => void;
}

export const PersonnelSidebar: React.FC<PersonnelSidebarProps> = ({
  department,
  summary,
  isDark = false,
  isScheduleGenerated = true,
  isAdmin = false,
  onRequestAdminLogin,
  onUpdateStaffName,
  onFillDemoNames,
  selectedStaffId,
  onSelectStaff,
}) => {
  // Hangi grupların açık olduğunu tutan state (Varsayılan olarak hepsi kapalı)
  const [openGroups, setOpenGroups] = useState<Record<GroupId, boolean>>({
    A: false,
    B: false,
    C: false,
    D: false,
  });

  // Düzenleme modu
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleGroup = (grp: GroupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [grp]: !prev[grp],
    }));
  };

  const groupKeys: GroupId[] = ['A', 'B', 'C', 'D'];

  return (
    <aside
      className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs flex flex-col lg:sticky lg:top-20 backdrop-blur-md ${
        isDark
          ? 'bg-[#0F1629]/90 border-slate-800/90 text-slate-100 shadow-xl'
          : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
      }`}
      style={{ maxHeight: 'calc(100vh - 90px)' }}
    >
      {/* Üst Başlık ve Yönetim Çubuğu */}
      <div
        className={`p-4 sm:p-5 border-b flex flex-col gap-3 ${
          isDark ? 'border-slate-800 bg-[#0E1526]' : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${
                isDark
                  ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Personel Listesi
              </h3>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {department.name} ({department.staff.length} Kişi)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin ? (
              isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                  title="Değişiklikleri Tamamla"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Bitti</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Personel İsimlerini Düzenle"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Düzenle</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onRequestAdminLogin}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700/80 bg-slate-800/60 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40'
                    : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-300'
                }`}
                title="İsimleri değiştirmek için Yönetici Girişi gereklidir"
              >
                <Shield className="w-3 h-3" />
                <span>Yönetici</span>
              </button>
            )}
          </div>
        </div>

        {/* Hızlı Arama Alanı */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full text-xs pl-9 pr-3.5 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-400'
                : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-2xs'
            }`}
          />
        </div>

        {/* Düzenleme Modu Açıkken Örnek İsim Doldurma */}
        {isEditing && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-indigo-500 font-bold">
              İsimleri değiştirebilirsiniz:
            </span>
            <button
              type="button"
              onClick={onFillDemoNames}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Varsayılan İsimler
            </button>
          </div>
        )}
      </div>

      {/* ALT ALTA AÇILAN GRUP BUTONLARI (Dikey Akordiyon) */}
      <div className="p-3 space-y-2.5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        {groupKeys.map((grp) => {
          const cfg = GROUPS_CONFIG[grp];
          const isOpen = openGroups[grp];
          // Use summary.staffList if available (which contains rotated staff), otherwise fallback to department.staff
          const staffSource = summary?.staffList || department.staff;
          const allGroupStaff = staffSource.filter((s) => s.groupId === grp);
          const filteredStaff = allGroupStaff.filter((s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (searchTerm && filteredStaff.length === 0) {
            return null;
          }

          return (
            <div
              key={grp}
              className={`rounded-xl border transition-all overflow-hidden ${
                isDark
                  ? 'border-slate-800 bg-slate-900/60'
                  : 'border-slate-200 bg-slate-50/80 shadow-2xs'
              }`}
            >
              {/* Grup Açılır / Kapanır Dikey Buton */}
              <button
                type="button"
                onClick={() => toggleGroup(grp)}
                className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer select-none ${
                  isDark
                    ? 'hover:bg-slate-800/80 bg-slate-900/90'
                    : 'hover:bg-slate-100/90 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${cfg.borderBg} shadow-xs`}
                  />
                  <div>
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {cfg.name}
                    </span>
                    {grp === 'D' && (
                      <span className="text-[10px] text-amber-500 font-semibold block leading-tight">
                        (Çarşamba & Pazar Sabit)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${cfg.badgeBg} ${cfg.badgeColor}`}
                  >
                    {allGroupStaff.length} Kişi
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Açılan Personel Listesi (Dikey Alt Alta) */}
              {isOpen && (
                <div
                  className={`p-2.5 space-y-2 border-t ${
                    isDark ? 'border-slate-800 divide-y divide-slate-800/60' : 'border-slate-200 divide-y divide-slate-100'
                  }`}
                >
                  {filteredStaff.map((staff) => {
                    const stats = summary.staffStats[staff.id];
                    const isSelected = selectedStaffId === staff.id;

                    return (
                      <div
                        key={staff.id}
                        onClick={() => onSelectStaff && onSelectStaff(staff.id)}
                        className={`pt-2 first:pt-0 p-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-400/40 shadow-xs'
                            : isDark
                            ? 'hover:bg-slate-800/60'
                            : 'hover:bg-slate-100/70'
                        } ${onSelectStaff ? 'cursor-pointer' : ''}`}
                      >
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={staff.name}
                              onChange={(e) => onUpdateStaffName(staff.id, e.target.value)}
                              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isDark
                                  ? 'border-slate-700 bg-slate-800 text-white'
                                  : 'border-slate-300 bg-white text-slate-900'
                              }`}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isDark
                                    ? 'bg-slate-800 border-slate-700 text-indigo-400'
                                    : 'bg-slate-100 border-slate-200 text-indigo-600'
                                }`}
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`text-xs font-bold truncate block ${
                                    isDark ? 'text-white' : 'text-slate-900'
                                  }`}
                                  title={staff.name}
                                >
                                  {staff.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  24s Nöbetçi
                                </span>
                              </div>
                            </div>

                            {/* İstatistik ve Bakiye Rozeti */}
                            {isScheduleGenerated && stats ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-[11px] font-black px-2 py-0.5 rounded-md border tabular-nums ${
                                    isDark
                                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                  title={`${stats.totalDuties} Nöbet = ${stats.equivalentWorkDays} Gün`}
                                >
                                  {stats.totalDuties} Nöbet
                                </span>

                                {stats.netBalanceDays < 0 && (
                                  <span
                                    className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded border ${
                                      isDark
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                                    title={`${stats.netBalanceDays} Gün Borç`}
                                  >
                                    <TrendingDown className="w-3 h-3 text-rose-500" />
                                    {stats.netBalanceDays}G
                                  </span>
                                )}

                                {stats.netBalanceDays > 0 && (
                                  <span
                                    className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded border ${
                                      isDark
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                    title={`+${stats.netBalanceDays} Gün Alacak`}
                                  >
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    +{stats.netBalanceDays}G
                                  </span>
                                )}

                                {stats.netBalanceDays === 0 && (
                                  <span
                                    className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded border ${
                                      isDark
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                    title="Tam Denk (0 Gün Bakiye)"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    0G Denk
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="shrink-0">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    isDark
                                      ? 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  Beklemede
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alt Özet Bilgi */}
      <div
        className={`p-3 border-t text-[11px] font-semibold flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-[#0E1526] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          Toplam: <strong>{department.staff.length} Personel</strong>
        </span>
        <span className="text-slate-400">4 Nöbet Grubu</span>
      </div>
    </aside>
  );
};
