import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  X,
  KeyRound,
  Building2,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Key,
  HelpCircle,
} from 'lucide-react';
import {
  verifyManagerLogin,
  changeManagerPassword,
  resetManagerPassword,
  ManagerCredentials,
} from '../utils/auth';

interface ManagerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (manager: ManagerCredentials) => void;
  isDark?: boolean;
}

type AuthModalMode = 'login' | 'change_password' | 'forgot_password';

export const ManagerLoginModal: React.FC<ManagerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [mode, setMode] = useState<AuthModalMode>('login');

  // Ortak Alanlar
  const [department, setDepartment] = useState('');
  const [registryNumber, setRegistryNumber] = useState('');

  // Giriş Alanları
  const [password, setPassword] = useState('');

  // Şifre Değiştirme & Sıfırlama Alanları
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Durum Mesajları
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFormState = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetFormState();
    setMode('login');
    onClose();
  };

  // 1. Giriş Yapma
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!department) {
      setError('Lütfen görev yaptığınız birimi seçiniz.');
      return;
    }

    const manager = verifyManagerLogin(registryNumber, password, department);
    if (manager) {
      onSuccess(manager);
      resetFormState();
      setMode('login');
      onClose();
    } else {
      setError('Hatalı sicil veya şifre! Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  // 2. Şifre Değiştirme
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!department) {
      setError('Lütfen birim seçiniz.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (newPassword.length < 3) {
      setError('Yeni şifre en az 3 karakter olmalıdır.');
      return;
    }

    const result = changeManagerPassword(registryNumber, department, oldPassword, newPassword);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setMode('login');
        setPassword(newPassword);
        setSuccessMsg(null);
      }, 1800);
    } else {
      setError(result.message);
    }
  };

  // 3. Şifremi Unuttum / Sıfırlama
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!department) {
      setError('Lütfen birim seçiniz.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (newPassword.length < 3) {
      setError('Yeni şifre en az 3 karakter olmalıdır.');
      return;
    }

    const result = resetManagerPassword(registryNumber, department, newPassword);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setMode('login');
        setPassword(newPassword);
        setSuccessMsg(null);
      }, 1800);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={handleClose} 
      />
      
      <div className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all duration-300 animate-in zoom-in-95 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 shadow-indigo-500/10 text-white' 
          : 'bg-white border-slate-100 shadow-indigo-500/5 text-slate-900'
      }`}>
        <div className="relative p-7 sm:p-8">
          {/* Kapatma Butonu */}
          <button 
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Başlık ve İkon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/30 mb-3">
              {mode === 'login' && <ShieldCheck className="w-7 h-7 text-white" />}
              {mode === 'change_password' && <KeyRound className="w-7 h-7 text-white" />}
              {mode === 'forgot_password' && <HelpCircle className="w-7 h-7 text-white" />}
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {mode === 'login' && 'Yönetici Girişi'}
              {mode === 'change_password' && 'Şifremi Değiştir'}
              {mode === 'forgot_password' && 'Şifre Sıfırlama'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {mode === 'login' && 'Yetkili nöbet yönetimi için lütfen giriş yapınız.'}
              {mode === 'change_password' && 'Mevcut şifrenizi girerek yeni şifrenizi belirleyin.'}
              {mode === 'forgot_password' && 'Sicil ve birim bilginizle yeni şifrenizi oluşturun.'}
            </p>
          </div>

          {/* 1. GİRİŞ FORMU */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    className={`block w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-hidden transition-all text-sm font-bold appearance-none cursor-pointer ${
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

              {/* Sicil Numarası */}
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
                    className={`block w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-hidden transition-all text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                    ŞİFRE
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setMode('forgot_password');
                    }}
                    className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-hidden transition-all text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>GİRİŞ YAP</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('change_password');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Şifremi Değiştirmek İstiyorum</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. ŞİFRE DEĞİŞTİRME FORMU */}
          {mode === 'change_password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {/* Birim Seçimi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                  BİRİM
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                  >
                    <option value="" disabled>Birim Seçiniz...</option>
                    <option value="NOC">NOC</option>
                    <option value="MPLS">MPLS</option>
                    <option value="DSL">DSL</option>
                    <option value="SANTRAL">SANTRAL</option>
                    <option value="TRANSMİSYON">TRANSMİSYON</option>
                  </select>
                </div>
              </div>

              {/* Sicil Numarası */}
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
                    className={`block w-full pl-11 pr-4 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Mevcut Şifre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                  MEVCUT ŞİFRE
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="Mevcut şifreniz"
                  />
                </div>
              </div>

              {/* Yeni Şifre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                    YENİ ŞİFRE
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`block w-full px-3 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="En az 3 karakter"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                    TEKRAR
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full px-3 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="Yeni şifre tekrar"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>ŞİFREYİ GÜNCELLE</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Giriş Ekranına Dön</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. ŞİFREMİ UNUTTUM FORMU */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {/* Birim Seçimi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                  BİRİMİNİZİ SEÇİN
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                  >
                    <option value="" disabled>Birim Seçiniz...</option>
                    <option value="NOC">NOC</option>
                    <option value="MPLS">MPLS</option>
                    <option value="DSL">DSL</option>
                    <option value="SANTRAL">SANTRAL</option>
                    <option value="TRANSMİSYON">TRANSMİSYON</option>
                  </select>
                </div>
              </div>

              {/* Sicil Numarası */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                  SİCİL NUMARASI DOĞRULAMA
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
                    className={`block w-full pl-11 pr-4 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="Örn: 12345"
                  />
                </div>
              </div>

              {/* Yeni Şifre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                    YENİ ŞİFRENİZ
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`block w-full px-3 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="Yeni şifre"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                    YENİ ŞİFRE TEKRAR
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full px-3 py-2.5 rounded-xl border-2 outline-hidden transition-all text-xs sm:text-sm font-bold ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-100 focus:border-indigo-500 text-slate-900'
                    }`}
                    placeholder="Şifre tekrarı"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>ŞİFREYİ SIFIRLA & YENİLE</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Giriş Ekranına Dön</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

