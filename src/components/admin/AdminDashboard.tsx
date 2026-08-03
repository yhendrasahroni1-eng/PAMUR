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
  HardDrive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminSiswaManager } from './AdminSiswaManager';
import { AdminArtikelManager } from './AdminArtikelManager';
import { AdminJadwalManager } from './AdminJadwalManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { GoogleDriveSyncManager } from './GoogleDriveSyncManager';

export const AdminDashboard: React.FC = () => {
  const { users, articles, schedules, appSettings, generateWhatsAppUrl } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'siswa' | 'artikel' | 'jadwal' | 'settings' | 'drive'>('overview');

  const siswaList = users.filter(u => u.role === 'siswa');
  const pendingSiswa = siswaList.filter(u => !u.terverifikasi);

  const adminTabs = [
    { id: 'overview', label: 'Ringkasan Portal', icon: ShieldCheck },
    { id: 'siswa', label: `Kelola Siswa & Admin (${users.length})`, icon: Users, badge: pendingSiswa.length > 0 ? pendingSiswa.length : null },
    { id: 'artikel', label: `Artikel (${articles.length})`, icon: Newspaper },
    { id: 'jadwal', label: `Jadwal (${schedules.length})`, icon: Calendar },
    { id: 'drive', label: 'Google Drive Database', icon: HardDrive },
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
      {activeAdminTab === 'settings' && <AdminSettingsManager />}

    </div>
  );
};
