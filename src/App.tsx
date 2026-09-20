import React, { useState, useEffect, useMemo } from 'react';
import {
  Department,
  GroupId,
  StaffMember,
  GROUPS_CONFIG,
  DayShift,
  MonthlyDepartmentHistory,
  StaffShiftBalance,
  StaffLeave,
} from './types';
import {
  DEFAULT_DEPARTMENTS,
  generateMonthSchedule,
  exportScheduleToCSV,
  TURKISH_MONTHS,
  calculateTargetWorkingDays,
  getGearStartGroup,
  generateYearlyScheduleCsv,
  getRotatedStaff,
} from './utils/shiftLogic';
import { CalendarView } from './components/CalendarView';
import { MatrixTableView } from './components/MatrixTableView';
import { DailyListView } from './components/DailyListView';
import { StaffStatsCard } from './components/StaffStatsCard';
import { ShiftOverrideModal } from './components/ShiftOverrideModal';
import { PrintSheet } from './components/PrintSheet';
import { DepartmentPortal } from './components/DepartmentPortal';
import { ManagerLoginModal } from './components/ManagerLoginModal';
import { AgentAuditModal } from './components/AgentAuditModal';
import { StaffAuditModal } from './components/StaffAuditModal';
import { LeaveManagementModal } from './components/LeaveManagementModal';
import { StaffManagerModal } from './components/StaffManagerModal';
import { ManagerCredentials } from './utils/auth';
import { APP_VERSION_LABEL } from './version';

import { PersonnelSidebar } from './components/PersonnelSidebar';
import {
  Calendar as CalendarIcon,
  Table as TableIcon,
  List as ListIcon,
  Users,
  Printer,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Scale,
  CheckCircle,
  Layers,
  ArrowLeft,
  ArrowLeftRight,
  Play,
  Sun,
  Moon,
  RotateCcw,
  Clock,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  FileSpreadsheet,
  Lock,
  Unlock,
  LogOut,
  AlertTriangle,
  Bot,
  ClipboardCheck,
  UserCheck,
  ChevronDown,
  Palmtree,
  KeyRound,
  Timer,
} from 'lucide-react';

const STORAGE_KEY_DEPTS_V4 = 'vardiya_telekom_depts_v4';
const STORAGE_KEY_ACTIVE_DEPT_V4 = 'vardiya_telekom_active_dept_v4';
const STORAGE_KEY_BALANCES_V4 = 'vardiya_telekom_balances_history_v4';
const STORAGE_KEY_THEME_V4 = 'vardiya_theme_mode';

export default function App() {
  // Tema Tercihi (Varsayılan: Göz yormayan, ferah ve yumuşak Açık Mod)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME_V4);
      if (saved) return saved === 'dark';
      return false; // varsayılan: ferah aydınlık mod
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_THEME_V4, next ? 'dark' : 'light');
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Departmanlar State'i
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEPTS_V4);
      if (saved) {
        const parsed = JSON.parse(saved) as Department[];
        // Kullanıcı isteği: Departman isimlerini sadece kısa halleriyle (NOC vb.) tutalım
        return parsed.map(d => ({
          ...d,
          name: d.name.includes('(') ? d.name.split('(')[0].trim() : d.name
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DEPARTMENTS;
  });

  const [activeDeptId, setActiveDeptId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_DEPT_V4);
      if (saved && departments.some((d) => d.id === saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'dep-noc';
  });

  // Portal Açılış Kontrolü (Varsayılan olarak doğrudan ana takvim ve vardiya çizelgesi açılır)
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(true);

  // Yönetici Giriş Durumu & Modal Kontrolü
  const [currentManager, setCurrentManager] = useState<ManagerCredentials | null>(() => {
    try {
      const saved = sessionStorage.getItem('vardiya_manager_auth');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Yönetici 5 Dakikalık Oturum Süresi (300 Saniye)
  const MANAGER_SESSION_TIMEOUT_SEC = 300;
  const [sessionRemainingSec, setSessionRemainingSec] = useState<number>(() => {
    try {
      const savedAuth = sessionStorage.getItem('vardiya_manager_auth');
      const savedLoginTime = sessionStorage.getItem('vardiya_manager_login_time');
      if (savedAuth && savedLoginTime) {
        const elapsed = Math.floor((Date.now() - Number(savedLoginTime)) / 1000);
        const left = MANAGER_SESSION_TIMEOUT_SEC - elapsed;
        return left > 0 ? left : 0;
      }
    } catch {
      // ignore
    }
    return MANAGER_SESSION_TIMEOUT_SEC;
  });

  // Oturum Süresi Sayacı ve Otomatik Çıkış (5 Dakika)
  useEffect(() => {
    if (!currentManager) {
      setSessionRemainingSec(MANAGER_SESSION_TIMEOUT_SEC);
      return;
    }

    const timer = setInterval(() => {
      setSessionRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleManagerLogout(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentManager]);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Tarih Seçimi (Yıl & Ay) - Eylül ayı için 2026 yılı
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = Ekim (0-indexed)

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Arayüz Kontrolleri
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Özel Gün Değişiklikleri (İstisnai Günler)
  const [overrides, setOverrides] = useState<Record<number, GroupId>>({});

  // Aylar Arası Bakiye Geçmişi
  const [balancesHistory, setBalancesHistory] = useState<MonthlyDepartmentHistory>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BALANCES_V4);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Manuel devir bakiyeleri
  const [manualCarryovers, setManualCarryovers] = useState<Record<string, number>>({});

  // Aktif Görünüm Sekmesi (Yönetici Paneli, Resmi Çizelge, Bakiye, Takvim, Liste)
  const [activeTab, setActiveTab] = useState<'matrix' | 'salary' | 'calendar' | 'list'>('matrix');

  // Bildirim durumu
  const [carryoverSuccess, setCarryoverSuccess] = useState<string | null>(null);

  // Modal
  const [overrideModalShift, setOverrideModalShift] = useState<DayShift | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isStaffAuditModalOpen, setIsStaffAuditModalOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isStaffManagerModalOpen, setIsStaffManagerModalOpen] = useState<boolean>(false);

  // Personel İzin / Rapor Kayıtları (Ay ve Birim bazlı kalıcı saklama)
  const STORAGE_KEY_LEAVES_V4 = 'vardiya_telekom_leaves_v4';
  const [leavesByMonth, setLeavesByMonth] = useState<Record<string, StaffLeave[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEAVES_V4);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Kurumsal Vardiya Planı Oluşturulma Durumu (Varsayılan olarak direkt aktif ve hesaplanmış gelir)
  const [isScheduleGenerated, setIsScheduleGenerated] = useState<boolean>(false);
  const [isWarningsOpen, setIsWarningsOpen] = useState<boolean>(true);

  const handleGenerateSchedule = () => {
    setIsScheduleGenerated(true);
    setIsPortalOpen(false);
    setActiveTab('matrix');
    setCarryoverSuccess(`${TURKISH_MONTHS[selectedMonth]} ${selectedYear} için ${activeDepartment.name} vardiyası başarıyla hesaplandı.`);
    setTimeout(() => setCarryoverSuccess(null), 3500);
  };

  // LocalStorage senkronizasyonu
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEPTS_V4, JSON.stringify(departments));
      localStorage.setItem(STORAGE_KEY_ACTIVE_DEPT_V4, activeDeptId);
      localStorage.setItem(STORAGE_KEY_BALANCES_V4, JSON.stringify(balancesHistory));
      localStorage.setItem(STORAGE_KEY_LEAVES_V4, JSON.stringify(leavesByMonth));
    } catch (e) {
      console.error(e);
    }
  }, [departments, activeDeptId, balancesHistory, leavesByMonth]);

  // Aktif Departman
  const activeDepartment = useMemo(() => {
    return departments.find((d) => d.id === activeDeptId) || departments[0];
  }, [departments, activeDeptId]);

  // Döngüsel Olarak Kaydırılmış (Rotasyonlu) Personel Listesi
  const activeStaffList = useMemo(() => {
    return getRotatedStaff(activeDepartment.staff, selectedYear, selectedMonth);
  }, [activeDepartment.staff, selectedYear, selectedMonth]);

  // Ay içindeki toplam gün sayısı
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Standart aylık çalışma hedefi
  const autoTargetDays = useMemo(() => {
    return calculateTargetWorkingDays(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Önceki aydan devreden gün bakiyeleri
  const prevMonthKey = useMemo(() => {
    let prevM = selectedMonth - 1;
    let prevY = selectedYear;
    if (prevM < 0) {
      prevM = 11;
      prevY -= 1;
    }
    return `${activeDepartment.id}_${prevY}_${prevM}`;
  }, [activeDepartment.id, selectedYear, selectedMonth]);

  // Önceki ayın devir bakiyeleri (Ekim 2026'dan itibaren zincirleme otomatik hesaplama & telafi)
  const carryoverBalances = useMemo(() => {
    const balances: Record<string, number> = {};

    // 1. Manuel girilmiş veya kalıcı kaydedilmiş bakiye kontrolü
    const prevHistory = balancesHistory[prevMonthKey];

    // Projenin başlangıç (milat) ayı: Ekim 2026 (yıl: 2026, ay: 9)
    const baseYear = 2026;
    const baseMonth = 9; // Ekim (0-indexed)
    const totalMonthsFromBase = (selectedYear - baseYear) * 12 + (selectedMonth - baseMonth);

    // Eğer kullanıcı Ekim 2026 veya daha önceki bir aydaysa devir 0'dır
    if (totalMonthsFromBase <= 0) {
      activeStaffList.forEach((staff) => {
        balances[staff.id] = manualCarryovers[staff.id] ?? (prevHistory && prevHistory[staff.id] !== undefined ? prevHistory[staff.id] : 0);
      });
      return balances;
    }

    // Ekim 2026'dan seçili aya kadar adım adım zincirleme devir hesaplama
    let runningBalances: Record<string, number> = {};

    for (let step = 0; step < totalMonthsFromBase; step++) {
      const curMonth = (baseMonth + step) % 12;
      const curYear = baseYear + Math.floor((baseMonth + step) / 12);
      const stepKey = `${activeDepartment.id}_${curYear}_${curMonth}`;

      const rotatedStaffForStep = getRotatedStaff(activeDepartment.staff, curYear, curMonth);
      const stepInputBalances: Record<string, number> = {};

      rotatedStaffForStep.forEach((staff) => {
        // Son ayda manuel girilmişse veya geçmişte elle kaydedilmiş bir bakiye varsa önceliklendir
        if (manualCarryovers[staff.id] !== undefined && step === totalMonthsFromBase - 1) {
          stepInputBalances[staff.id] = manualCarryovers[staff.id];
        } else if (balancesHistory[stepKey] && balancesHistory[stepKey][staff.id] !== undefined) {
          stepInputBalances[staff.id] = balancesHistory[stepKey][staff.id];
        } else {
          stepInputBalances[staff.id] = runningBalances[staff.id] || 0;
        }
      });

      const stepLeaves = leavesByMonth[stepKey] || [];
      const summary = generateMonthSchedule(
        curYear,
        curMonth,
        undefined,
        rotatedStaffForStep,
        {},
        stepInputBalances,
        undefined,
        true,
        stepLeaves
      );

      runningBalances = {};
      Object.values(summary.staffStats).forEach((st) => {
        runningBalances[st.staff.id] = st.netBalanceDays;
      });
    }

    // Seçili ay için geçerli devir bakiyelerini ata
    activeStaffList.forEach((staff) => {
      if (manualCarryovers[staff.id] !== undefined) {
        balances[staff.id] = manualCarryovers[staff.id];
      } else if (prevHistory && prevHistory[staff.id] !== undefined) {
        balances[staff.id] = prevHistory[staff.id];
      } else {
        balances[staff.id] = runningBalances[staff.id] || 0;
      }
    });

    return balances;
  }, [
    activeDepartment.id,
    activeDepartment.staff,
    activeStaffList,
    balancesHistory,
    manualCarryovers,
    prevMonthKey,
    selectedMonth,
    selectedYear,
    leavesByMonth,
  ]);

  // Seçili ay ve birime ait izin listesi
  const monthLeaveKey = `${activeDepartment.id}_${selectedYear}_${selectedMonth}`;
  const currentMonthLeaves = useMemo(() => {
    return leavesByMonth[monthLeaveKey] || [];
  }, [leavesByMonth, monthLeaveKey]);

  const handleAddLeave = (newLeave: Omit<StaffLeave, 'id'>) => {
    const leave: StaffLeave = {
      ...newLeave,
      id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setLeavesByMonth((prev) => ({
      ...prev,
      [monthLeaveKey]: [...(prev[monthLeaveKey] || []), leave],
    }));
  };

  const handleDeleteLeave = (id: string) => {
    setLeavesByMonth((prev) => ({
      ...prev,
      [monthLeaveKey]: (prev[monthLeaveKey] || []).filter((l) => l.id !== id),
    }));
  };

  // Aylık Çizelge ve İstatistik Özeti
  const monthSummary = useMemo(() => {
    return generateMonthSchedule(
      selectedYear,
      selectedMonth,
      undefined,
      activeStaffList,
      overrides,
      carryoverBalances,
      undefined,
      true,
      currentMonthLeaves
    );
  }, [selectedYear, selectedMonth, activeStaffList, overrides, carryoverBalances, currentMonthLeaves]);

  // Portalden birim seçilince
  const handleSelectDepartmentFromPortal = (deptId: string) => {
    setActiveDeptId(deptId);
    setIsPortalOpen(false);
    setOverrides({});
    setManualCarryovers({});
    setIsScheduleGenerated(false);
    sessionStorage.setItem('vardiya_portal_visited', 'true');
  };

  // Ay Değiştirme
  const handlePrevMonth = () => {
    if (selectedYear === 2026 && selectedMonth <= 9) {
      // Ekim 2026'dan geriye gidilmesini engelle
      return;
    }
    setOverrides({});
    setManualCarryovers({});
    setIsScheduleGenerated(false);
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setOverrides({});
    setManualCarryovers({});
    setIsScheduleGenerated(false);
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Yönetici Yetki Kontrolü: Giriş yapan yönetici şu an seçili birimin yöneticisi mi?
  const isAdmin = useMemo(() => {
    if (!currentManager) return false;
    return currentManager.departmentId === activeDepartment.id;
  }, [currentManager, activeDepartment.id]);

  // Yönetici Giriş Başarılı Olduğunda
  const handleManagerLoginSuccess = (mgr: ManagerCredentials) => {
    setCurrentManager(mgr);
    setSessionRemainingSec(MANAGER_SESSION_TIMEOUT_SEC);
    try {
      sessionStorage.setItem('vardiya_manager_auth', JSON.stringify(mgr));
      sessionStorage.setItem('vardiya_manager_login_time', Date.now().toString());
    } catch (e) {
      console.error(e);
    }
    setIsLoginModalOpen(false);
    // Yöneticinin kendi birimine otomatik geçiş yap ve portalı kapat
    setActiveDeptId(mgr.departmentId);
    setIsPortalOpen(false);
    setOverrides({});
    setManualCarryovers({});
    setIsScheduleGenerated(true);
    setCarryoverSuccess(`${mgr.departmentName} Yöneticisi (${mgr.registryNumber}) olarak giriş yapıldı. 5 dakikalık yetkili oturumunuz başladı.`);
    setTimeout(() => setCarryoverSuccess(null), 4500);
  };

  // Yönetici Çıkışı (isAutoTimeout = true ise 5 dk dolduğu için çıkış yapılmıştır)
  const handleManagerLogout = (isAutoTimeout: boolean = false) => {
    setCurrentManager(null);
    setSessionRemainingSec(MANAGER_SESSION_TIMEOUT_SEC);
    try {
      sessionStorage.removeItem('vardiya_manager_auth');
      sessionStorage.removeItem('vardiya_manager_login_time');
    } catch (e) {
      console.error(e);
    }
    if (isAutoTimeout) {
      setCarryoverSuccess('Güvenlik nedeniyle 5 dakikalık yönetici oturum süreniz doldu ve sistemden otomatik çıkış yapıldı.');
    } else {
      setCarryoverSuccess('Yönetici oturumu kapatıldı. Düzenleme yetkisi kaldırıldı.');
    }
    setTimeout(() => setCarryoverSuccess(null), 4000);
  };

  // Personel İsim Güncelleme (Yönetici Kontrollü)
  const handleUpdateStaffName = (staffId: string, newName: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setDepartments((prevDepts) => {
      return prevDepts.map((d) => {
        if (d.id !== activeDepartment.id) return d;
        const updatedStaff = d.staff.map((s) => {
          if (s.id === staffId) {
            return { ...s, name: newName };
          }
          return s;
        });
        return { ...d, staff: updatedStaff };
      });
    });
  };

  // Yeni Personel Ekle (Gruba Personel Ekleme)
  const handleAddStaff = (name: string, groupId: GroupId) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const cleanName = name.trim();
    if (!cleanName) return;

    setDepartments((prevDepts) => {
      return prevDepts.map((d) => {
        if (d.id !== activeDepartment.id) return d;
        const groupCount = d.staff.filter((s) => s.groupId === groupId).length;
        const newStaff: StaffMember = {
          id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: cleanName,
          groupId,
          orderInGroup: groupCount + 1,
        };
        return {
          ...d,
          staff: [...d.staff, newStaff],
        };
      });
    });

    setCarryoverSuccess(`Yeni personel "${cleanName}", ${GROUPS_CONFIG[groupId].name} grubuna eklendi.`);
    setTimeout(() => setCarryoverSuccess(null), 3500);
  };

  // Personel Sil (Gruptan Personel Çıkarma)
  const handleDeleteStaff = (staffId: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const staffToDelete = activeDepartment.staff.find((s) => s.id === staffId);
    const staffName = staffToDelete ? staffToDelete.name : 'Personel';

    setDepartments((prevDepts) => {
      return prevDepts.map((d) => {
        if (d.id !== activeDepartment.id) return d;
        const filteredStaff = d.staff.filter((s) => s.id !== staffId);
        // Gruba göre sıralamaları yeniden düzenle
        const reindexed = filteredStaff.map((st) => {
          if (st.groupId === staffToDelete?.groupId) {
            const sameGroup = filteredStaff.filter((x) => x.groupId === st.groupId);
            const idx = sameGroup.findIndex((x) => x.id === st.id);
            return { ...st, orderInGroup: idx + 1 };
          }
          return st;
        });
        return { ...d, staff: reindexed };
      });
    });

    setCarryoverSuccess(`"${staffName}" kadrodan çıkarıldı.`);
    setTimeout(() => setCarryoverSuccess(null), 3500);
  };

  // Personelin Grubunu Değiştir (A, B, C, D arası geçiş)
  const handleChangeStaffGroup = (staffId: string, newGroupId: GroupId) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setDepartments((prevDepts) => {
      return prevDepts.map((d) => {
        if (d.id !== activeDepartment.id) return d;
        const targetStaff = d.staff.find((s) => s.id === staffId);
        if (!targetStaff || targetStaff.groupId === newGroupId) return d;

        const groupMembers = d.staff.filter((s) => s.groupId === newGroupId && s.id !== staffId);
        const updatedStaff = d.staff.map((s) => {
          if (s.id === staffId) {
            return {
              ...s,
              groupId: newGroupId,
              orderInGroup: groupMembers.length + 1,
            };
          }
          return s;
        });
        return { ...d, staff: updatedStaff };
      });
    });
  };

  // Kadroyu Toplu Kaydet (Kadro & Grup Yönetim Modalı için)
  const handleSaveAllStaff = (newStaffList: StaffMember[]) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setDepartments((prevDepts) => {
      return prevDepts.map((d) => {
        if (d.id !== activeDepartment.id) return d;
        return { ...d, staff: newStaffList };
      });
    });
    setCarryoverSuccess(`${activeDepartment.name} kadro ve grup yapılandırması başarıyla güncellendi.`);
    setTimeout(() => setCarryoverSuccess(null), 3500);
  };

  const handleFillDemoNames = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const defaultDept = DEFAULT_DEPARTMENTS.find((d) => d.id === activeDepartment.id);
    if (defaultDept) {
      setDepartments((prevDepts) => {
        return prevDepts.map((d) => {
          if (d.id !== activeDepartment.id) return d;
          return { ...d, staff: defaultDept.staff };
        });
      });
    }
  };

  // Vardiya Grubu Manuel Override (Yönetici Kontrollü)
  const handleOverrideShift = (dayNumber: number, newGroupId: GroupId) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setOverrides((prev) => ({
      ...prev,
      [dayNumber]: newGroupId,
    }));
  };

  const handleResetOverride = (dayNumber: number) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[dayNumber];
      return next;
    });
  };

  // Manuel Devir Bakiyesi Güncelleme (Yönetici Kontrollü)
  const handleUpdateManualCarryover = (staffId: string, val: number) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setManualCarryovers((prev) => ({
      ...prev,
      [staffId]: val,
    }));
  };

  // Gelecek Aya Devretme Eylemi
  const handleCarryOverToNextMonth = () => {
    const currentMonthKey = `${activeDepartment.id}_${selectedYear}_${selectedMonth}`;
    const newBalances: Record<string, number> = {};

    (Object.values(monthSummary.staffStats) as StaffShiftBalance[]).forEach((stat) => {
      newBalances[stat.staff.id] = stat.netBalanceDays;
    });

    setBalancesHistory((prev) => ({
      ...prev,
      [currentMonthKey]: newBalances,
    }));

    setCarryoverSuccess(
      `${TURKISH_MONTHS[selectedMonth]} ${selectedYear} bakiye sonuçları hafızaya alındı.`
    );
    setTimeout(() => {
      setCarryoverSuccess(null);
    }, 4000);
  };

  const handlePrint = () => {
    if (!isScheduleGenerated) {
      setIsScheduleGenerated(true);
    }
    setTimeout(() => window.print(), 100);
  };

  const handleExportCSV = () => {
    if (!isScheduleGenerated) {
      setIsScheduleGenerated(true);
    }
    exportScheduleToCSV(activeDepartment.name, monthSummary, activeDepartment.staff);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 antialiased font-sans relative selection:bg-indigo-500 selection:text-white ${
        isDarkMode
          ? 'bg-ambient-dark text-slate-100'
          : 'bg-ambient-light text-slate-800'
      }`}
    >
      {/* Yazdırma Modu */}
      <PrintSheet
        department={activeDepartment}
        summary={monthSummary}
        staffList={activeDepartment.staff}
      />

      {/* Ekran Arayüzü */}
      <div className="print:hidden relative z-10 flex flex-col min-h-screen">
        {/* Üst Kurumsal Header - Oval Yüzen Ada Tasarımı */}
        <header className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 pt-3 pb-1 sticky top-0 z-30 transition-all">
          <div
            className={`rounded-3xl border backdrop-blur-xl px-4 sm:px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-between gap-3 flex-wrap transition-colors ${
              isDarkMode
                ? 'bg-[#0a0e1a]/90 border-slate-800/90 text-slate-100'
                : 'bg-white/90 border-slate-200/90 text-slate-800'
            }`}
          >
            {/* Sol: Aktif Birim Seçici & Hızlı Geçiş */}
            <div className="flex items-center gap-3 z-10">
              {!isPortalOpen && (
                <button
                  type="button"
                  onClick={() => setIsPortalOpen(true)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md hover:-translate-y-0.5 active:scale-95 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white border border-slate-600/50'
                      : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-900 text-white border border-slate-800 shadow-slate-900/20'
                  }`}
                  title="Birim Seçimine Dön"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="hidden sm:inline">BİRİM SEÇİMİNE DÖN</span>
                  <span className="sm:hidden">DÖN</span>
                </button>
              )}
            </div>

            {/* ORTADA: RSMC VARDİYA SİSTEMİ BAŞLIĞI */}
            <div className="text-center py-0.5 absolute left-1/2 -translate-x-1/2 z-0 hidden lg:block">
              <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-300/30 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-1.5 leading-none">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400 drop-shadow-xs">
                      RSMC
                    </span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                      VARDİYA SİSTEMİ
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Sağ Eylemler: CANLI SAAT, Tema, Yazdır */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-1 min-w-0">
              
              {/* CANLI SAAT VE TARİH - Belirgin, Net ve Mavi Okunaklı Tasarım */}
              <div
                className={`flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-2xl border-2 shadow-md shrink-0 transition-all ${
                  isDarkMode
                    ? 'bg-slate-900 border-blue-500/40 text-blue-400 shadow-blue-950/40'
                    : 'bg-white border-blue-200 text-blue-700 shadow-blue-500/10'
                }`}
                title="Canlı Sistem Saati ve Tarih"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 relative border border-blue-200 dark:border-blue-800">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex flex-col text-right leading-none gap-1">
                  <span className="text-base sm:text-lg font-black tabular-nums tracking-tight font-mono text-blue-600 dark:text-blue-400">
                    {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black tracking-wide text-blue-800 dark:text-blue-300 uppercase">
                    {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' })}
                  </span>
                </div>
              </div>

              {/* DARK / LIGHT TEMA GEÇİŞ BUTONU */}
              <button
                type="button"
                id="btn-theme-toggle"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer shadow-xs ${
                  isDarkMode
                    ? 'bg-slate-800/90 border-slate-700 text-amber-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isDarkMode ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden xl:inline">Açık</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden xl:inline">Koyu</span>
                  </>
                )}
              </button>

              
              {currentManager ? (
                <div className="flex items-center gap-2">
                  {/* Yönetici Bilgisi (Geri sayım arka planda güvenle devam eder, arayüzde gizlenmiştir) */}
                  <div
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
                      isDarkMode
                        ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}
                    title="Yönetici Oturumu Aktif"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="hidden md:inline font-extrabold">{currentManager.departmentName}</span>
                    <span className="text-[11px] opacity-75 font-mono">({currentManager.registryNumber})</span>
                  </div>

                  {/* Şifremi Değiştir / Yönet */}
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-xs ${
                      isDarkMode
                        ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title="Yönetici Şifrenizi Değiştirin veya Güncelleyin"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="hidden md:inline">Şifre Değiştir</span>
                  </button>

                  {/* Çıkış Yap */}
                  <button
                    type="button"
                    onClick={() => handleManagerLogout(false)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-xs ${
                      isDarkMode
                        ? 'bg-rose-950/40 border-rose-800/50 hover:bg-rose-900/60 text-rose-300'
                        : 'bg-white border-rose-200 hover:bg-rose-50 text-rose-700'
                    }`}
                    title="Yönetici Çıkışı Yap"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ÇIKIŞ</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-md bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20 active:scale-95 border border-slate-800"
                  title="Yönetici Girişi"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline tracking-wider">YÖNETİCİ GİRİŞ</span>
                </button>
              )}

              <button id="btn-print-action"
                onClick={handlePrint}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border rounded-full transition-all shadow-xs cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-200 hover:bg-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                title="A4 Formatında Yazdır"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Yazdır</span>
              </button>
            </div>
          </div>
        </header>

      {/* EĞER PORTAL AÇIKSA BİRİM SEÇİM EKRANINI GÖSTER */}
        {isPortalOpen ? (
          <DepartmentPortal
            departments={departments}
            selectedDeptId={activeDeptId}
            onSelectDepartment={handleSelectDepartmentFromPortal}
            isDark={isDarkMode}
            currentManager={currentManager}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onLogoutManager={handleManagerLogout}
          />
        ) : (
          /* BİRİM SEÇİLDİKTEN SONRA AÇILAN KURUMSAL YÖNETİM SAYFASI */
          <main className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Devir Başarı Bildirimi */}
            {carryoverSuccess && (
              <div className="p-4 sm:p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center justify-between shadow-lg shadow-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span>{carryoverSuccess}</span>
                </div>
              </div>
            )}

            {/* ANA YERLEŞİM: SOL KONTROL & PERSONEL PANELİ + SAĞ ÇİZELGE VE SEKME ALANI */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* SOL SÜTUN: OPERASYON, DÖNEM SEÇİMİ, EYLEMLER VE PERSONEL LİSTESİ */}
              <aside className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col gap-4">
                {/* 1. HIZLI OPERASYON & EYLEMLER KARTI */}
                <div
                  className={`rounded-3xl border transition-all duration-300 p-5 shadow-xl backdrop-blur-xl flex flex-col gap-4 ${
                    isDarkMode
                      ? 'bg-[#0F1629]/95 border-slate-800 text-slate-100 shadow-indigo-500/5'
                      : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {/* Kart Başlığı & Birim Rozeti */}
                  <div className="flex items-center justify-between border-b pb-3.5 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-400">İŞLEM MERKEZİ</h2>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[140px]">{activeDepartment.name}</p>
                          {activeDepartment.id === 'dep-noc' && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              PİLOT BİRİM
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {daysInMonth} Gün
                    </span>
                  </div>

                  {/* DÖNEM SEÇİCİ (AY / YIL) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      DÖNEM (AY & YIL)
                    </label>
                    <div
                      className={`flex items-center justify-between p-1 rounded-2xl border ${
                        isDarkMode
                          ? 'bg-slate-900/90 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <button
                        onClick={handlePrevMonth}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                        title="Önceki Ay"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        <select
                          id="select-month-main"
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(Number(e.target.value));
                            setOverrides({});
                            setManualCarryovers({});
                          }}
                          className={`text-xs font-black bg-transparent py-1 px-1.5 focus:outline-none cursor-pointer ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {TURKISH_MONTHS.map((m, idx) => {
                            if (selectedYear === 2026 && idx < 9) return null;
                            return (
                              <option
                                key={m}
                                value={idx}
                                className={isDarkMode ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-900 font-bold'}
                              >
                                {m}
                              </option>
                            );
                          })}
                        </select>

                        <select
                          id="select-year-main"
                          value={selectedYear}
                          onChange={(e) => {
                            const newYear = Number(e.target.value);
                            setSelectedYear(newYear);
                            if (newYear === 2026 && selectedMonth < 9) {
                              setSelectedMonth(9);
                            }
                            setOverrides({});
                            setManualCarryovers({});
                          }}
                          className={`text-xs font-black bg-transparent py-1 px-1 focus:outline-none cursor-pointer ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {[2026, 2027, 2028, 2029, 2030, 2031].map((y) => (
                            <option
                              key={y}
                              value={y}
                              className={isDarkMode ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-900 font-bold'}
                            >
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleNextMonth}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                        title="Sonraki Ay"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 1. ANA BUTON: VARDİYA OLUŞTUR */}
                  <button
                    type="button"
                    onClick={handleGenerateSchedule}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2.5 group ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-600/30 ring-1 ring-indigo-500/30'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-600/20 ring-1 ring-indigo-400/30'
                    }`}
                    title="Seçili ay için nöbetleri oluşturur ve günceller"
                  >
                    <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                    <span>VARDİYA OLUŞTUR</span>
                  </button>

                  {/* 2. DİKEY HIZLI YÖNETİM BUTONLARI (ALT ALTA) */}
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                       HIZLI YÖNETİM BUTONLARI
                    </label>

                    {/* 📋 YÖNETİCİ DENETİM RAPORU BUTONU */}
                    <button
                      type="button"
                      id="btn-open-agent-audit"
                      onClick={() => {
                        if (!isScheduleGenerated) {
                          setCarryoverSuccess("⚠️ Lütfen önce 'VARDİYA OLUŞTUR' butonuna basınız. Yönetici Denetim Raporu, vardiya oluşturulduktan sonra takvim döngüsü ve bakiye mutabakatı analizi yapar.");
                          setTimeout(() => setCarryoverSuccess(null), 4500);
                          return;
                        }
                        setIsAuditModalOpen(true);
                      }}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-98 flex items-center justify-between gap-3 group ${
                        !isScheduleGenerated
                          ? isDarkMode
                            ? 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 opacity-90'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 opacity-90'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/70 text-cyan-300 border-cyan-800/60 hover:border-cyan-500 hover:bg-cyan-900/60 ring-1 ring-cyan-500/20'
                            : 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-900 border-cyan-200 hover:border-cyan-300 hover:bg-cyan-100/60 ring-1 ring-cyan-400/20'
                      }`}
                      title={
                        isScheduleGenerated
                          ? "Takvim döngülerini, personellerin nöbet sayılarını ve bakiye mutabakatını denetleyen Yönetici Raporu"
                          : "Vardiya oluşturulduktan sonra aktifleşir"
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          !isScheduleGenerated
                            ? 'bg-slate-800/40 text-slate-500 border border-slate-700/50'
                            : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-500'
                        }`}>
                          <ClipboardCheck className={`w-4 h-4 ${isScheduleGenerated ? 'text-cyan-500' : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">Yönetici Denetim Raporu</div>
                          <div className="text-[10px] opacity-75 font-medium truncate">
                            {isScheduleGenerated ? 'Nöbet, Bakiye & Mutabakat' : 'Oluşturma Sonrası Çalışır'}
                          </div>
                        </div>
                      </div>
                      {!isScheduleGenerated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          Önce Oluşturun
                        </span>
                      ) : monthSummary.auditReport && monthSummary.auditReport.fiveDaysAnomalies.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 shrink-0 animate-bounce">
                          {monthSummary.auditReport.fiveDaysAnomalies.length} Uyarı
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-cyan-400 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      )}
                    </button>

                    {/* 👤 PERSONEL DENETLEME BUTONU (AYRI BUTON) */}
                    <button
                      type="button"
                      id="btn-open-staff-audit"
                      onClick={() => {
                        if (!isScheduleGenerated) {
                          setCarryoverSuccess("⚠️ Lütfen önce 'VARDİYA OLUŞTUR' butonuna basınız. Personel Denetleme Ajanı, vardiya oluşturulduktan sonra personelin nöbetlerini ve bakiye sağlamasını denetler.");
                          setTimeout(() => setCarryoverSuccess(null), 4500);
                          return;
                        }
                        setIsStaffAuditModalOpen(true);
                      }}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-98 flex items-center justify-between gap-3 group ${
                        !isScheduleGenerated
                          ? isDarkMode
                            ? 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 opacity-90'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 opacity-90'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-indigo-950/70 to-purple-950/70 text-indigo-300 border-indigo-800/60 hover:border-indigo-500 hover:bg-indigo-900/60 ring-1 ring-indigo-500/20'
                            : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-950 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-100/60 ring-1 ring-indigo-400/20'
                      }`}
                      title={
                        isScheduleGenerated
                          ? "Personel bazlı 6 aylık bakiye yolculuğu, hücre hücre nöbet sayımı ve canlı sağlama robotu"
                          : "Vardiya hesaplandıktan sonra aktifleşir"
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          !isScheduleGenerated
                            ? 'bg-slate-800/40 text-slate-500 border border-slate-700/50'
                            : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500'
                        }`}>
                          <UserCheck className={`w-4 h-4 ${isScheduleGenerated ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">Personel Denetleme</div>
                          <div className="text-[10px] opacity-75 font-medium truncate">
                            {isScheduleGenerated ? 'Canlı Sağlama & Sayım' : 'Hesaplama Sonrası Çalışır'}
                          </div>
                        </div>
                      </div>
                      {!isScheduleGenerated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          Önce Hesaplayın
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white shrink-0">
                          Robot
                        </span>
                      )}
                    </button>

                    {/* 🏖️ İZİN / RAPOR YÖNETİMİ BUTONU */}
                    <button
                      type="button"
                      id="btn-open-leave-modal"
                      onClick={() => {
                        setIsLeaveModalOpen(true);
                      }}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-98 flex items-center justify-between gap-3 group ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-amber-950/70 to-yellow-950/70 text-amber-300 border-amber-800/60 hover:border-amber-500 hover:bg-amber-900/60'
                          : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-200 hover:border-amber-300 hover:bg-amber-100/60'
                      }`}
                      title="Personel İzin/Rapor günlerini belirleyin (Vardiyada X yazılır, hedeften düşülür)"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                          <Palmtree className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">İzin / Rapor Yönetimi</div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">Mazeret & İzin Girişi</div>
                        </div>
                      </div>
                      {currentMonthLeaves.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold shrink-0">
                          {currentMonthLeaves.length} İzin
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-amber-400 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      )}
                    </button>

                    {/* 👥 KADRO & GRUP YÖNETİMİ BUTONU */}
                    <button
                      type="button"
                      id="btn-open-staff-manager"
                      onClick={() => {
                        if (!isAdmin) {
                          setIsLoginModalOpen(true);
                          return;
                        }
                        setIsStaffManagerModalOpen(true);
                      }}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-98 flex items-center justify-between gap-3 group ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-blue-950/70 to-indigo-950/70 text-blue-300 border-blue-800/60 hover:border-blue-500 hover:bg-blue-900/60'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-950 border-blue-200 hover:border-blue-300 hover:bg-blue-100/60'
                      }`}
                      title="Gruba personel ekle, sil, grubu 3 kişi yap veya gruplar arasında taşı"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">Kadro & Grup Yönetimi</div>
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">Personel Ekle / Sil / 3 Kişi Yap</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold shrink-0">
                        {activeDepartment.staff.length} Kişi
                      </span>
                    </button>

                    {/* Excel & Yıllık Plan İndir (Hesaplandıysa) */}
                    {isScheduleGenerated && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          id="btn-export-month-csv"
                          onClick={handleExportCSV}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 flex items-center justify-center gap-1.5 ${
                            isDarkMode
                              ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                          title="Seçili ayın vardiya tablosunu Excel (CSV) olarak indirir"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>Excel (CSV)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => generateYearlyScheduleCsv(selectedYear, selectedMonth, activeDepartment, undefined)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 flex items-center justify-center gap-1.5 ${
                            isDarkMode
                              ? 'bg-amber-950/40 text-amber-300 border-amber-900/50 hover:bg-amber-900/60'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Seçili yıl için 12 aylık tüm planı hesaplar ve Excel (CSV) olarak indirir."
                        >
                          <Download className="w-3.5 h-3.5 text-amber-500" />
                          <span>1 Yıllık Plan</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* NOC Pilot veya Özel Bilgi Etiketi */}
                  {activeDepartment.id === 'dep-noc' && (
                    <div
                      className={`p-2.5 rounded-2xl border text-[11px] font-bold text-center ${
                        isDarkMode
                          ? 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300'
                          : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                      }`}
                    >
                      NOC Pilot • Kişi Bazlı Matematiksel Denkleştirme
                    </div>
                  )}
                </div>

                {/* 2. PERSONEL LİSTESİ VE DÜZENLEME PANELİ */}
                <PersonnelSidebar
                  department={activeDepartment}
                  summary={monthSummary}
                  isDark={isDarkMode}
                  isScheduleGenerated={isScheduleGenerated}
                  isAdmin={isAdmin}
                  onRequestAdminLogin={() => setIsLoginModalOpen(true)}
                  onUpdateStaffName={handleUpdateStaffName}
                  onFillDemoNames={handleFillDemoNames}
                  selectedStaffId={selectedStaffId}
                  onSelectStaff={setSelectedStaffId}
                  onOpenStaffManagerModal={() => setIsStaffManagerModalOpen(true)}
                  onAddStaff={handleAddStaff}
                  onDeleteStaff={handleDeleteStaff}
                  onChangeStaffGroup={handleChangeStaffGroup}
                />
              </aside>

              {/* SAĞ SÜTUN: SEKME ÇUBUĞU, UYARILAR VE ÇİZELGE İÇERİKLERİ */}
              <div className="flex-1 w-full min-w-0 space-y-6">
                {isScheduleGenerated ? (
                  <>
                    {/* KURUMSAL GÖRÜNÜM SEKMELERİ - YÜZEN PİLL (OVAL) SEKME ÇUBUĞU */}
                    <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        className={`inline-flex items-center gap-1.5 p-1.5 rounded-full border shadow-xs backdrop-blur-md flex-wrap ${
                          isDarkMode
                            ? 'bg-slate-900/90 border-slate-800'
                            : 'bg-white/90 border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        {/* 2. Resmi Çizelge */}
                        <button
                          id="tab-btn-matrix"
                          onClick={() => setActiveTab('matrix')}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                            activeTab === 'matrix'
                              ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                              : isDarkMode
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <TableIcon className="w-4 h-4" />
                          {daysInMonth} Günlük Resmi Çizelge
                        </button>

                        {/* 3. Bakiye & Hak Ediş */}
                        <button
                          id="tab-btn-salary"
                          onClick={() => setActiveTab('salary')}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                            activeTab === 'salary'
                              ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                              : isDarkMode
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Scale className="w-4 h-4" />
                          Personel Bakiye & Hak Ediş
                        </button>

                        {/* 4. Aylık Takvim */}
                        <button
                          id="tab-btn-calendar"
                          onClick={() => setActiveTab('calendar')}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                            activeTab === 'calendar'
                              ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                              : isDarkMode
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          Aylık Takvim
                        </button>

                        {/* 5. Günlük Liste */}
                        <button
                          id="tab-btn-list"
                          onClick={() => setActiveTab('list')}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                            activeTab === 'list'
                              ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                              : isDarkMode
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <ListIcon className="w-4 h-4" />
                          Günlük Liste
                        </button>
                      </div>

                      <div className={`text-xs sm:text-sm font-black flex items-center gap-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>
                          {TURKISH_MONTHS[selectedMonth]} {selectedYear} • {activeDepartment.name}
                        </span>
                      </div>
                    </nav>

                    {/* OTOMATİK DENETİM UYARILARI - KOMPAKT & DARALTILABİLİR */}
                    {monthSummary.validationWarnings && monthSummary.validationWarnings.length > 0 && (
                      <div
                        id="system-audit-warnings-banner"
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 shadow-sm ${
                          isDarkMode
                            ? 'bg-slate-900/95 border-amber-500/40 shadow-amber-950/20'
                            : 'bg-amber-50/90 border-amber-300/80 shadow-amber-500/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isDarkMode
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-amber-500 text-white shadow-xs'
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-bold tracking-tight ${
                                  isDarkMode ? 'text-amber-400' : 'text-amber-950'
                                }`}
                              >
                                Sistem Denetim Uyarıları
                              </span>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                                  isDarkMode
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                    : 'bg-amber-200/70 text-amber-900 border-amber-300/70'
                                }`}
                              >
                                {monthSummary.validationWarnings.length} Bildirim
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setIsWarningsOpen(!isWarningsOpen)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 border ${
                              isDarkMode
                                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
                                : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                            }`}
                            title={isWarningsOpen ? 'Uyarı listesini daralt' : 'Uyarı listesini genişlet'}
                          >
                            <span>{isWarningsOpen ? 'Daralt' : 'Detayları Göster'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isWarningsOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {isWarningsOpen && (
                          <ul className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {monthSummary.validationWarnings.map((warning, idx) => (
                              <li
                                key={idx}
                                className={`flex items-start gap-2.5 p-2 sm:p-2.5 rounded-lg border transition-all text-xs sm:text-sm font-medium leading-relaxed ${
                                  isDarkMode
                                    ? 'bg-slate-800/90 border-slate-700/80 text-slate-100'
                                    : 'bg-white border-amber-200 text-slate-900 shadow-2xs'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                                    isDarkMode ? 'bg-amber-400' : 'bg-amber-500'
                                  }`}
                                />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* SEÇİLEN GÖRÜNÜME GÖRE DİNAMİK ALAN */}
                    {activeTab === 'matrix' && (
                      <MatrixTableView
                        shifts={monthSummary.shifts}
                        staffList={activeStaffList}
                        summary={monthSummary}
                        isDark={isDarkMode}
                      />
                    )}

                    {activeTab === 'salary' && (
                      <StaffStatsCard
                        summary={monthSummary}
                        staffList={activeStaffList}
                        departmentName={activeDepartment.name}
                        onCarryOverToNextMonth={handleCarryOverToNextMonth}
                        onUpdateManualCarryover={handleUpdateManualCarryover}
                        isDark={isDarkMode}
                        isAdmin={isAdmin}
                        onRequestAdminLogin={() => setIsLoginModalOpen(true)}
                      />
                    )}

                    {activeTab === 'calendar' && (
                      <CalendarView
                        shifts={monthSummary.shifts}
                        year={selectedYear}
                        month={selectedMonth}
                        isDark={isDarkMode}
                        onDayClick={(shift) => setOverrideModalShift(shift)}
                      />
                    )}

                    {activeTab === 'list' && (
                      <DailyListView
                        shifts={monthSummary.shifts}
                        isDark={isDarkMode}
                        onDayClick={(shift) => setOverrideModalShift(shift)}
                      />
                    )}
                  </>
                ) : (
                  <div className={`flex flex-col items-center justify-center py-20 px-8 text-center rounded-3xl border border-dashed transition-all shadow-sm ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/90 border-slate-300'
                  }`}>
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 shadow-sm">
                      <CalendarIcon className="w-10 h-10" />
                    </div>
                    <h3 className={`text-2xl font-black mb-2.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Vardiya Çizelgesi Henüz Hesaplanmadı
                    </h3>
                    <p className={`text-sm max-w-lg mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{TURKISH_MONTHS[selectedMonth]} {selectedYear}</strong> dönemi ve <strong className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>{activeDepartment.name}</strong> birimi için nöbet çizelgesini hesaplamak üzere sol paneldeki veya aşağıdaki <strong className="text-indigo-600 dark:text-indigo-400">"Vardiya Hesapla"</strong> butonuna tıklayınız.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateSchedule}
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-xl shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer ring-2 ring-indigo-500/20 group"
                    >
                      <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                      <span>Vardiyayı Hesapla ve Aç</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Alt Bilgi & Belirgin Sürüm Rozeti */}
            <footer className="w-full pt-8 pb-4 flex items-center justify-center text-xs relative z-10 px-1 print:hidden">
              <div className="inline-flex items-center gap-2.5 font-bold text-slate-900 dark:text-white bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-xs shadow-emerald-500/50" />
                <span className="text-xs tracking-wide">RSMC Operasyon Merkezi</span>
                <span className="text-slate-300 dark:text-slate-600 font-normal">•</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-black border border-indigo-300/70 dark:border-indigo-700/60">
                  {APP_VERSION_LABEL}
                </span>
              </div>
            </footer>
          </main>
        )}
      </div>

      {/* Özel Gün Değişimi Modalı */}
      {overrideModalShift && (
        <ShiftOverrideModal
          isOpen={!!overrideModalShift}
          onClose={() => setOverrideModalShift(null)}
          shift={overrideModalShift}
          onOverride={handleOverrideShift}
          onReset={handleResetOverride}
          isDark={isDarkMode}
          isAdmin={isAdmin}
          onRequestAdminLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Yönetici Girişi Modalı */}
      {isLoginModalOpen && (
        <ManagerLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleManagerLoginSuccess}
          isDark={isDarkMode}
        />
      )}

      {/* 📋 Yönetici Denetim Raporu Modalı */}
      {isAuditModalOpen && (
        <AgentAuditModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          summary={monthSummary}
          departmentName={activeDepartment.name}
          isDark={isDarkMode}
        />
      )}

      {/* 👤 Personel Denetleme Ajanı Modalı */}
      {isStaffAuditModalOpen && (
        <StaffAuditModal
          isOpen={isStaffAuditModalOpen}
          onClose={() => setIsStaffAuditModalOpen(false)}
          summary={monthSummary}
          department={activeDepartment}
          departmentName={activeDepartment.name}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          leavesByMonth={leavesByMonth}
          isDark={isDarkMode}
        />
      )}

      {/* 🏖️ Personel İzin Yönetimi Modalı */}
      {isLeaveModalOpen && (
        <LeaveManagementModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          staffList={activeStaffList}
          leaves={currentMonthLeaves}
          onAddLeave={handleAddLeave}
          onDeleteLeave={handleDeleteLeave}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          totalDaysInMonth={monthSummary.totalDays}
          isDark={isDarkMode}
          isAdmin={isAdmin}
          onRequestAdminLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* 👥 Kadro & Grup Yönetimi Modalı (Gruba Personel Ekle / Sil / 3 Kişi Yap) */}
      {isStaffManagerModalOpen && (
        <StaffManagerModal
          isOpen={isStaffManagerModalOpen}
          onClose={() => setIsStaffManagerModalOpen(false)}
          staffList={activeDepartment.staff}
          onSave={handleSaveAllStaff}
          departmentName={activeDepartment.name}
          isDark={isDarkMode}
        />
      )}
    </div>
  );
}
