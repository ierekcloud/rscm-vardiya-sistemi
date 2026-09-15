import React from 'react';
import { Department } from '../types';
import { 
  Network, 
  Server, 
  Wifi, 
  Radio, 
  PhoneCall, 
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';
import { ManagerCredentials } from '../utils/auth';
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
    subtitle: '24/72 Vardiya & Akıllı Dengeleme',
    tag: 'Pilot Birim • Canlı'
  },
  'dep-mpls': {
    icon: <Server className="w-6 h-6 text-sky-600" />,
    subtitle: 'Omurga Yönlendirme & Veri Ağı',
    tag: 'Vardiyalı'
  },
  'dep-dsl': {
    icon: <Wifi className="w-6 h-6 text-emerald-600" />,
    subtitle: 'Genişbant Erişim & Saha Destek',
    tag: 'Vardiyalı'
  },
  'dep-trans': {
    icon: <Radio className="w-6 h-6 text-amber-600" />,
    subtitle: 'Transmisyon & Radyolink İletim',
    tag: 'Vardiyalı'
  },
  'dep-transmisyon': {
    icon: <Radio className="w-6 h-6 text-amber-600" />,
    subtitle: 'Transmisyon & Radyolink İletim',
    tag: 'Vardiyalı'
  },
  'dep-santral': {
    icon: <PhoneCall className="w-6 h-6 text-purple-600" />,
    subtitle: 'Ses Santralleri & İletişim Altyapısı',
    tag: 'Vardiyalı'
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
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 sm:p-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Kurumsal RSCM Network Arka Plan Fotoğrafı - Daha belirgin ve canlı */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={rscmBackdropImg}
          alt="RSCM Network Operations Center"
          className="w-full h-full object-cover object-center scale-100 transition-all duration-700 filter brightness-105 contrast-105"
        />
        {/* İnceltilmiş şeffaf kırık beyaz gradyan perde: görselin detayları ve network ışıkları çok daha belirgin */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/50 via-[#f1f5f9]/60 to-[#e2e8f0]/70 backdrop-blur-[0.5px]" />
      </div>

      {/* Ana Gövde Kartı */}
      <div className="max-w-5xl w-full mx-auto my-auto relative z-10 bg-white/95 backdrop-blur-xl p-6 sm:p-10 lg:p-12 rounded-[2.5rem] shadow-2xl border border-slate-300 transition-all">
        
        {/* Başlık ve Karşılama Alanı */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-indigo-50 border border-indigo-200 text-indigo-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Operasyonel Vardiya Yönetimi</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0f172a]" style={{ color: '#0f172a' }}>
            İncelemek İstediğiniz Birimi Seçiniz
          </h2>
          
          <p className="text-sm sm:text-base max-w-2xl mx-auto font-bold leading-relaxed text-[#334155]" style={{ color: '#334155' }}>
            Sayfa herkesin incelemesine açıktır. İsim değişikliği ve vardiya değişimi yetkisi için sağ köşeden <span className="text-indigo-700 font-black">"YÖNETİCİ GİRİŞ"</span> yapabilirsiniz.
          </p>
        </div>

        {/* Birim Kartları Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const meta = DEPT_META[dept.id] || {
              icon: <Server className="w-6 h-6 text-slate-700" />,
              subtitle: 'Operasyonel Birim',
              tag: 'Vardiyalı'
            };
            const isNoc = dept.id === 'dep-noc';

            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => onSelectDepartment(dept.id)}
                className={`group relative p-5 sm:p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 ${
                  isNoc
                    ? 'bg-gradient-to-br from-indigo-50/90 via-white to-white border-indigo-400'
                    : 'bg-white border-slate-300 hover:border-indigo-400'
                }`}
                style={{ backgroundColor: '#ffffff' }}
              >
                {/* Üst Rozet ve İkon */}
                <div className="flex items-start justify-between w-full mb-4">
                  <div className={`p-3.5 rounded-2xl transition-all duration-300 ${
                    isNoc
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105'
                      : 'bg-slate-100 text-slate-900 border border-slate-300 group-hover:bg-indigo-50'
                  }`}>
                    {meta.icon}
                  </div>

                  {meta.tag && (
                    <span 
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                        isNoc
                          ? 'bg-indigo-100 border border-indigo-300 text-indigo-950'
                          : 'bg-slate-100 text-slate-900 border border-slate-300'
                      }`}
                      style={{ color: '#0f172a' }}
                    >
                      {isNoc && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      {meta.tag}
                    </span>
                  )}
                </div>

                {/* Başlık ve Açıklama: Doğrudan Siyah ve Net */}
                <div className="space-y-1.5 mb-5">
                  <h3 
                    className="text-lg font-black tracking-tight flex items-center justify-between"
                    style={{ color: '#0f172a' }}
                  >
                    <span>{dept.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-600" />
                  </h3>
                  <p 
                    className="text-xs font-bold leading-relaxed"
                    style={{ color: '#334155' }}
                  >
                    {meta.subtitle}
                  </p>
                </div>

                {/* Alt Bilgi */}
                <div 
                  className="pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs font-black"
                  style={{ borderTopColor: '#e2e8f0' }}
                >
                  <span 
                    className="flex items-center gap-1.5 font-bold"
                    style={{ color: '#1e293b' }}
                  >
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    {dept.staff.length} Personel
                  </span>
                  <span 
                    className="group-hover:underline font-black text-indigo-600"
                    style={{ color: '#4338ca' }}
                  >
                    Cetveli Aç →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Alt Bilgi & Zarif İmza Alanı */}
      <footer className="w-full max-w-5xl mx-auto pt-6 pb-2 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>RSCM Operasyon Merkezi • v2.4</span>
        </div>

        {/* Çok hafif, zarif, göze batmayan "erek" imzası */}
        <div 
          className="select-none text-xs tracking-widest transition-all duration-300 opacity-75 hover:opacity-100 cursor-default text-slate-600 hover:text-indigo-800"
          title="Designed & Developed by i.erek"
        >
          <span className="text-[11px] font-mono tracking-tighter opacity-75">/</span>
          <span className="font-serif italic font-black tracking-wider mx-1">erek</span>
          <span className="text-[10px] font-mono opacity-60">~</span>
        </div>
      </footer>
    </div>
  );
};


