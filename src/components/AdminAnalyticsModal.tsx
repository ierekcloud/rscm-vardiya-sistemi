import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Eye,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  RefreshCw,
  Download,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  getVisitorAnalytics,
  resetVisitorStats,
  VisitorStats,
  VisitorLog,
} from '../utils/visitorTracker';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuperAdmin: boolean;
  currentManagerName?: string;
  isDark?: boolean;
}

export const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({
  isOpen,
  onClose,
  isSuperAdmin,
  currentManagerName = 'İbrahim Erek',
  isDark = false,
}) => {
  // Kesin Gizlilik: Süper admin değilse ASLA render etme
  if (!isOpen || !isSuperAdmin) return null;

  const [stats, setStats] = useState<VisitorStats>(() => getVisitorAnalytics());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDevice, setFilterDevice] = useState<'ALL' | 'Masaüstü' | 'Mobil' | 'Tablet'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Canlı güncellemeleri dinle
  React.useEffect(() => {
    const onStatsUpdate = () => {
      setStats(getVisitorAnalytics());
    };
    window.addEventListener('rsmc_visitor_stats_updated', onStatsUpdate);
    return () => {
      window.removeEventListener('rsmc_visitor_stats_updated', onStatsUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats(getVisitorAnalytics());
      setIsRefreshing(false);
    }, 400);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => {
        setConfirmReset(false);
      }, 5000);
      return;
    }

    const cleanStats = resetVisitorStats();
    setStats(cleanStats);
    setConfirmReset(false);
    setCopiedNotice('✓ Ziyaretçi sayacı ve tüm geçmiş hareketler başarıyla sıfırlandı (0).');
    setTimeout(() => setCopiedNotice(null), 4000);
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Zaman', 'Kullanıcı Rolü', 'Birim / Sayfa', 'Cihaz', 'Tarayıcı', 'İşletim Sistemi', 'Dahili IP / Ağ', 'Eylem'];
      const rows = stats.recentLogs.map((log) => [
        `"${log.formattedTime}"`,
        `"${log.role}"`,
        `"${log.department}"`,
        `"${log.device}"`,
        `"${log.browser}"`,
        `"${log.os}"`,
        `"${log.ip}"`,
        `"${log.action}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `RSMC_Ziyaretci_Raporu_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCopiedNotice('✓ Ziyaret raporu CSV olarak indirildi');
      setTimeout(() => setCopiedNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrelenmiş Loglar
  const filteredLogs = useMemo(() => {
    return stats.recentLogs.filter((log) => {
      const matchesSearch =
        searchTerm === '' ||
        log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.formattedTime.includes(searchTerm);

      const matchesDevice = filterDevice === 'ALL' || log.device === filterDevice;

      return matchesSearch && matchesDevice;
    });
  }, [stats.recentLogs, searchTerm, filterDevice]);

  // Toplam cihaz yüzdesi
  const totalDevices = stats.deviceCounts.desktop + stats.deviceCounts.mobile + stats.deviceCounts.tablet;
  const desktopPct = totalDevices > 0 ? Math.round((stats.deviceCounts.desktop / totalDevices) * 100) : 0;
  const mobilePct = totalDevices > 0 ? Math.round((stats.deviceCounts.mobile / totalDevices) * 100) : 0;
  const tabletPct = totalDevices > 0 ? Math.max(0, 100 - desktopPct - mobilePct) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto backdrop-blur-md bg-slate-950/80 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-indigo-900/60 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Üst Güvenlik Başlığı */}
        <div
          className={`px-6 py-4.5 border-b flex items-center justify-between gap-4 shrink-0 ${
            isDark
              ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-indigo-900/50'
              : 'bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border-indigo-950'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>RSMC Gizli Analitik & Ziyaretçi Konsolu</span>
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                  <Lock className="w-3 h-3" />
                  Sadece Süper Admin
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 font-medium mt-0.5">
                Hoş geldiniz <strong className="text-amber-300">{currentManagerName}</strong>. Bu sayfa diğer kullanıcılar ve personeller tarafından kesinlikle görüntülenemez.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title="Verileri Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Gövdesi */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Bildirim */}
          {copiedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{copiedNotice}</span>
            </div>
          )}

          {/* 4 Ana Metrik Kartı */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* 1. Toplam Ziyaret */}
            <div
              className={`p-4.5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Toplam Ziyaret</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                {stats.totalVisits}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Sayfa açılış ve görüntüleme adedi
              </p>
            </div>

            {/* 2. Tekil Ziyaretçi */}
            <div
              className={`p-4.5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tekil Ziyaretçi</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {stats.uniqueVisitors}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Farklı cihaz, IP ve tarayıcı sayısı
              </p>
            </div>

            {/* 3. Bugün Girenler */}
            <div
              className={`p-4.5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Bugün Girenler</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {stats.todayVisits}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Bugün sisteme giriş yapanlar
              </p>
            </div>

            {/* 4. Canlı Aktif Oturum */}
            <div
              className={`p-4.5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Canlı Durum</span>
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <span>{stats.activeNow}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Şu an canlı gezinen personel
              </p>
            </div>
          </div>

          {/* İki Sütunlu Detay Analizi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sol: Birim Tıklanma & İlgi Dağılımı */}
            <div
              className={`lg:col-span-2 p-5 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700/70' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>Birimler ve Bölüm Ziyaret Oranları</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  Toplam {Object.keys(stats.departmentCounts).length} Birim
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.departmentCounts)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .map(([deptName, count]) => {
                    const countNum = Number(count);
                    const pct = Math.round((countNum / Math.max(1, stats.totalVisits)) * 100);
                    return (
                      <div key={deptName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="truncate">{deptName}</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">
                            {count} Ziyaret (%{pct})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Sağ: Cihaz ve Donanım Analizi */}
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700/70' : 'bg-white border-slate-200'
              }`}
            >
              <h4 className="text-sm font-black flex items-center gap-2 mb-4">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Cihaz & Tarayıcı Dağılımı</span>
              </h4>

              <div className="space-y-3.5">
                {/* Masaüstü */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-slate-500" />
                    <span className="font-bold">Masaüstü (PC)</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    %{desktopPct} ({stats.deviceCounts.desktop})
                  </span>
                </div>

                {/* Mobil */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold">Mobil (Telefon)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    %{mobilePct} ({stats.deviceCounts.mobile})
                  </span>
                </div>

                {/* Tablet */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-amber-500" />
                    <span className="font-bold">Tablet</span>
                  </div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    %{tabletPct} ({stats.deviceCounts.tablet})
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 mt-2">
                  <div style={{ width: `${desktopPct}%` }} className="bg-indigo-500 h-full" title="Masaüstü" />
                  <div style={{ width: `${mobilePct}%` }} className="bg-emerald-500 h-full" title="Mobil" />
                  <div style={{ width: `${tabletPct}%` }} className="bg-amber-500 h-full" title="Tablet" />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Popüler Tarayıcılar
                  </div>
                  {Object.entries(stats.browserCounts)
                    .slice(0, 3)
                    .map(([bName, bCount]) => (
                      <div key={bName} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 truncate">{bName}</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{bCount}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Canlı Ziyaretçi & Giriş Günlüğü Tablosu */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700/70' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-black flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Canlı Ziyaretçi & Hareket Günlüğü</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Son yapılan {filteredLogs.length} ziyaret ve yönetimsel hareket kaydı
                </p>
              </div>

              {/* Arama & Cihaz Filtresi */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rol, birim veya IP ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border font-medium outline-hidden ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <select
                  value={filterDevice}
                  onChange={(e) => setFilterDevice(e.target.value as any)}
                  className={`px-3 py-1.5 text-xs rounded-xl border font-bold outline-hidden cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ALL">Tüm Cihazlar</option>
                  <option value="Masaüstü">Masaüstü</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </div>
            </div>

            {/* Tablo */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700/80">
              <table className="w-full text-left text-xs">
                <thead
                  className={`sticky top-0 z-10 font-bold border-b ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Tarih & Saat</th>
                    <th className="py-2.5 px-3">Ziyaretçi Rolü</th>
                    <th className="py-2.5 px-3">Açılan Sayfa / Birim</th>
                    <th className="py-2.5 px-3">Cihaz & Tarayıcı</th>
                    <th className="py-2.5 px-3">Dahili Ağ IP</th>
                    <th className="py-2.5 px-3">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-bold">
                        Arama kriterlerine uygun ziyaret kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isSuper = log.role.includes('Süper Admin') || log.role.includes('ibrahim');
                      const isLogin = log.action.includes('Giriş');
                      return (
                        <tr
                          key={log.id}
                          className={`transition-colors ${
                            isSuper
                              ? isDark
                                ? 'bg-indigo-950/40 hover:bg-indigo-900/50'
                                : 'bg-indigo-50/70 hover:bg-indigo-100/70'
                              : isDark
                              ? 'hover:bg-slate-850'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {log.formattedTime}
                          </td>
                          <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                                isSuper
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {isSuper && <Lock className="w-3 h-3 text-amber-500" />}
                              {log.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {log.department}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {log.device === 'Mobil' ? (
                                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                              ) : log.device === 'Tablet' ? (
                                <Tablet className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                              )}
                              <span>{log.browser}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {log.ip}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isLogin
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Alt Çubuğu */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ziyaret Raporunu İndir (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
                confirmReset
                  ? 'border-rose-600 bg-rose-600 text-white font-black animate-pulse shadow-rose-600/30'
                  : 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
              }`}
              title={confirmReset ? "Onaylamak için tekrar tıklayın (0'lanır)" : "Tüm Ziyaretçi Sayacını ve Kayıtları Sıfırla"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmReset ? '⚠️ Emin misiniz? Onayla (0\'la)' : 'Sıfırla'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              * Bu veriler sadece admin şifrenizle giriş yapıldığında görüntülenir.
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-black text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
