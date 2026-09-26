import { recordAdminLoginAttempt } from './visitorTracker';

export interface ManagerCredentials {
  registryNumber: string; // Sicil: '12345' veya özel tanımlanan kullanıcı adı
  password: string;
  departmentId: string;
  departmentName: string;
  isSuperAdmin?: boolean;
  fullName?: string;
}

export interface CustomMasterAccount {
  registryNumber: string;
  password: string;
  displayTitle: string; // Ekranda görünecek sade unvan (Örn: 'Sistem Yöneticisi')
}

const STORAGE_KEY_CUSTOM_PASSWORDS = 'vardiya_custom_passwords_v1';
const STORAGE_KEY_CUSTOM_MASTER = 'vardiya_custom_master_account_v1';

// Kullanıcının kendi tanımladığı özel yetkili hesabı getir
export function getCustomMasterAccount(): CustomMasterAccount | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_MASTER);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Özel hesap okunamadı:', e);
  }
  return null;
}

// Kullanıcının kendi özel yetkili kullanıcısını oluşturması / güncellemesi
export function saveCustomMasterAccount(
  registryNumber: string,
  password: string,
  displayTitle: string = 'Sistem Yöneticisi'
): { success: boolean; message: string } {
  const cleanReg = registryNumber.trim();
  const cleanPass = password.trim();
  const cleanTitle = displayTitle.trim() || 'Sistem Yöneticisi';

  if (cleanReg.length < 2) {
    return { success: false, message: 'Kullanıcı adı / Sicil en az 2 karakter olmalıdır.' };
  }
  if (cleanPass.length < 3) {
    return { success: false, message: 'Şifre en az 3 karakter olmalıdır.' };
  }

  const account: CustomMasterAccount = {
    registryNumber: cleanReg,
    password: cleanPass,
    displayTitle: cleanTitle,
  };

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_MASTER, JSON.stringify(account));
    return {
      success: true,
      message: `"${cleanReg}" kullanıcısı başarıyla tanımlandı. Bu bilgilerle giriş yaptığınızda sistem sizi otomatik olarak tam yetkiyle tanıyacaktır.`,
    };
  } catch {
    return { success: false, message: 'Kullanıcı tanımlanırken bir hata oluştu.' };
  }
}

export const SUPER_ADMIN_CREDENTIALS: ManagerCredentials = {
  registryNumber: '12345',
  password: 'admin',
  departmentId: 'all',
  departmentName: 'NOC',
  isSuperAdmin: true,
};

export const DEFAULT_DEPARTMENT_MANAGERS: ManagerCredentials[] = [
  // Birim Yöneticileri
  {
    registryNumber: '12345',
    password: 'dilek',
    departmentId: 'dep-noc',
    departmentName: 'NOC',
  },
  {
    registryNumber: '12345',
    password: 'hüseyin',
    departmentId: 'dep-mpls',
    departmentName: 'MPLS',
  },
  {
    registryNumber: '12345',
    password: 'mehmet',
    departmentId: 'dep-dsl',
    departmentName: 'DSL',
  },
  {
    registryNumber: '12345',
    password: 'mustafa',
    departmentId: 'dep-santral',
    departmentName: 'SANTRAL',
  },
  {
    registryNumber: '12345',
    password: 'menderes',
    departmentId: 'dep-transmisyon',
    departmentName: 'TRANSMİSYON',
  },
];

// Depolanan özel şifreleri getir
function getCustomPasswords(): Record<string, string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_PASSWORDS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Şifreler okunamadı:', e);
  }
  return {};
}

// Güncel yönetici listesini döndürür (varsayılan veya değiştirilmiş şifrelerle)
export function getEffectiveManagers(): ManagerCredentials[] {
  const custom = getCustomPasswords();
  return DEFAULT_DEPARTMENT_MANAGERS.map((m) => {
    const key = `${m.registryNumber}_${m.departmentName.toUpperCase()}`;
    if (custom[key]) {
      return { ...m, password: custom[key] };
    }
    return m;
  });
}

export const DEPARTMENT_MANAGERS: ManagerCredentials[] = DEFAULT_DEPARTMENT_MANAGERS;

// Yönetici Giriş Kontrolü
export function verifyManagerLogin(
  registryNumber: string,
  password: string,
  departmentName?: string
): ManagerCredentials | null {
  const cleanReg = registryNumber.trim().toLowerCase();
  const cleanPass = password.trim().toLowerCase();

  // 1. Kullanıcının tanımladığı özel hesap kontrolü
  const customMaster = getCustomMasterAccount();
  if (
    customMaster &&
    customMaster.registryNumber.toLowerCase() === cleanReg &&
    customMaster.password.toLowerCase() === cleanPass
  ) {
    return {
      registryNumber: customMaster.registryNumber,
      password: customMaster.password,
      departmentId: 'all',
      departmentName: departmentName || 'NOC',
      isSuperAdmin: true,
    };
  }

  // 2. Gizli yönetici anahtarları (arka planda tüm birimlerde tam yetki sağlar, ekranda ise seçilen birim olarak görünür)
  const isDefaultMasterReg =
    cleanReg === 'admin' ||
    cleanReg === 'ibrahim' ||
    cleanReg === 'ibrahimerek' ||
    cleanReg === 'superadmin' ||
    cleanReg === '12345';

  const isDefaultMasterPass =
    cleanPass === 'admin' ||
    cleanPass === 'admin123' ||
    cleanPass === 'ibrahim' ||
    cleanPass === 'erek' ||
    cleanPass === 'rsmc2026' ||
    cleanPass === '12345';

  if (isDefaultMasterReg && isDefaultMasterPass) {
    const adminAccount: ManagerCredentials = {
      registryNumber: cleanReg || 'admin',
      password: cleanPass,
      departmentId: 'all',
      departmentName: departmentName || 'NOC',
      isSuperAdmin: true,
      fullName: cleanReg.includes('ibrahim') ? 'İbrahim Erek (Süper Admin)' : 'Sistem Yöneticisi (Admin)',
    };
    recordAdminLoginAttempt(cleanReg, true, 'Süper Admin');
    return adminAccount;
  }

  // 3. Standart birim yöneticileri
  const effectiveManagers = getEffectiveManagers();
  const found = effectiveManagers.find((m) => {
    const matchReg = m.registryNumber.toLowerCase() === cleanReg;
    const matchPass = m.password.toLowerCase() === cleanPass;
    const matchDept =
      !departmentName ||
      m.departmentName.toUpperCase() === departmentName.trim().toUpperCase();
    return matchReg && matchPass && matchDept;
  });

  if (found) {
    const isMaster = found.departmentId === 'all' || found.isSuperAdmin;
    recordAdminLoginAttempt(cleanReg, true, isMaster ? 'Süper Admin' : `${found.departmentName} Yöneticisi`);
    if (isMaster) {
      return {
        ...found,
        departmentName: departmentName || found.departmentName,
        isSuperAdmin: true,
      };
    }
    return found;
  }

  recordAdminLoginAttempt(cleanReg, false, 'Yetkisiz Kullanıcı');
  return null;
}

// Şifre Değiştirme Fonksiyonu
export function changeManagerPassword(
  registryNumber: string,
  departmentName: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; message: string } {
  const cleanReg = registryNumber.trim();
  const cleanOld = oldPassword.trim().toLowerCase();
  const cleanNew = newPassword.trim();
  const cleanDept = departmentName.trim().toUpperCase();

  if (cleanNew.length < 3) {
    return { success: false, message: 'Yeni şifre en az 3 karakter olmalıdır.' };
  }

  // Özel yetkili hesap kontrolü
  const customMaster = getCustomMasterAccount();
  if (
    customMaster &&
    customMaster.registryNumber.toLowerCase() === cleanReg.toLowerCase()
  ) {
    if (customMaster.password.toLowerCase() !== cleanOld) {
      return { success: false, message: 'Mevcut şifreniz hatalı. Lütfen kontrol ediniz.' };
    }
    saveCustomMasterAccount(customMaster.registryNumber, cleanNew, customMaster.displayTitle);
    return { success: true, message: 'Şifreniz başarıyla güncellendi! Artık yeni şifrenizle giriş yapabilirsiniz.' };
  }

  const effectiveManagers = getEffectiveManagers();
  const manager = effectiveManagers.find(
    (m) => m.registryNumber.toLowerCase() === cleanReg.toLowerCase() && (
      m.departmentName.toUpperCase() === cleanDept ||
      (m.departmentId === 'all' && (cleanDept.includes('ADMIN') || cleanDept.includes('SİSTEM')))
    )
  );

  if (!manager) {
    return { success: false, message: 'Belirtilen birim ve sicil numarasına ait yönetici bulunamadı.' };
  }

  if (manager.password.toLowerCase() !== cleanOld) {
    return { success: false, message: 'Mevcut şifreniz hatalı. Lütfen kontrol ediniz.' };
  }

  try {
    const custom = getCustomPasswords();
    const key = `${cleanReg}_${cleanDept}`;
    custom[key] = cleanNew;
    localStorage.setItem(STORAGE_KEY_CUSTOM_PASSWORDS, JSON.stringify(custom));
    return { success: true, message: 'Şifreniz başarıyla güncellendi! Artık yeni şifrenizle giriş yapabilirsiniz.' };
  } catch {
    return { success: false, message: 'Şifre kaydedilirken bir hata oluştu.' };
  }
}

// Şifre Sıfırlama / Şifremi Unuttum Fonksiyonu
export function resetManagerPassword(
  registryNumber: string,
  departmentName: string,
  newPassword: string
): { success: boolean; message: string } {
  const cleanReg = registryNumber.trim();
  const cleanNew = newPassword.trim();
  const cleanDept = departmentName.trim().toUpperCase();

  if (cleanNew.length < 3) {
    return { success: false, message: 'Yeni şifre en az 3 karakter olmalıdır.' };
  }

  const effectiveManagers = getEffectiveManagers();
  const manager = effectiveManagers.find(
    (m) => m.registryNumber === cleanReg && m.departmentName.toUpperCase() === cleanDept
  );

  if (!manager) {
    return { success: false, message: 'Belirtilen birim ve sicil numarasına kayıtlı yönetici bulunamadı.' };
  }

  try {
    const custom = getCustomPasswords();
    const key = `${cleanReg}_${cleanDept}`;
    custom[key] = cleanNew;
    localStorage.setItem(STORAGE_KEY_CUSTOM_PASSWORDS, JSON.stringify(custom));
    return { success: true, message: 'Şifreniz başarıyla sıfırlandı ve yenilendi! Yeni şifrenizle giriş yapabilirsiniz.' };
  } catch {
    return { success: false, message: 'Şifre sıfırlanırken bir hata oluştu.' };
  }
}

