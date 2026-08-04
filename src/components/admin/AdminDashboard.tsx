import React, { useState } from 'react';
import { 
  Lock, 
  Users, 
  Newspaper, 
  Calendar, 
  Settings, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  PhoneCall,
  ArrowUpRight,
  KeyRound,
  HardDrive,
  Database,
  RefreshCw,
  Cloud,
  Sparkles,
  Check,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminSiswaManager } from './AdminSiswaManager';
import { AdminArtikelManager } from './AdminArtikelManager';
import { AdminJadwalManager } from './AdminJadwalManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { GoogleDriveSyncManager } from './GoogleDriveSyncManager';
import { FirestoreDiagnosticTool } from './FirestoreDiagnosticTool';

export const AdminDashboard: React.FC = () => {
  const { users, articles, schedules, appSettings, generateWhatsAppUrl, syncAllToCloudFirestore } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'siswa' | 'artikel' | 'jadwal' | 'settings' | 'drive' | 'diag'>('overview');
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [cloudSyncMsg, setCloudSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleForceCloudSync = async () => {
    setIsSyncingCloud(true);
    setCloudSyncMsg(null);
    const res = await syncAllToCloudFirestore();
    setIsSyncingCloud(false);
    setCloudSyncMsg({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    setTimeout(() => setCloudSyncMsg(null), 5000);
  };

  const siswaList = users.filter(u => u.role === 'siswa');
  const pendingSiswa = siswaList.filter(u => !u.terverifikasi);

  const adminTabs = [
    { id: 'overview', label: 'Ringkasan Portal', icon: ShieldCheck },
    { id: 'siswa', label: `Kelola Siswa & Admin (${users.length})`, icon: Users, badge: pendingSiswa.length > 0 ? pendingSiswa.length : null },
    { id: 'artikel', label: `Artikel (${articles.length})`, icon: Newspaper },
    { id: 'jadwal', label: `Jadwal (${schedules.length})`, icon: Calendar },
    { id: 'drive', label: 'Google Drive Database', icon: HardDrive },
    { id: 'diag', label: 'Diagnosis Database', icon: Activity },
    { id: 'settings', label: 'Pengaturan & WA', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      
      {/* Admin Title Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>DASBOR ADMINISTRATOR RESMI</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Pusat Pengendalian PAMUR Indonesia
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Akses penuh pengelolaan data siswa, penerbitan ID Card, artikel, jadwal latihan, dan integrasi WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveAdminTab('settings')}
            className="px-3.5 py-2.5 rounded-2xl bg-indigo-800/90 hover:bg-indigo-700 border border-indigo-600/50 text-indigo-100 font-bold text-xs flex items-center space-x-2 shadow-md transition"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Ubah Kata Sandi Admin</span>
          </button>

          <a
            href={generateWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>WA Admin: +{appSettings.noWaAdmin}</span>
          </a>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[9px] animate-pulse">
                  {tab.badge} pending
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Render */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Cloud Database Multi-Device Sync Status Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-400 tracking-wider uppercase">
                    Server Database & Cloud Firestore Aktif
                  </span>
                </div>
                <h3 className="font-heading font-black text-lg text-amber-300 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <span>Penyimpanan Server Express Backend Internal</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Seluruh perubahan data (pendaftaran siswa, verifikasi, artikel, jadwal, dan presensi) tersimpan langsung di Express Server Database (<code className="text-amber-300">/api/db</code>) secara otomatis tanpa tergantung koneksi pihak ketiga.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleForceCloudSync}
                  disabled={isSyncingCloud}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50 active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Simpan ke Server DB'}</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('diag')}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Uji Diagnostic Ping</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('drive')}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Atur Google Drive</span>
                </button>
              </div>
            </div>

            {cloudSyncMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                cloudSyncMsg.type === 'success' 
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}>
                {cloudSyncMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{cloudSyncMsg.text}</span>
              </div>
            )}
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Siswa</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-heading font-black text-3xl text-slate-900">
                {siswaList.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold">
                {siswaList.filter(s => s.terverifikasi).length} Siswa Terverifikasi
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Pending Verifikasi</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="font-heading font-black text-3xl text-amber-600">
                {pendingSiswa.length}
              </div>
              <button 
                onClick={() => setActiveAdminTab('siswa')}
                className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Proses Sekarang</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Artikel Terpublikasi</span>
                <Newspaper className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-heading font-black text-3xl text-slate-900">
                {articles.length}
              </div>
              <button 
                onClick={() => setActiveAdminTab('artikel')}
                className="text-[11px] text-indigo-600 font-bold hover:underline"
              >
                Tulis Artikel
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Jadwal Latihan Aktif</span>
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-heading font-black text-3xl text-slate-900">
                {schedules.length}
              </div>
              <button 
                onClick={() => setActiveAdminTab('jadwal')}
                className="text-[11px] text-indigo-600 font-bold hover:underline"
              >
                Kelola Jadwal
              </button>
            </div>

          </div>

          {/* Pending Verification Notice List */}
          {pendingSiswa.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Pendaftaran Siswa Baru Menunggu Verifikasi ({pendingSiswa.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingSiswa.map(p => (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-white border border-amber-200 flex items-center justify-between text-xs shadow-sm">
                    <div>
                      <div className="font-bold text-slate-900">{p.nama}</div>
                      <div className="text-[10px] text-slate-500">{p.ranting} • NIS: {p.nis}</div>
                    </div>
                    <button
                      onClick={() => setActiveAdminTab('siswa')}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm"
                    >
                      Verifikasi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shortcut Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Kelola Siswa & ID Card
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih siswa untuk mengubah tingkat sabuk, memverifikasi status anggota, dan membagikan KTA Digital via WhatsApp.
              </p>
              <button
                onClick={() => setActiveAdminTab('siswa')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm"
              >
                Buka Data Siswa
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Pengaturan Kontak WA Admin
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ubah nomor WhatsApp admin resmi (+{appSettings.noWaAdmin}) agar pendaftaran & konsultasi langsung terarah.
              </p>
              <button
                onClick={() => setActiveAdminTab('settings')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs"
              >
                Atur No WA
              </button>
            </div>
          </div>

        </div>
      )}

      {activeAdminTab === 'siswa' && <AdminSiswaManager />}
      {activeAdminTab === 'artikel' && <AdminArtikelManager />}
      {activeAdminTab === 'jadwal' && <AdminJadwalManager />}
      {activeAdminTab === 'drive' && <GoogleDriveSyncManager />}
      {activeAdminTab === 'diag' && <FirestoreDiagnosticTool />}
      {activeAdminTab === 'settings' && <AdminSettingsManager />}

    </div>
  );
};
