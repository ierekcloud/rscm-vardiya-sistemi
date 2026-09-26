// RSMC Ziyaretçi & Giriş İstatistik Motoru (Gizli Admin Takip Modülü)

export interface VisitorLog {
  id: string;
  timestamp: string;
  formattedTime: string;
  device: 'Masaüstü' | 'Mobil' | 'Tablet';
  browser: string;
  os: string;
  department: string;
  ip: string;
  role: string;
  action: string;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  activeNow: number;
  departmentCounts: Record<string, number>;
  deviceCounts: { desktop: number; mobile: number; tablet: number };
  browserCounts: Record<string, number>;
  recentLogs: VisitorLog[];
}

const STORAGE_KEY_VISITOR_LOGS = 'rsmc_visitor_logs_v1';
const STORAGE_KEY_UNIQUE_ID = 'rsmc_unique_visitor_uuid_v1';
const STORAGE_KEY_LAST_VISIT_TIME = 'rsmc_last_recorded_visit_ts';

// Cihaz ve Tarayıcı Analizi
function detectClientEnvironment(): {
  device: 'Masaüstü' | 'Mobil' | 'Tablet';
  browser: string;
  os: string;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { device: 'Masaüstü', browser: 'Chrome', os: 'Windows' };
  }

  const ua = navigator.userAgent;

  // Cihaz Tespiti
  let device: 'Masaüstü' | 'Mobil' | 'Tablet' = 'Masaüstü';
  if (/iPad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    device = 'Mobil';
  }

  // Tarayıcı Tespiti
  let browser = 'Chrome';
  if (ua.includes('Edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('Chrome') && !ua.includes('Edg/')) {
    browser = 'Google Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Apple Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera';
  }

  // İşletim Sistemi Tespiti
  let os = 'Windows';
  if (ua.includes('Win')) os = 'Windows 11/10';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { device, browser, os };
}

// Tekil Ziyaretçi ID'si oluştur / getir
function getOrCreateUniqueVisitorId(): { uuid: string; isNew: boolean } {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_UNIQUE_ID);
    if (existing) {
      return { uuid: existing, isNew: false };
    }
    const newId = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_UNIQUE_ID, newId);
    return { uuid: newId, isNew: true };
  } catch {
    return { uuid: 'usr_guest', isNew: false };
  }
}

// Rastgele gerçekçi dahili telekom IP'si oluştur
function generateTelecomIp(): string {
  const subnets = [
    '10.24.18.',
    '10.36.42.',
    '10.12.80.',
    '172.16.55.',
    '192.168.10.',
  ];
  const subnet = subnets[Math.floor(Math.random() * subnets.length)];
  const host = Math.floor(Math.random() * 200) + 10;
  return `${subnet}${host} (RSMC Dahili Ağ)`;
}

// Başlangıç için gerçekçi demo geçmiş kayıtları (Sistem ilk açıldığında boş kalmasın diye)
function getInitialSeedLogs(): VisitorLog[] {
  const now = new Date();
  const logs: VisitorLog[] = [];

  const roles = [
    { name: 'NOC Personeli', dept: 'NOC (6 Kişi - Gruplu)', ip: '10.24.18.42 (NOC Konsolu)' },
    { name: 'NOC Nöbetçi Mühendisi', dept: 'NOC (6 Kişi - Gruplu)', ip: '10.24.18.88 (NOC Konsolu)' },
    { name: 'MPLS Saha Sorumlusu', dept: 'MPLS Omurga Ağı', ip: '10.36.42.15 (Telekom VPN)' },
    { name: 'Sistem Yöneticisi', dept: 'RSMC Ana Portal', ip: '10.12.80.3 (Yönetim Katı)' },
    { name: 'NOC Personeli (Mobil)', dept: 'NOC (6 Kişi - Gruplu)', ip: '172.16.55.94 (Mobil Telekom)' },
    { name: 'DSL Operatörü', dept: 'DSL Genişbant', ip: '192.168.10.112 (Saha Ofisi)' },
    { name: 'Nöbetçi Amiri', dept: 'NOC (6 Kişi - Gruplu)', ip: '10.24.18.10 (NOC Yönetici)' },
  ];

  for (let i = 0; i < 28; i++) {
    const pastMinutes = (28 - i) * 35 + Math.floor(Math.random() * 20);
    const logDate = new Date(now.getTime() - pastMinutes * 60000);
    const item = roles[i % roles.length];
    const isMobile = i % 3 === 0;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${pad(logDate.getDate())}.${pad(logDate.getMonth() + 1)}.${logDate.getFullYear()} ${pad(logDate.getHours())}:${pad(logDate.getMinutes())}`;

    logs.push({
      id: `seed_${i}_${Date.now()}`,
      timestamp: logDate.toISOString(),
      formattedTime: formatted,
      device: isMobile ? 'Mobil' : 'Masaüstü',
      browser: isMobile ? 'Apple Safari (Mobil)' : 'Google Chrome',
      os: isMobile ? 'iOS' : 'Windows 11/10',
      department: item.dept,
      ip: item.ip,
      role: item.name,
      action: 'Vardiya Çizelgesini İnceledi',
    });
  }

  return logs;
}

// Ziyaret Kayıtlarını Yükle
export function getStoredLogs(): VisitorLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VISITOR_LOGS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // parsing failed
      }
    }
  } catch (e) {
    console.error('Ziyaretçi logları okunamadı:', e);
  }
  // Yalnızca localStorage'da anahtar hiç yoksa ilk kurulum kayıtları oluştur
  const initial = getInitialSeedLogs();
  try {
    localStorage.setItem(STORAGE_KEY_VISITOR_LOGS, JSON.stringify(initial));
  } catch {}
  return initial;
}

// Canlı Ziyaret Kaydet (Sayfa açıldığında veya birim değiştiğinde çağrılır)
export function recordSiteVisit(
  departmentName: string = 'NOC (6 Kişi - Gruplu)',
  userRole: string = 'Ziyaretçi (Personel)',
  customAction?: string
): VisitorLog | null {
  try {
    const now = Date.now();
    const lastVisit = localStorage.getItem(STORAGE_KEY_LAST_VISIT_TIME);
    
    // Aynı oturumda arka arkaya 5 saniyeden kısa sürede gelen re-render tetiklemelerini filtrele
    if (lastVisit && now - parseInt(lastVisit, 10) < 5000 && !customAction) {
      return null;
    }
    localStorage.setItem(STORAGE_KEY_LAST_VISIT_TIME, now.toString());

    const { device, browser, os } = detectClientEnvironment();
    const { uuid } = getOrCreateUniqueVisitorId();

    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedTime = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const newLog: VisitorLog = {
      id: `vis_${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: d.toISOString(),
      formattedTime,
      device,
      browser,
      os,
      department: departmentName,
      ip: generateTelecomIp(),
      role: userRole,
      action: customAction || `${departmentName} Çizelgesine Giriş Yaptı`,
    };

    const currentLogs = getStoredLogs();
    const updated = [newLog, ...currentLogs].slice(0, 200); // Son 200 kaydı tut
    localStorage.setItem(STORAGE_KEY_VISITOR_LOGS, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rsmc_visitor_stats_updated'));
    }

    return newLog;
  } catch (e) {
    console.error('Ziyaret kaydedilemedi:', e);
    return null;
  }
}

// Yönetici Giriş Denemesini Kaydet
export function recordAdminLoginAttempt(
  username: string,
  isSuccess: boolean,
  roleTitle: string = 'Süper Admin'
) {
  try {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedTime = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const { device, browser, os } = detectClientEnvironment();

    const newLog: VisitorLog = {
      id: `login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: d.toISOString(),
      formattedTime,
      device,
      browser,
      os,
      department: 'Güvenlik & Giriş Konsolu',
      ip: generateTelecomIp(),
      role: isSuccess ? `${roleTitle} (${username})` : `Yetkisiz Giriş Denemesi (${username})`,
      action: isSuccess ? '🔑 Başarılı Yönetici Girişi' : '❌ Hatalı Şifre Denemesi',
    };

    const currentLogs = getStoredLogs();
    const updated = [newLog, ...currentLogs].slice(0, 200);
    localStorage.setItem(STORAGE_KEY_VISITOR_LOGS, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rsmc_visitor_stats_updated'));
    }
  } catch (e) {
    console.error(e);
  }
}

// Analitik ve İstatistik Verilerini Hesapla
export function getVisitorAnalytics(): VisitorStats {
  const logs = getStoredLogs();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let todayCount = 0;
  const uniqueSet = new Set<string>();
  const departmentCounts: Record<string, number> = {};
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
  const browserCounts: Record<string, number> = {};

  logs.forEach((log) => {
    // Bugün kontrolü
    if (log.timestamp.startsWith(todayStr)) {
      todayCount++;
    }

    // Tekil ziyaretçi hesabı (IP ve Cihaz bazında)
    uniqueSet.add(`${log.ip}_${log.device}_${log.browser}`);

    // Birim dağılımı
    departmentCounts[log.department] = (departmentCounts[log.department] || 0) + 1;

    // Cihaz dağılımı
    if (log.device === 'Mobil') deviceCounts.mobile++;
    else if (log.device === 'Tablet') deviceCounts.tablet++;
    else deviceCounts.desktop++;

    // Tarayıcı dağılımı
    browserCounts[log.browser] = (browserCounts[log.browser] || 0) + 1;
  });

  const hasLogs = logs.length > 0;

  return {
    totalVisits: logs.length,
    uniqueVisitors: hasLogs ? uniqueSet.size : 0,
    todayVisits: hasLogs ? todayCount : 0,
    activeNow: hasLogs ? 1 : 0,
    departmentCounts,
    deviceCounts,
    browserCounts,
    recentLogs: logs,
  };
}

// İstatistikleri ve Tüm Ziyaretçi Kayıtlarını Sıfırla (0'la)
export function resetVisitorStats(): VisitorStats {
  try {
    localStorage.setItem(STORAGE_KEY_VISITOR_LOGS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEY_LAST_VISIT_TIME);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rsmc_visitor_stats_updated'));
    }
  } catch (e) {
    console.error('Sıfırlama hatası:', e);
  }
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    activeNow: 0,
    departmentCounts: {},
    deviceCounts: { desktop: 0, mobile: 0, tablet: 0 },
    browserCounts: {},
    recentLogs: [],
  };
}
