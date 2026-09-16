import React from 'react';
import { Department, MonthSummary, StaffMember, GROUPS_CONFIG } from '../types';
import { TURKISH_MONTHS } from '../utils/shiftLogic';

interface PrintSheetProps {
  department: Department;
  summary: MonthSummary;
  staffList: StaffMember[];
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  department,
  summary,
  staffList,
}) => {
  const monthName = TURKISH_MONTHS[summary.month];

  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-none text-xs">
      {/* Üst Resmi Başlık */}
      <div className="border-b-2 border-black pb-4 mb-4 text-center">
        <h1 className="text-lg font-black uppercase tracking-wider">
          RSMC VARDİYA - {department.name} ÇALIŞMA VE NÖBET ÇİZELGESİ
        </h1>
        <div className="flex justify-between items-center mt-2 text-xs font-semibold">
          <span>Bölüm: {department.name}</span>
          <span>Dönem: {monthName} {summary.year}</span>
          <span>Çalışma Hedefi: {summary.targetWorkingDays} Gün (Ay {summary.shifts.length} Gün)</span>
        </div>
      </div>

      {/* Vardiya Açıklama Notu */}
      <div className="mb-4 text-[10px] text-stone-700 bg-stone-100 p-2 border border-stone-300">
        <strong>Vardiya Çalışma Esasları:</strong> Personel nöbete geldiğinde 24 saat boyunca kesintisiz <strong>ABC</strong> nöbeti (A, B ve C vardiyaları toplamı = 3 mesaiye bedel) tutar. ABC çalışan personel ertesi gün asla çalışamaz; iki ABC nöbeti arasında en az 2 veya 3 gün kesintisiz dinlenme (boşluk) bulunur. Aylık maksimum borçlanma en fazla -2 gün ile sınırlandırılmıştır.
      </div>

      {/* Matris Tablosu */}
      <table className="w-full border-collapse border border-black text-[9px] mb-6">
        <thead>
          <tr className="bg-stone-200">
            <th className="border border-black p-1 text-left">Personel Adı Soyadı</th>
            <th className="border border-black p-1 text-center">Grup</th>
            {summary.shifts.map((s) => {
              const dayOfWeek = s.date.getDay();
              const isSun = dayOfWeek === 0;
              const isSat = dayOfWeek === 6;
              const isWeekend = isSun || isSat;

              return (
                <th
                  key={s.dayNumber}
                  className={`border border-black p-1 text-center ${
                    isWeekend ? 'bg-stone-300 font-black' : ''
                  }`}
                >
                  <div className="font-bold">{s.dayNumber}</div>
                  <div className="text-[7px]">
                    {s.dayName.slice(0, 3)}
                  </div>
                  {isSun && <div className="text-[6px] font-black underline">PAZ</div>}
                  {isSat && <div className="text-[6px] font-black">CMT</div>}
                </th>
              );
            })}
            <th className="border border-black p-1 text-center">Önc. Devir</th>
            <th className="border border-black p-1 text-center">Nöbet</th>
            <th className="border border-black p-1 text-center">Eşdeğer (×3)</th>
            <th className="border border-black p-1 text-center">Net Bakiye</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((st) => {
            const stats = summary.staffStats[st.id];

            const balanceText = stats
              ? stats.netBalanceDays < 0
                ? `${stats.netBalanceDays}g (Borç)`
                : stats.netBalanceDays > 0
                ? `+${stats.netBalanceDays}g (Alacak)`
                : 'Denk (0g)'
              : '-';

            return (
              <tr key={st.id}>
                <td className="border border-black p-1 font-semibold whitespace-nowrap">
                  {st.name}
                </td>
                <td className="border border-black p-1 text-center font-bold">
                  Grup {st.groupId}
                </td>
                {summary.shifts.map((s) => {
                  const isDuty = s.dutyStaff.some((member) => member.id === st.id);
                  const isSupport = s.supportStaff ? s.supportStaff.some((member) => member.id === st.id) : false;
                  const dayOfWeek = s.date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <td
                      key={s.dayNumber}
                      className={`border border-black p-1 text-center font-bold ${
                        isDuty || isSupport
                          ? 'bg-stone-300 font-black text-black'
                          : isWeekend
                          ? 'bg-stone-100 font-light'
                          : ''
                      }`}
                    >
                      {isDuty || isSupport ? 'ABC' : '-'}
                    </td>
                  );
                })}
                <td className="border border-black p-1 text-center font-bold">
                  {stats?.previousCarryoverDays !== undefined && stats.previousCarryoverDays !== 0
                    ? `${stats.previousCarryoverDays > 0 ? '+' : ''}${stats.previousCarryoverDays}g`
                    : '0g'}
                </td>
                <td className="border border-black p-1 text-center font-bold">
                  {stats?.totalDuties || 0}
                </td>
                <td className="border border-black p-1 text-center font-bold">
                  {stats?.equivalentWorkDays || 0}g
                </td>
                <td className="border border-black p-1 text-center font-bold">
                  {balanceText}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* İmza ve Onay Alanları */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-4 text-center">
        <div>
          <div className="font-bold mb-1">HAZIRLAYAN</div>
          <div className="text-stone-600 text-[10px] mb-8">Vardiya Amiri / İlgili Sorumlu</div>
          <div className="border-t border-black w-48 mx-auto pt-1 font-semibold">İmza / Tarih</div>
        </div>

        <div>
          <div className="font-bold mb-1">ONAYLAYAN</div>
          <div className="text-stone-600 text-[10px] mb-8">İdari İşler & Şirket Müdürü</div>
          <div className="border-t border-black w-48 mx-auto pt-1 font-semibold">İmza / Kaşe</div>
        </div>
      </div>
    </div>
  );
};
