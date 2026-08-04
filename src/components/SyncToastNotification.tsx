import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, AlertTriangle, RefreshCw, X, RotateCw, CheckCircle2 } from 'lucide-react';

export const SyncToastNotification: React.FC = () => {
  const { 
    syncStatus, 
    syncErrorMessage, 
    isSyncToastDismissed, 
    dismissSyncToast, 
    retrySyncConnection 
  } = useApp();

  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retrySuccessMsg, setRetrySuccessMsg] = React.useState<string | null>(null);

  if (syncStatus === 'online' && !retrySuccessMsg) {
    return null;
  }

  if (isSyncToastDismissed && !retrySuccessMsg) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetrySuccessMsg(null);
    await retrySyncConnection();
    setIsRetrying(false);
    
    if (navigator.onLine) {
      setRetrySuccessMsg('Koneksi internet berhasil dipulihkan!');
      setTimeout(() => {
        setRetrySuccessMsg(null);
      }, 4000);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-[9999] max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md text-white ${
        retrySuccessMsg 
          ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100 ring-2 ring-emerald-500/30' 
          : syncStatus === 'offline' 
            ? 'bg-slate-950/95 border-amber-500/50 text-slate-100 ring-2 ring-amber-500/30' 
            : 'bg-slate-950/95 border-rose-500/50 text-slate-100 ring-2 ring-rose-500/30'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              retrySuccessMsg 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : syncStatus === 'offline'
                  ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 animate-bounce'
            }`}>
              {retrySuccessMsg ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : syncStatus === 'offline' ? (
                <WifiOff className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-black text-sm text-amber-300 flex items-center gap-2">
                {retrySuccessMsg ? (
                  <span className="text-emerald-300 font-bold">Terhubung Kembali</span>
                ) : syncStatus === 'offline' ? (
                  <span>Koneksi Internet Terputus (Offline)</span>
                ) : (
                  <span className="text-rose-300">Gagal Sinkronisasi Database Cloud</span>
                )}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {retrySuccessMsg || syncErrorMessage || (
                  syncStatus === 'offline' 
                    ? 'Koneksi ke server Firebase terhenti. Silakan periksa jaringan internet Anda atau muat ulang halaman.' 
                    : 'Terjadi kendala saat menyinkronkan data dengan Cloud. Aplikasi berjalan dalam mode cadangan lokal.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={dismissSyncToast}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!retrySuccessMsg && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              onClick={handleReload}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              Muat Ulang Halaman
            </button>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                syncStatus === 'offline'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              } disabled:opacity-50`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Mencoba...' : 'Coba Hubungkan Ulang'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
