import React, { useState } from 'react';
import { Department } from '../types';
import { 
  Network, 
  Server, 
  Wifi, 
  Radio, 
  PhoneCall, 
  ArrowRight,
  Sparkles,
  Users,
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { ManagerCredentials } from '../utils/auth';
import { APP_VERSION_LABEL } from '../version';
import rscmBackdropImg from '../assets/images/rscm_network_backdrop_1789497823958.jpg';

interface DepartmentPortalProps {
  departments: Department[];
  selectedDeptId: string;
  onSelectDepartment: (deptId: string) => void;
  isDark?: boolean;
  currentManager: ManagerCredentials | null;
  onOpenLoginModal: () => void;
  onLogoutManager: () => void;
}

const DEPT_META: Record<string, { icon: React.ReactNode; subtitle: string; tag?: string }> = {
  'dep-noc': {
    icon: <Network className="w-6 h-6 text-indigo-600" />,
    subtitle: 'NOC Vardiya & Operasyon Merkezi',
    tag: 'Pilot Birim • Canlı'
  },
  'dep-mpls': {
    icon: <Server className="w-6 h-6 text-sky-600" />,
    subtitle: 'Omurga Yönlendirme & Veri Ağı',
  },
  'dep-dsl': {
    icon: <Wifi className="w-6 h-6 text-emerald-600" />,
    subtitle: 'Genişbant Erişim & Saha Destek',
  },
  'dep-trans': {
    icon: <Radio className="w-6 h-6 text-amber-600" />,
    subtitle: 'Transmisyon & Radyolink İletim',
  },
  'dep-transmisyon': {
    icon: <Radio className="w-6 h-6 text-amber-600" />,
    subtitle: 'Transmisyon & Radyolink İletim',
  },
  'dep-santral': {
    icon: <PhoneCall className="w-6 h-6 text-purple-600" />,
    subtitle: 'Ses Santralleri & İletişim Altyapısı',
  },
};

export const DepartmentPortal: React.FC<DepartmentPortalProps> = ({
  departments,
  selectedDeptId,
  onSelectDepartment,
  isDark = false,
  currentManager,
  onOpenLoginModal,
  onLogoutManager,
}) => {
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const handleCardClick = (dept: Department) => {
    const isNoc = dept.id === 'dep-noc';
    if (isNoc) {
      onSelectDepartment('dep-noc');
    } else {
      setLockedNotice(`🔒 ${dept.name} birimi kilitlidir. Sistem şu an sadece NOC pilot biriminde devrededir. Pilot süreç tamamlanıp kabul gördükten sonra bu birim açılacaktır.`);
      setTimeout(() => {
        setLockedNotice(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 sm:p-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Kurumsal RSMC Network Arka Plan Fotoğrafı - Net ve Belirgin */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={rscmBackdropImg}
          alt="RSMC Network Operations Center"
          className="w-full h-full object-cover object-center scale-100 transition-all duration-1000 filter brightness-95 contrast-110 saturate-105"
        />
        {/* Şeffaf kurumsal hafif karartma perdesi: RSMC network merkezini, ekranları ve ışıkları net şekilde öne çıkarır */}
        <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[0.2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/25" />
      </div>

      {/* Ana Gövde Kartı */}
      <div className="max-w-4xl w-full mx-auto my-auto relative z-10 bg-white/95 backdrop-blur-xl p-5 sm:p-7 lg:p-8 rounded-3xl shadow-2xl border border-slate-300 transition-all">
        
        {/* Başlık ve Karşılama Alanı */}
        <div className="text-center space-y-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase bg-indigo-50 border border-indigo-200 text-indigo-800 shadow-xs">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Operasyonel Vardiya Yönetimi</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#0f172a]" style={{ color: '#0f172a' }}>
            İncelemek İstediğiniz Birimi Seçiniz
          </h2>
          
          <p className="text-xs sm:text-sm max-w-xl mx-auto font-bold leading-relaxed text-[#334155]" style={{ color: '#334155' }}>
            Sayfa herkesin incelemesine açıktır. İsim değişikliği ve vardiya değişimi yetkisi için sağ köşeden <span className="text-indigo-700 font-black">"YÖNETİCİ GİRİŞ"</span> yapabilirsiniz.
          </p>
        </div>

        {/* Kilitli Birim Tıklama Bildirimi */}
        {lockedNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 text-amber-950 dark:text-amber-200 text-xs sm:text-sm font-black flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{lockedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLockedNotice(null)}
              className="text-xs font-black underline cursor-pointer hover:opacity-75 shrink-0"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Birim Kartları Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {departments
            .filter((dept) => dept.id !== 'dep-noc-6p')
            .map((dept) => {
              const meta = DEPT_META[dept.id] || {
                icon: <Server className="w-5 h-5 text-slate-700" />,
                subtitle: '',
                tag: 'Vardiyalı'
              };
              const isNoc = dept.id === 'dep-noc';

            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleCardClick(dept)}
                className={`group relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isNoc
                    ? 'bg-gradient-to-br from-indigo-50/90 via-white to-white border-indigo-400 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer ring-2 ring-indigo-400/20'
                    : 'bg-slate-100/60 border-slate-300/80 opacity-50 hover:opacity-70 cursor-not-allowed select-none backdrop-blur-[1px]'
                }`}
                style={{ backgroundColor: isNoc ? '#ffffff' : 'rgba(241, 245, 249, 0.65)' }}
                title={isNoc ? `${dept.name} - Canlı ve Açık` : `${dept.name} - Pilot sonrası açılacaktır (Kilitli)`}
              >
                {/* Kilit Simgesi Arka Plan Efekti (NOC Dışındakiler İçin) */}
                {!isNoc && (
                  <div className="absolute right-3 bottom-3 opacity-15 pointer-events-none">
                    <Lock className="w-20 h-20 text-slate-700" />
                  </div>
                )}

                {/* Üst Rozet ve İkon */}
                <div className="flex items-start justify-between w-full mb-3.5 relative z-10">
                  <div className={`p-3 rounded-xl transition-all duration-300 relative ${
                    isNoc
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105'
                      : 'bg-slate-200/80 text-slate-600 border border-slate-300'
                  }`}>
                    {meta.icon}
                    {!isNoc && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border-2 border-white shadow-xs">
                        <Lock className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {isNoc ? (
                    <span 
                      className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-950 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Pilot Birim • Canlı
                    </span>
                  ) : (
                    <span 
                      className="w-7 h-7 rounded-full bg-slate-200/90 border border-slate-300 text-slate-700 flex items-center justify-center shadow-xs"
                      title="Erişime Kapalı"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                    </span>
                  )}
                </div>

                {/* Birim Adı */}
                <div className="mb-4 relative z-10">
                  <h3 
                    className="text-lg font-black tracking-tight flex items-center justify-between"
                    style={{ color: '#0f172a' }}
                  >
                    <span className="flex items-center gap-2">
                      {!isNoc && <KeyRound className="w-4 h-4 text-slate-600 shrink-0" />}
                      <span>{dept.name}</span>
                    </span>
                    {isNoc && (
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1.5 group-hover:translate-x-0 transition-all text-indigo-600" />
                    )}
                  </h3>
                </div>

                {/* Alt Bilgi */}
                <div 
                  className="pt-3 border-t border-slate-200/90 flex items-center justify-between text-xs font-black relative z-10"
                  style={{ borderTopColor: '#e2e8f0' }}
                >
                  <span 
                    className="flex items-center gap-1.5 font-bold text-slate-700"
                    style={{ color: '#1e293b' }}
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {dept.staff.length} Personel
                  </span>
                  
                  {isNoc ? (
                    <span 
                      className="group-hover:underline font-black text-indigo-600 text-[11px] flex items-center gap-1"
                      style={{ color: '#4338ca' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Cetveli Aç →
                    </span>
                  ) : (
                    <span 
                      className="text-slate-500 flex items-center justify-center"
                      title="Erişime Kapalı"
                    >
                      <KeyRound className="w-4 h-4 text-slate-600" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Alt Bilgi & Belirgin Sürüm Rozeti */}
      <footer className="w-full max-w-4xl mx-auto pt-5 pb-2 flex items-center justify-center text-xs relative z-10 px-1">
        <div className="inline-flex items-center gap-2.5 font-bold text-slate-900 dark:text-white bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-xs shadow-emerald-500/50" />
          <span className="text-xs tracking-wide">RSMC Operasyon Merkezi</span>
          <span className="text-slate-300 dark:text-slate-600 font-normal">•</span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-black border border-indigo-300/70 dark:border-indigo-700/60">
            {APP_VERSION_LABEL}
          </span>
        </div>
      </footer>
    </div>
  );
};


