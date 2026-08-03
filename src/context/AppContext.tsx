import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Article, Schedule, AppSettings, AttendanceRecord } from '../types';
import { initialUsers, initialArticles, initialSchedules, initialAppSettings } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  articles: Article[];
  schedules: Schedule[];
  appSettings: AppSettings;
  attendance: AttendanceRecord[];
  
  // Auth
  login: (emailOrNis: string, role: 'siswa' | 'admin', passwordInput?: string) => { success: boolean; message?: string };
  logout: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  registerSiswa: (newSiswaData: Omit<User, 'id' | 'nis' | 'role' | 'tanggalBergabung' | 'statusAktif' | 'terverifikasi' | 'presensiCount'>) => User;
  
  // User Management
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  verifyUser: (userId: string, verify: boolean) => void;
  importUsersBatch: (newUsers: User[]) => void;
  
  // Article CRUD
  addArticle: (article: Omit<Article, 'id' | 'dibaca' | 'tanggal'>) => void;
  updateArticle: (id: string, articleData: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  incrementArticleViews: (id: string) => void;
  
  // Schedule CRUD
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, scheduleData: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  
  // Attendance
  recordAttendance: (scheduleId: string, status: 'Hadir' | 'Izin' | 'Sakit', catatan?: string) => void;
  
  // Settings & App
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;
  resetToDefaultData: () => void;
  getDatabaseExportPayload: () => any;
  replaceEntireDatabase: (dataPayload: any) => void;
  
  // Helpers
  generateWhatsAppUrl: (message?: string, customNumber?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS = 'pamur_app_users_v1';
const LOCAL_STORAGE_ARTICLES = 'pamur_app_articles_v1';
const LOCAL_STORAGE_SCHEDULES = 'pamur_app_schedules_v1';
const LOCAL_STORAGE_SETTINGS = 'pamur_app_settings_v1';
const LOCAL_STORAGE_ATTENDANCE = 'pamur_app_attendance_v1';
const LOCAL_STORAGE_SESSION = 'pamur_app_session_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ARTICLES);
    return saved ? JSON.parse(saved) : initialArticles;
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SCHEDULES);
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
    return saved ? JSON.parse(saved) : initialAppSettings;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ATTENDANCE);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSessionId = localStorage.getItem(LOCAL_STORAGE_SESSION);
    if (savedSessionId) {
      const savedUsers = localStorage.getItem(LOCAL_STORAGE_USERS);
      const parsedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : initialUsers;
      const found = parsedUsers.find(u => u.id === savedSessionId);
      if (found) return found;
    }
    // Default: not logged in (guest view on public home page)
    return null;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ARTICLES, JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_SESSION, currentUser.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION);
    }
  }, [currentUser]);

  // Auth Functions
  const login = (emailOrNis: string, role: 'siswa' | 'admin', passwordInput?: string): { success: boolean; message?: string } => {
    const query = emailOrNis.trim().toLowerCase();
    const found = users.find(u => 
      (u.email.toLowerCase() === query || u.nis.toLowerCase() === query || (u.nik && u.nik.toLowerCase() === query) || u.nama.toLowerCase() === query) &&
      (role === 'admin' ? u.role === 'admin' : true)
    );

    if (!found) {
      return { 
        success: false, 
        message: `Akun tidak ditemukan untuk role ${role.toUpperCase()}. Silakan cek kembali Email/NIS/NIK Anda.` 
      };
    }

    if (found.role === 'siswa' && !found.terverifikasi) {
      return { 
        success: false, 
        message: `Akun (${found.nama}) belum terverifikasi oleh Admin PAMUR. Harap tunggu verifikasi Admin sebelum login.` 
      };
    }

    if (passwordInput && found.password && passwordInput !== found.password) {
      return { 
        success: false, 
        message: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.' 
      };
    }

    setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerSiswa = (data: Omit<User, 'id' | 'nis' | 'role' | 'tanggalBergabung' | 'statusAktif' | 'terverifikasi' | 'presensiCount'>): User => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newNis = `PMR-${year}-${randomNum}`;
    const newId = `usr-siswa-${Date.now()}`;

    const newSiswa: User = {
      ...data,
      id: newId,
      nis: newNis,
      role: 'siswa',
      tanggalBergabung: new Date().toISOString().split('T')[0],
      statusAktif: true,
      terverifikasi: false, // Requires admin verification
      presensiCount: 0,
      catatanPrestasi: []
    };

    setUsers(prev => [newSiswa, ...prev]);
    return newSiswa;
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...data };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
  };

  const verifyUser = (userId: string, verify: boolean) => {
    updateUser(userId, { terverifikasi: verify });
  };

  const importUsersBatch = (newUsers: User[]) => {
    setUsers(prev => [...newUsers, ...prev]);
  };

  // Article CRUD
  const addArticle = (data: Omit<Article, 'id' | 'dibaca' | 'tanggal'>) => {
    const newArticle: Article = {
      ...data,
      id: `art-${Date.now()}`,
      dibaca: 0,
      tanggal: new Date().toISOString().split('T')[0]
    };
    setArticles(prev => [newArticle, ...prev]);
  };

  const updateArticle = (id: string, articleData: Partial<Article>) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...articleData } : a));
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const incrementArticleViews = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, dibaca: a.dibaca + 1 } : a));
  };

  // Schedule CRUD
  const addSchedule = (data: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...data,
      id: `sch-${Date.now()}`
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  const updateSchedule = (id: string, scheduleData: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...scheduleData } : s));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Attendance
  const recordAttendance = (scheduleId: string, status: 'Hadir' | 'Izin' | 'Sakit', catatan?: string) => {
    if (!currentUser) return;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.nama,
      scheduleId,
      tanggal: new Date().toISOString().split('T')[0],
      status,
      catatan
    };

    setAttendance(prev => [newRecord, ...prev]);

    if (status === 'Hadir') {
      updateUser(currentUser.id, { presensiCount: (currentUser.presensiCount || 0) + 1 });
    }
  };

  // Settings
  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getDatabaseExportPayload = () => {
    return {
      users,
      articles,
      schedules,
      appSettings,
      attendance,
      backupDate: new Date().toISOString(),
      appVersion: '1.0'
    };
  };

  const replaceEntireDatabase = (dataPayload: any) => {
    if (dataPayload.users && Array.isArray(dataPayload.users)) setUsers(dataPayload.users);
    if (dataPayload.articles && Array.isArray(dataPayload.articles)) setArticles(dataPayload.articles);
    if (dataPayload.schedules && Array.isArray(dataPayload.schedules)) setSchedules(dataPayload.schedules);
    if (dataPayload.appSettings && typeof dataPayload.appSettings === 'object') setAppSettings(dataPayload.appSettings);
    if (dataPayload.attendance && Array.isArray(dataPayload.attendance)) setAttendance(dataPayload.attendance);
  };

  const resetToDefaultData = () => {
    setUsers(initialUsers);
    setArticles(initialArticles);
    setSchedules(initialSchedules);
    setAppSettings(initialAppSettings);
    setAttendance([]);
    setCurrentUser(null);
    localStorage.clear();
  };

  // Helper for WhatsApp links
  const generateWhatsAppUrl = (message?: string, customNumber?: string) => {
    const targetNumber = (customNumber || appSettings.noWaAdmin).replace(/[^0-9]/g, '');
    const defaultMsg = message 
      ? encodeURIComponent(message)
      : encodeURIComponent(`Halo Admin ${appSettings.namaOrganisasi}, saya ingin bertanya mengenai keanggotaan/latihan.`);
    return `https://wa.me/${targetNumber}?text=${defaultMsg}`;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      articles,
      schedules,
      appSettings,
      attendance,
      login,
      logout,
      setCurrentUser,
      registerSiswa,
      updateUser,
      deleteUser,
      verifyUser,
      importUsersBatch,
      addArticle,
      updateArticle,
      deleteArticle,
      incrementArticleViews,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      recordAttendance,
      updateAppSettings,
      resetToDefaultData,
      getDatabaseExportPayload,
      replaceEntireDatabase,
      generateWhatsAppUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
