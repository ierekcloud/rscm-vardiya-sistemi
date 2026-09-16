import React from "react";
import { ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { WordsPullUp } from "./WordsPullUp";

interface PrismaHeroProps {
  badge?: string;
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  activeDeptName?: string;
  selectedMonthName?: string;
  selectedYear?: number;
  stats?: Array<{ label: string; value: string; desc?: string }>;
  onChangeDepartment?: () => void;
}

export const PrismaHero: React.FC<PrismaHeroProps> = ({
  badge = "RSMC KURUMSAL VARDİYA MOTORU",
  title = "Kesintisiz Nöbet & Adil Bakiye Yönetimi",
  description = "24 saatlik döngüsel nöbet sistemi, otomatik eksik gün telafisi, 1 nöbet = 3 eşdeğer gün hesabı ve -2 gün maksimum borç sınırlandırma güvencesi.",
  primaryAction,
  secondaryAction,
  activeDeptName,
  selectedMonthName,
  selectedYear,
  stats,
  onChangeDepartment,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 md:p-8 shadow-xs">
      {/* Yumuşak, göz yormayan arka plan aydınlatması */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-slate-100/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-50/70 blur-3xl" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3.5">
          {/* Rozet */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="tracking-wide uppercase text-[10px] font-bold text-slate-700">
              {badge}
            </span>
            {activeDeptName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-700 font-bold">{activeDeptName}</span>
              </>
            )}
            {selectedMonthName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">{selectedMonthName} {selectedYear}</span>
              </>
            )}
          </div>

          {/* Başlık */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            <WordsPullUp text={title} />
          </h1>

          {/* Açıklama */}
          <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
            {description}
          </p>

          {/* Eylemler */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 py-2 px-4 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{secondaryAction.label}</span>
              </button>
            )}

            {onChangeDepartment && (
              <button
                type="button"
                id="btn-hero-back-portal"
                onClick={onChangeDepartment}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs sm:text-sm font-bold text-indigo-700 transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
                <span>Ana Sayfaya Dön</span>
              </button>
            )}
          </div>
        </div>

        {/* İstatistikler */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 shrink-0 lg:w-72">
            {stats.map((st, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 transition-colors"
              >
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                  {st.value}
                </div>
                <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                  {st.label}
                </div>
                {st.desc && (
                  <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                    {st.desc}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
