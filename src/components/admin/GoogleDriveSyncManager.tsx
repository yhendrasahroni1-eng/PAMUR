import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  Download, 
  Upload, 
  Key, 
  ShieldCheck, 
  Database,
  Lock,
  Clock,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Check,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  uploadToGoogleDrive, 
  listGoogleDriveBackups, 
  downloadFromGoogleDrive, 
  DriveFileItem 
} from '../../services/googleDriveService';

export const GoogleDriveSyncManager: React.FC = () => {
  const { 
    appSettings, 
    updateAppSettings, 
    getDatabaseExportPayload, 
    replaceEntireDatabase 
  } = useApp();

  const [accessToken, setAccessToken] = useState<string>(appSettings.driveAccessToken || '');
  const [userEmail, setUserEmail] = useState<string>(appSettings.driveUserEmail || '');
  const [autoSync, setAutoSync] = useState<boolean>(appSettings.driveAutoSyncEnabled || false);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isTestingToken, setIsTestingToken] = useState<boolean>(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [verifiedUserInfo, setVerifiedUserInfo] = useState<{ name?: string; email?: string } | null>(null);

  // Test Access Token via Google UserInfo API
  const handleTestToken = async (tokenToTest?: string) => {
    const token = (tokenToTest || accessToken).trim();
    if (!token) {
      setSyncStatusMsg({
        type: 'error',
        text: 'Masukkan Access Token Google Drive terlebih dahulu.',
      });
      return;
    }

    setIsTestingToken(true);
    setSyncStatusMsg(null);

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Token tidak valid atau telah kadaluwarsa (Status: ${res.status}). Silakan ambil token baru.`);
      }

      const info = await res.json();
      setVerifiedUserInfo({ name: info.name, email: info.email });
      if (info.email) {
        setUserEmail(info.email);
      }

      // Automatically save valid token
      updateAppSettings({
        driveAccessToken: token,
        driveUserEmail: info.email || userEmail,
        driveAutoSyncEnabled: true
      });
      setAutoSync(true);

      setSyncStatusMsg({
        type: 'success',
        text: `Koneksi Google Drive Berhasil! Terhubung ke akun: ${info.name || ''} (${info.email || 'Akun Google'}). Auto-Sync Diaktifkan.`,
      });

      loadDriveFiles(token);
    } catch (err: any) {
      setVerifiedUserInfo(null);
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Gagal memverifikasi Token Google Drive.',
      });
    } finally {
      setIsTestingToken(false);
    }
  };

  // Sync token to appSettings when updated
  const handleSaveToken = () => {
    updateAppSettings({
      driveAccessToken: accessToken.trim(),
      driveUserEmail: userEmail.trim(),
      driveAutoSyncEnabled: autoSync,
    });
    setSyncStatusMsg({
      type: 'success',
      text: 'Pengaturan Google Drive berhasil disimpan.',
    });
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  // Upload current app state to Google Drive
  const handleBackupToDrive = async () => {
    if (!accessToken.trim()) {
      setSyncStatusMsg({
        type: 'error',
        text: 'Masukkan Access Token Google Drive terlebih dahulu.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg(null);

    const payload = getDatabaseExportPayload();
    const res = await uploadToGoogleDrive(accessToken.trim(), payload);

    setIsSyncing(false);

    if (res.success) {
      const nowStr = new Date().toLocaleString('id-ID');
      updateAppSettings({ driveLastSyncDate: nowStr });
      setSyncStatusMsg({
        type: 'success',
        text: res.message,
      });
      // Refresh list
      loadDriveFiles();
    } else {
      setSyncStatusMsg({
        type: 'error',
        text: res.message,
      });
    }
  };

  // Load backups list from Google Drive
  const loadDriveFiles = async (overrideToken?: string) => {
    const token = (overrideToken || accessToken).trim();
    if (!token) return;

    setIsLoadingBackups(true);
    const res = await listGoogleDriveBackups(token);
    setIsLoadingBackups(false);

    if (res.success && res.files) {
      setDriveFiles(res.files);
    } else if (res.message) {
      setSyncStatusMsg({
        type: 'error',
        text: res.message,
      });
    }
  };

  // Download and restore from a selected Google Drive file
  const handleRestoreFromFile = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin memulihkan database dari file Google Drive "${fileName}"? Seluruh data lokal saat ini akan diperbarui.`)) {
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg(null);

    const res = await downloadFromGoogleDrive(accessToken.trim(), fileId);
    setIsSyncing(false);

    if (res.success && res.data) {
      replaceEntireDatabase(res.data);
      setSyncStatusMsg({
        type: 'success',
        text: `Database berhasil dipulihkan dari Google Drive (${fileName})!`,
      });
    } else {
      setSyncStatusMsg({
        type: 'error',
        text: res.message || 'Gagal memulihkan database.',
      });
    }
  };

  // Download Local JSON Backup File
  const handleExportLocalJson = () => {
    const payload = getDatabaseExportPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pamur_db_local_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload Local JSON Backup File
  const handleImportLocalJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!parsed.users || !Array.isArray(parsed.users)) {
            throw new Error('File JSON tidak memiliki struktur database PAMUR yang valid.');
          }
          if (window.confirm('File backup lokal terdeteksi valid. Terapkan/Pulihkan database sekarang?')) {
            replaceEntireDatabase(parsed);
            setSyncStatusMsg({
              type: 'success',
              text: 'Database berhasil dipulihkan dari file JSON lokal!',
            });
          }
        } catch (err: any) {
          alert('Gagal membaca file JSON backup: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (accessToken.trim()) {
      handleTestToken(accessToken);
    }
  }, []);

  // Direct OAuth Playground URL preconfigured with Drive Scope
  const oauthPlaygroundUrl = `https://developers.google.com/oauthplayground/#step1&scopes=${encodeURIComponent('https://www.googleapis.com/auth/drive.file')}&url=https://&content_type=application/json&http_method=GET&useDefaultOauthCreds=true&oauth_version=2.0`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider">
                Integrasi Cloud Database
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Google Drive REST API
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl text-amber-300 flex items-center gap-2">
              <HardDrive className="w-7 h-7 text-amber-400" />
              <span>Sinkronisasi Google Drive PAMUR</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Simpan dan sinkronkan seluruh aktivitas admin (data siswa, artikel, jadwal latihan, presensi) secara otomatis ke Google Drive agar aman dan tidak pernah hilang.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBackupToDrive}
              disabled={isSyncing || !accessToken.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition disabled:opacity-50 active:scale-95"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Menyimpan...' : 'Simpan Ke Google Drive'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {syncStatusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
            syncStatusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {syncStatusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      {/* Easy Step-by-Step Guide Modal / Toggle */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-indigo-950 font-bold">
          <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>Kesulitan menghubungkan Google Drive? Ikuti Panduan Mudah 3 Langkah.</span>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1 shrink-0 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showGuide ? 'Tutup Panduan' : 'Lihat Cara Mudah Connect Google Drive'}</span>
        </button>
      </div>

      {showGuide && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white text-xs space-y-4 shadow-xl animate-fade-in">
          <h3 className="font-heading font-black text-amber-300 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>🚀 Cara 1-Klik Menghubungkan Google Drive PAMUR</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-amber-200">Buka Google OAuth Tool</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Klik tombol di bawah ini untuk membuka halaman otorisasi resmi Google OAuth Playground (Pre-configured untuk Google Drive).
              </p>
              <a
                href={oauthPlaygroundUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition mt-1"
              >
                <span>Buka Google OAuth Tool</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-amber-200">Klik Authorize & Ambil Token</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                1. Klik tombol biru <strong className="text-amber-300">"Authorize APIs"</strong> di sebelah kiri.<br />
                2. Login dengan Akun Google Anda & Izinkan akses Drive.<br />
                3. Klik <strong className="text-amber-300">"Exchange authorization code for tokens"</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-amber-200">Tempel Token & Verifikasi</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Salin teks <strong className="text-emerald-300">Access Token (ya29...)</strong>, lalu tempel pada kolom formulir di bawah ini dan klik <strong className="text-emerald-300 font-bold">"Tes & Hubungkan Koneksi"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Connection & Auto-Sync Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Konfigurasi Kredensial Google Drive
                </h3>
              </div>
              
              {verifiedUserInfo ? (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Terhubung: {verifiedUserInfo.email}
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  OAuth 2.0 Access Token
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Google Drive Access Token (OAuth Token):
                </label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="Masukkan Access Token (ya29...)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestToken()}
                    disabled={isTestingToken || !accessToken.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingToken ? 'animate-spin' : ''}`} />
                    <span>{isTestingToken ? 'Memeriksa...' : 'Tes & Hubungkan'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Access Token memberikan izin aman langsung untuk menyimpan file database di Google Drive Anda tanpa perlu server luar.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Akun Google Drive:
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Contoh: admin.pamur@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-amber-950 text-xs block">
                      ⚡ Otomatis Sinkronkan Setiap Perubahan Admin ke Google Drive
                    </span>
                    <span className="text-[11px] text-amber-900 block leading-relaxed mt-0.5">
                      Apabila diaktifkan, seluruh aksi admin (tambah siswa, ubah artikel, jadwal latihan, dan absensi) akan tersimpan secara otomatis di Google Drive beberapa detik setelah Anda melakukan perubahan.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Terakhir Sinkron: <strong>{appSettings.driveLastSyncDate || 'Belum Pernah'}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveToken}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup File List from Google Drive */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Daftar Cadangan Database di Google Drive
                </h3>
              </div>

              <button
                onClick={() => loadDriveFiles()}
                disabled={isLoadingBackups || !accessToken.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            {driveFiles.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
                <FileJson className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Belum ada file cadangan tersimpan di Google Drive.</p>
                <p className="text-[11px]">Klik tombol "Simpan Ke Google Drive" untuk membuat cadangan pertama Anda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                        <FileJson className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{file.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Diperbarui: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('id-ID') : '-'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreFromFile(file.id, file.name)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto active:scale-95"
                    >
                      <CloudDownload className="w-4 h-4" />
                      <span>Pulihkan Database</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Local JSON Backup / Restore Safeguard */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Download className="w-5 h-5 text-indigo-600" />
              <h3 className="font-heading font-extrabold text-sm text-slate-900">
                Cadangan File JSON Lokal
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Jika Google Drive belum terhubung, Anda dapat membackup atau memindahkan seluruh data antar HP/Komputer dengan cara mengunduh/mengunggah file JSON ini.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportLocalJson}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Backup JSON</span>
              </button>

              <label className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Unggah & Restore JSON Lokal</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportLocalJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

