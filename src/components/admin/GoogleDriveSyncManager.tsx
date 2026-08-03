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
  Clock
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
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        text: 'Masukkan OAuth Access Token Google Drive terlebih dahulu.',
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
  const loadDriveFiles = async () => {
    if (!accessToken.trim()) return;

    setIsLoadingBackups(true);
    const res = await listGoogleDriveBackups(accessToken.trim());
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
    if (!window.confirm(`Apakah Anda yakin ingin memulihkan database dari file Google Drive "${fileName}"? Data lokal saat ini akan diperbarui.`)) {
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
      loadDriveFiles();
    }
  }, [accessToken]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
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
              <span>Penyimpanan Database Google Drive</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Simpan dan pulihkan seluruh data siswa, artikel, jadwal latihan, presensi, dan konfigurasi portal secara aman di akun Google Drive Admin.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBackupToDrive}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition disabled:opacity-50"
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
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                OAuth 2.0 Client
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Google Drive Access Token (OAuth Scope: drive.file):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Masukkan OAuth Access Token (ya29...)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  OAuth token didapatkan secara otomatis saat Admin menyetujui izin Google Drive pada sistem.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Akun Google Drive (Opsional):
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Otomatis Sinkronisasi Ke Google Drive
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Tersimpan secara berkala sehingga backup selalu terbarui secara otomatis di cloud.
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
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
                onClick={loadDriveFiles}
                disabled={isLoadingBackups}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
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
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
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
                Cadangan Lokal (Offline JSON)
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Selain Google Drive, Anda dapat mengunduh atau mengunggah cadangan database dalam bentuk file JSON langsung di perangkat ini.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportLocalJson}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow transition"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Backup JSON</span>
              </button>

              <label className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
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
