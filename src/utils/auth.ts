export interface ManagerCredentials {
  registryNumber: string; // Sicil: '12345'
  password: string;
  departmentId: string;
  departmentName: string;
}

const STORAGE_KEY_CUSTOM_PASSWORDS = 'vardiya_custom_passwords_v1';

export const DEFAULT_DEPARTMENT_MANAGERS: ManagerCredentials[] = [
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
  const cleanReg = registryNumber.trim();
  const cleanPass = password.trim().toLowerCase();
  const effectiveManagers = getEffectiveManagers();

  const found = effectiveManagers.find((m) => {
    const matchReg = m.registryNumber === cleanReg;
    const matchPass = m.password.toLowerCase() === cleanPass;
    const matchDept = !departmentName || m.departmentName.toUpperCase() === departmentName.trim().toUpperCase();
    return matchReg && matchPass && matchDept;
  });

  return found || null;
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

  const effectiveManagers = getEffectiveManagers();
  const manager = effectiveManagers.find(
    (m) => m.registryNumber === cleanReg && m.departmentName.toUpperCase() === cleanDept
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

