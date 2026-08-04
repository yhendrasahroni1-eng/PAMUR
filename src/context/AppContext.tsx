import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Article, Schedule, AppSettings, AttendanceRecord } from '../types';
import { initialUsers, initialArticles, initialSchedules, initialAppSettings } from '../data/mockData';
import { uploadToGoogleDrive } from '../services/googleDriveService';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

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
    if (!saved) return initialUsers;
    try {
      const parsed: User[] = JSON.parse(saved);
      // Ensure the official admin account is always present and updated
      const hasOfficialAdmin = parsed.some(u => u.email === 'yhendrasahroni1@gmail.com');
      if (!hasOfficialAdmin) {
        // Filter out old demo admin/users if needed
        const nonAdminUsers = parsed.filter(u => u.role !== 'admin' && !u.id.startsWith('usr-siswa-'));
        return [...initialUsers, ...nonAdminUsers];
      }
      return parsed;
    } catch {
      return initialUsers;
    }
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

  // -------------------------------------------------------------
  // REAL-TIME FIRESTORE SYNCHRONIZATION ACROSS ALL DEVICES
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Users real-time listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedUsers: User[] = snapshot.docs.map(d => d.data() as User);
        setUsers(loadedUsers);
      } else {
        // Seed initial users to Firestore if empty
        initialUsers.forEach(u => {
          setDoc(doc(db, 'users', u.id), u).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users'));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    // 2. Articles real-time listener
    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedArticles: Article[] = snapshot.docs.map(d => d.data() as Article);
        setArticles(loadedArticles);
      } else {
        initialArticles.forEach(a => {
          setDoc(doc(db, 'articles', a.id), a).catch(err => handleFirestoreError(err, OperationType.WRITE, 'articles'));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'articles'));

    // 3. Schedules real-time listener
    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedSchedules: Schedule[] = snapshot.docs.map(d => d.data() as Schedule);
        setSchedules(loadedSchedules);
      } else {
        initialSchedules.forEach(s => {
          setDoc(doc(db, 'schedules', s.id), s).catch(err => handleFirestoreError(err, OperationType.WRITE, 'schedules'));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'schedules'));

    // 4. App Settings real-time listener
    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      if (!snapshot.empty) {
        const configDoc = snapshot.docs.find(d => d.id === 'config');
        if (configDoc) {
          setAppSettings(configDoc.data() as AppSettings);
        }
      } else {
        setDoc(doc(db, 'settings', 'config'), initialAppSettings).catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings'));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'settings'));

    // 5. Attendance real-time listener
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedAttendance: AttendanceRecord[] = snapshot.docs.map(d => d.data() as AttendanceRecord);
        setAttendance(loadedAttendance);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

    return () => {
      unsubUsers();
      unsubArticles();
      unsubSchedules();
      unsubSettings();
      unsubAttendance();
    };
  }, []);

  // Sync to LocalStorage for offline fallback
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

  // Debounced Auto-Sync to Google Drive when enabled
  useEffect(() => {
    if (!appSettings.driveAutoSyncEnabled || !appSettings.driveAccessToken) return;

    const timeoutId = setTimeout(async () => {
      try {
        const payload = {
          users,
          articles,
          schedules,
          appSettings,
          attendance,
          backupDate: new Date().toISOString(),
          appVersion: '1.0'
        };
        const res = await uploadToGoogleDrive(appSettings.driveAccessToken, payload);
        if (res.success) {
          const nowStr = new Date().toLocaleString('id-ID');
          localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify({
            ...appSettings,
            driveLastSyncDate: nowStr
          }));
        }
      } catch (err) {
        console.error('Auto Drive sync failed silently:', err);
      }
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [users, articles, schedules, attendance, appSettings.driveAutoSyncEnabled, appSettings.driveAccessToken]);

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
    setDoc(doc(db, 'users', newId), newSiswa).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users'));
    return newSiswa;
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...data };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        setDoc(doc(db, 'users', userId), updated, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users'));
        return updated;
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteDoc(doc(db, 'users', userId)).catch(err => handleFirestoreError(err, OperationType.DELETE, 'users'));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
  };

  const verifyUser = (userId: string, verify: boolean) => {
    updateUser(userId, { terverifikasi: verify });
  };

  const importUsersBatch = (newUsers: User[]) => {
    setUsers(prev => [...newUsers, ...prev]);
    newUsers.forEach(u => {
      setDoc(doc(db, 'users', u.id), u).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users'));
    });
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
    setDoc(doc(db, 'articles', newArticle.id), newArticle).catch(err => handleFirestoreError(err, OperationType.WRITE, 'articles'));
  };

  const updateArticle = (id: string, articleData: Partial<Article>) => {
    setArticles(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...articleData };
        setDoc(doc(db, 'articles', id), updated, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'articles'));
        return updated;
      }
      return a;
    }));
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    deleteDoc(doc(db, 'articles', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, 'articles'));
  };

  const incrementArticleViews = (id: string) => {
    setArticles(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, dibaca: a.dibaca + 1 };
        setDoc(doc(db, 'articles', id), updated, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'articles'));
        return updated;
      }
      return a;
    }));
  };

  // Schedule CRUD
  const addSchedule = (data: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...data,
      id: `sch-${Date.now()}`
    };
    setSchedules(prev => [...prev, newSchedule]);
    setDoc(doc(db, 'schedules', newSchedule.id), newSchedule).catch(err => handleFirestoreError(err, OperationType.WRITE, 'schedules'));
  };

  const updateSchedule = (id: string, scheduleData: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...scheduleData };
        setDoc(doc(db, 'schedules', id), updated, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'schedules'));
        return updated;
      }
      return s;
    }));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    deleteDoc(doc(db, 'schedules', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, 'schedules'));
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
    setDoc(doc(db, 'attendance', newRecord.id), newRecord).catch(err => handleFirestoreError(err, OperationType.WRITE, 'attendance'));

    if (status === 'Hadir') {
      updateUser(currentUser.id, { presensiCount: (currentUser.presensiCount || 0) + 1 });
    }
  };

  // Settings
  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const updated = { ...prev, ...newSettings };
      setDoc(doc(db, 'settings', 'config'), updated, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings'));
      return updated;
    });
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
    if (dataPayload.users && Array.isArray(dataPayload.users)) {
      setUsers(dataPayload.users);
      dataPayload.users.forEach((u: User) => setDoc(doc(db, 'users', u.id), u));
    }
    if (dataPayload.articles && Array.isArray(dataPayload.articles)) {
      setArticles(dataPayload.articles);
      dataPayload.articles.forEach((a: Article) => setDoc(doc(db, 'articles', a.id), a));
    }
    if (dataPayload.schedules && Array.isArray(dataPayload.schedules)) {
      setSchedules(dataPayload.schedules);
      dataPayload.schedules.forEach((s: Schedule) => setDoc(doc(db, 'schedules', s.id), s));
    }
    if (dataPayload.appSettings && typeof dataPayload.appSettings === 'object') {
      setAppSettings(dataPayload.appSettings);
      setDoc(doc(db, 'settings', 'config'), dataPayload.appSettings);
    }
    if (dataPayload.attendance && Array.isArray(dataPayload.attendance)) {
      setAttendance(dataPayload.attendance);
      dataPayload.attendance.forEach((att: AttendanceRecord) => setDoc(doc(db, 'attendance', att.id), att));
    }
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
