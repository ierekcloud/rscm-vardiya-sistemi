import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, X, KeyRound, Building2, ChevronRight } from 'lucide-react';
import { verifyManagerLogin, ManagerCredentials } from '../utils/auth';

interface ManagerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (manager: ManagerCredentials) => void;
  isDark?: boolean;
}

export const ManagerLoginModal: React.FC<ManagerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [registryNumber, setRegistryNumber] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!department) {
      setError('Lütfen görev yaptığınız birimi seçiniz.');
      return;
    }

    const manager = verifyManagerLogin(registryNumber, password);
    if (manager) {
      // Girilen birim ile yetkili birim eşleşiyor mu?
      if (manager.departmentName.toUpperCase() !== department.toUpperCase()) {
        setError(`Bu sicil numarası ${manager.departmentName} birimine aittir. Lütfen doğru birimi seçiniz.`);
        return;
      }
      
      onSuccess(manager);
      setRegistryNumber('');
      setPassword('');
      setDepartment('');
      setError(null);
      onClose();
    } else {
      setError('Hatalı sicil veya şifre! Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] border shadow-2xl transition-all duration-300 animate-in zoom-in-95 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 shadow-indigo-500/10' 
          : 'bg-white border-slate-100 shadow-indigo-500/5'
      }`}>
        <div className="relative p-8">
          {/* Kapatma */}
          <button 
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/30 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Yönetici Paneli
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Birim Seçimi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                BİRİM SEÇİNİZ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 rounded-xl border-2 outline-hidden transition-all text-sm font-bold appearance-none cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                      : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                  }`}
                >
                  <option value="" disabled>Seçim Yapınız...</option>
                  <option value="NOC">NOC</option>
                  <option value="MPLS">MPLS</option>
                  <option value="DSL">DSL</option>
                  <option value="SANTRAL">SANTRAL</option>
                  <option value="TRANSMİSYON">TRANSMİSYON</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                  SİCİL NUMARASI
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={registryNumber}
                    onChange={(e) => setRegistryNumber(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-3.5 rounded-xl border-2 outline-hidden transition-all text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                  ŞİFRE
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-3.5 rounded-xl border-2 outline-hidden transition-all text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>GİRİŞ YAP</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
