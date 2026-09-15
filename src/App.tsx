import React, { useState, useEffect, useMemo } from 'react';
import {
  Department,
  GroupId,
  StaffMember,
  GROUPS_CONFIG,
  DayShift,
  MonthlyDepartmentHistory,
  StaffShiftBalance,
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
import { ManagerCredentials } from './utils/auth';

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
  ChevronDown,
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
    } catch (e) {
      console.error(e);
    }
  }, [departments, activeDeptId, balancesHistory]);

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

      const summary = generateMonthSchedule(
        curYear,
        curMonth,
        undefined,
        rotatedStaffForStep,
        {},
        stepInputBalances,
        undefined,
        true
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
  ]);

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
      true
    );
  }, [selectedYear, selectedMonth, undefined, activeStaffList, overrides, carryoverBalances]);

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
    try {
      sessionStorage.setItem('vardiya_manager_auth', JSON.stringify(mgr));
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
    setCarryoverSuccess(`${mgr.departmentName} Yöneticisi (${mgr.registryNumber}) olarak giriş yapıldı. Düzenleme yetkiniz aktif.`);
    setTimeout(() => setCarryoverSuccess(null), 4500);
  };

  // Yönetici Çıkışı
  const handleManagerLogout = () => {
    setCurrentManager(null);
    try {
      sessionStorage.removeItem('vardiya_manager_auth');
    } catch (e) {
      console.error(e);
    }
    setCarryoverSuccess('Yönetici oturumu kapatıldı. Düzenleme yetkisi kaldırıldı.');
    setTimeout(() => setCarryoverSuccess(null), 3000);
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

            {/* ORTADA: RSCM VARDİYA SİSTEMİ BAŞLIĞI */}
            <div className="text-center py-0.5 absolute left-1/2 -translate-x-1/2 z-0 hidden lg:block">
              <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-300/30 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-1.5 leading-none">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400 drop-shadow-xs">
                      RSCM
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
              
              {/* CANLI SAAT VE TARİH - Daha büyük ve görünür */}
              <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm shrink-0 transition-all ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-800 text-slate-200 shadow-indigo-500/5' 
                  : 'bg-indigo-50/30 border-indigo-100 text-slate-800 shadow-indigo-500/5'
              }`}>
                <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-sm sm:text-base font-black tabular-nums tracking-tight text-indigo-600 dark:text-indigo-400">
                    {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                <button
                  type="button"
                  onClick={handleManagerLogout}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-xs ${
                    isDarkMode
                      ? 'bg-rose-950/40 border-rose-800/50 hover:bg-rose-900/60 text-rose-300'
                      : 'bg-white border-rose-200 hover:bg-rose-50 text-rose-700'
                  }`}
                  title="Yönetici Çıkışı"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ÇIKIŞ</span>
                </button>
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
          <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Devir Başarı Bildirimi */}
            {carryoverSuccess && (
              <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center justify-between shadow-lg shadow-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span>{carryoverSuccess}</span>
                </div>
              </div>
            )}

            {/* YÖNETİCİ KONTROL PANELİ - PREMIUM OVAL TASARIM */}
            <section
              className={`rounded-[2.5rem] border transition-all duration-500 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-indigo-500/5'
                  : 'bg-white/90 border-slate-100 text-slate-800 shadow-slate-200/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 flex-wrap">
                {/* Sol: Ay ve Yıl Seçimi + TEK VE NET "Vardiya Oluştur" Butonu */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-full border shrink-0 ${
                      isDarkMode
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-slate-100/90 border-slate-200'
                    }`}
                  >
                    <button
                      onClick={handlePrevMonth}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title="Önceki Ay"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <select
                      id="select-month-main"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(Number(e.target.value));
                        setOverrides({});
                        setManualCarryovers({});
                      }}
                      className={`text-xs sm:text-sm font-bold bg-transparent py-1 px-2.5 focus:outline-none cursor-pointer ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {TURKISH_MONTHS.map((m, idx) => {
                        if (selectedYear === 2026 && idx < 9) return null; // Sadece Ekim ve sonrası
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
                        // Eğer 2026'ya dönüldüyse ve mevcut ay Ekim'den küçükse, Ekim'e al
                        if (newYear === 2026 && selectedMonth < 9) {
                          setSelectedMonth(9);
                        }
                        setOverrides({});
                        setManualCarryovers({});
                      }}
                      className={`text-xs sm:text-sm font-bold bg-transparent py-1 px-2 focus:outline-none cursor-pointer ${
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

                    <button
                      onClick={handleNextMonth}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title="Sonraki Ay"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateSchedule}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md hover:-translate-y-0.5 active:scale-95 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-600/30 ring-1 ring-indigo-500/30'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-600/20 ring-1 ring-indigo-400/30'
                    }`}
                    title="Seçili ay için nöbetleri hesaplar ve günceller"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Vardiya Hesapla</span>
                  </button>

                  {/* Excel (CSV) İndir Butonu */}
                  {isScheduleGenerated && (
                    <>
                  <button
                    type="button"
                    id="btn-export-month-csv"
                    onClick={handleExportCSV}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 ${
                      isDarkMode
                        ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                    title="Seçili ayın vardiya tablosunu Excel (CSV) olarak indirir"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Excel (CSV)</span>
                  </button>

                  {/* 1 YILLIK VARDİYA PLANI İNDİR */}
                  <button
                    type="button"
                    onClick={() => generateYearlyScheduleCsv(selectedYear, selectedMonth, activeDepartment, undefined)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 ${
                      isDarkMode
                        ? 'bg-amber-950/30 text-amber-300 border-amber-900/40 hover:bg-amber-900/50'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="Seçili yıl için 12 aylık tüm planı hesaplar ve Excel (CSV) olarak indirir."
                  >
                    <Download className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">1 Yıllık Plan</span>
                  </button>
                  </>
                  )}
                </div>

                {/* Sağ: Bilgi Etiketi */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                  {activeDepartment.id === 'dep-noc' && (
                    <span
                      id="badge-noc-pilot-cycle"
                      className={`px-3 py-1 rounded-full border text-[11px] font-bold ${
                        isDarkMode
                          ? 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300'
                          : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                      }`}
                      title="NOC Pilot Birimi: Her personelin nöbet eşdeğeri ve hedef farkı kümülatif formülle (Devir + Fark = Net) hesaplanır; borç ve alacaklar yapay olarak silinmez, sonraki aylardaki nöbetlerle doğal olarak dengelenir."
                    >
                      NOC Pilot • Kişi Bazlı Matematiksel Denkleştirme
                    </span>
                  )}
                  <span className={`px-4 py-1.5 rounded-full border text-xs font-black shadow-2xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-slate-100 border-slate-200 text-indigo-600'
                  }`}>
                    {activeDepartment.name}
                  </span>
                  <span className="text-xs font-bold">• {daysInMonth} Günlük Dönem</span>
                </div>
              </div>
            </section>

            {/* OTOMATİK DENETİM UYARILARI - KOMPAKT & DARALTILABİLİR */}
            {isScheduleGenerated && monthSummary.validationWarnings && monthSummary.validationWarnings.length > 0 && (
              <div
                id="system-audit-warnings-banner"
                className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 shadow-sm ${
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

            {isScheduleGenerated ? (
              <>
                {/* KURUMSAL GÖRÜNÜM SEKMELERİ - YÜZEN PİLL (OVAL) SEKME ÇUBUĞU */}
                <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
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

            {/* SEÇİLEN GÖRÜNÜME GÖRE DİNAMİK ALAN */}
            {activeTab === 'matrix' && (
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                <div className="w-full lg:w-80 xl:w-84 shrink-0">
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
                  />
                </div>
                <div className="flex-1 w-full min-w-0">
                  <MatrixTableView
                    shifts={monthSummary.shifts}
                    staffList={activeStaffList}
                    summary={monthSummary}
                    isDark={isDarkMode}
                  />
                </div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                <div className="w-full lg:w-80 xl:w-84 shrink-0">
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
                  />
                </div>
                <div className="flex-1 w-full min-w-0">
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
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                <div className="w-full lg:w-80 xl:w-84 shrink-0">
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
                  />
                </div>
                <div className="flex-1 w-full min-w-0">
                  <CalendarView
                    shifts={monthSummary.shifts}
                    year={selectedYear}
                    month={selectedMonth}
                    isDark={isDarkMode}
                    onDayClick={(shift) => setOverrideModalShift(shift)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                <div className="w-full lg:w-80 xl:w-84 shrink-0">
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
                  />
                </div>
                <div className="flex-1 w-full min-w-0">
                  <DailyListView
                    shifts={monthSummary.shifts}
                    isDark={isDarkMode}
                    onDayClick={(shift) => setOverrideModalShift(shift)}
                  />
                </div>
              </div>
            )}
              </>
            ) : (
              <div className={`flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed ${
                isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50/50 border-slate-300'
              }`}>
                <CalendarIcon className={`w-16 h-16 mb-6 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                <h3 className={`text-xl sm:text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Henüz Vardiya Hesaplanmadı
                </h3>
                <p className={`text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Lütfen yukarıdan ilgili ay ve yılı seçtikten sonra <strong className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>"Vardiya Hesapla"</strong> butonuna tıklayarak çizelgeyi oluşturun.
                </p>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Özel Gün Değişimi Modalı */}
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

      {/* Yönetici Girişi Modalı */}
      <ManagerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleManagerLoginSuccess}
        isDark={isDarkMode}
      />
    </div>
  );
}
