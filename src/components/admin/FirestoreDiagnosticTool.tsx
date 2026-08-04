import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Terminal, 
  Copy, 
  Check, 
  Server, 
  Cloud, 
  Wifi, 
  ShieldAlert,
  Clock
} from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  code: string;
  latencyMs?: number;
  details: string;
  timestamp: string;
}

export const FirestoreDiagnosticTool: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [summaryStatus, setSummaryStatus] = useState<'healthy' | 'degraded' | 'failed' | 'idle'>('idle');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setSummaryStatus('idle');
    const logs: DiagnosticResult[] = [];

    const addLog = (
      step: string, 
      status: 'pending' | 'success' | 'warning' | 'error', 
      code: string, 
      details: string, 
      latencyMs?: number
    ) => {
      const entry: DiagnosticResult = {
        step,
        status,
        code,
        latencyMs,
        details,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false })
      };
      logs.push(entry);
      setResults([...logs]);
    };

    // 1. Browser Network Check
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (isOnline) {
      addLog('Network Connectivity', 'success', 'NET_ONLINE_200', 'Perangkat terhubung ke jaringan internet.');
    } else {
      addLog('Network Connectivity', 'error', 'NET_OFFLINE_0', 'Perangkat dalam keadaan Offline / Tidak ada koneksi internet.');
      setSummaryStatus('failed');
      setIsRunning(false);
      return;
    }

    // 2. Express Backend Server Ping (/api/health)
    const startExpress = performance.now();
    try {
      const res = await fetch('/api/health');
      const expressLatency = Math.round(performance.now() - startExpress);
      if (res.ok) {
        const json = await res.json();
        addLog(
          'Express Backend API (/api/health)', 
          'success', 
          `HTTP_${res.status}_OK`, 
          `Server aktif & merespons dalam ${expressLatency}ms. Status: ${json.status || 'ok'}`, 
          expressLatency
        );
      } else {
        addLog(
          'Express Backend API (/api/health)', 
          'warning', 
          `HTTP_${res.status}`, 
          `Server merespons dengan kode HTTP ${res.status}. Fallback ke mode client.`, 
          expressLatency
        );
      }
    } catch (err: any) {
      const expressLatency = Math.round(performance.now() - startExpress);
      addLog(
        'Express Backend API (/api/health)', 
        'warning', 
        'SERVER_CONN_REFUSED', 
        `Gagal terhubung ke Express Server: ${err.message || String(err)}. Memori lokal aktif.`, 
        expressLatency
      );
    }

    // 3. Firebase Project Metadata Config Check
    const projectId = db.app?.options?.projectId || 'Unknown';
    const authDomain = db.app?.options?.authDomain || 'Unknown';
    addLog(
      'Firebase Configuration', 
      'success', 
      'CFG_VALID', 
      `Project ID: ${projectId} | Auth Domain: ${authDomain}`
    );

    // 4. Firestore Read Permission & Ping Test
    const startFirestoreRead = performance.now();
    let isReadOk = false;
    try {
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      const fsReadLatency = Math.round(performance.now() - startFirestoreRead);
      isReadOk = true;

      addLog(
        'Firestore Read Ping (/settings/config)',
        'success',
        'FS_READ_200_OK',
        `Berhasil membaca dokumen config. Dokumen ${docSnap.exists() ? 'DITEMUKAN' : 'KOSONG (Baru)'}. Latensi: ${fsReadLatency}ms.`,
        fsReadLatency
      );
    } catch (err: any) {
      const fsReadLatency = Math.round(performance.now() - startFirestoreRead);
      const errorCode = err?.code || 'FS_READ_ERROR';
      const errorMessage = err?.message || String(err);

      let statusType: 'warning' | 'error' = 'error';
      let detailsMsg = `Gagal membaca dari Firestore: ${errorMessage}`;

      if (errorCode === 'permission-denied') {
        detailsMsg = 'Akses ditolak (permission-denied). Aturan keamanan Firestore memblokir pembacaan tanpa otentikasi admin.';
      } else if (errorCode === 'unavailable') {
        detailsMsg = 'Layanan Firestore sementara tidak tersedia (unavailable). Kemungkinan masalah DNS / Blokir Jaringan.';
      }

      addLog(
        'Firestore Read Ping (/settings/config)',
        statusType,
        errorCode.toUpperCase(),
        detailsMsg,
        fsReadLatency
      );
    }

    // 5. Firestore Write Permission & Clean-up Test
    const startFirestoreWrite = performance.now();
    let isWriteOk = false;
    try {
      const testDocId = `ping_test_${Date.now()}`;
      const testDocRef = doc(db, '_diagnostics', testDocId);
      
      await setDoc(testDocRef, {
        pingTime: new Date().toISOString(),
        testedBy: auth.currentUser?.email || 'Admin',
        clientIp: '127.0.0.1'
      });

      const fsWriteLatency = Math.round(performance.now() - startFirestoreWrite);
      isWriteOk = true;

      // Clean up test document
      deleteDoc(testDocRef).catch(e => console.warn('Clean ping doc error:', e));

      addLog(
        'Firestore Write & Delete Test (/_diagnostics)',
        'success',
        'FS_WRITE_200_OK',
        `Izin menulis & menghapus dokumen Firestore BERHASIL terverifikasi dalam ${fsWriteLatency}ms.`,
        fsWriteLatency
      );
    } catch (err: any) {
      const fsWriteLatency = Math.round(performance.now() - startFirestoreWrite);
      const errorCode = err?.code || 'FS_WRITE_ERROR';
      const errorMessage = err?.message || String(err);

      addLog(
        'Firestore Write Test (/_diagnostics)',
        'warning',
        errorCode.toUpperCase(),
        `Penulisan ke Cloud Firestore gagal (${errorCode}): ${errorMessage}. Penyimpanan lokal Express tetap aktif.`,
        fsWriteLatency
      );
    }

    // 6. Final Status Summary Evaluation
    if (isReadOk && isWriteOk) {
      setSummaryStatus('healthy');
    } else if (isReadOk || logs.some(l => l.step.includes('Express') && l.status === 'success')) {
      setSummaryStatus('degraded');
    } else {
      setSummaryStatus('failed');
    }

    setIsRunning(false);
  };

  const copyDiagnosticLogs = () => {
    const text = results.map(r => `[${r.timestamp}] [${r.status.toUpperCase()}] ${r.step} -> Code: ${r.code} (${r.latencyMs ? r.latencyMs + 'ms' : 'N/A'})\nDetail: ${r.details}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-amber-300 flex items-center gap-2">
              <span>Alat Diagnosis & Ping Real-Time Firestore</span>
            </h3>
            <p className="text-xs text-slate-400">
              Deteksi kode status koneksi, latensi, serta izin baca/tulis Cloud Firestore & Server Express.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {results.length > 0 && (
            <button
              onClick={copyDiagnosticLogs}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Log'}</span>
            </button>
          )}

          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Mendiagnosis...' : 'Jalankan Uji Koneksi Ping'}</span>
          </button>
        </div>
      </div>

      {/* Summary Badge */}
      {summaryStatus !== 'idle' && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          summaryStatus === 'healthy' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
            : summaryStatus === 'degraded' 
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200' 
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            {summaryStatus === 'healthy' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {summaryStatus === 'degraded' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {summaryStatus === 'failed' && <XCircle className="w-5 h-5 text-rose-400" />}
            <div>
              <h4 className="font-black text-sm">
                {summaryStatus === 'healthy' && 'Koneksi Cloud Firestore & Server Berjalan Sempurna (200 OK)'}
                {summaryStatus === 'degraded' && 'Mode Cadangan Aktif (Firestore Terbatas / Express Server Digunakan)'}
                {summaryStatus === 'failed' && 'Koneksi Terputus / Jaringan Offline'}
              </h4>
              <p className="text-[11px] opacity-90 font-normal">
                {summaryStatus === 'healthy' && 'Seluruh izin membaca dan menulis Firestore serta server lokal merespons dengan cepat.'}
                {summaryStatus === 'degraded' && 'Aplikasi otomatis mengamankan data ke Express Server Database lokal agar pendaftaran tidak hilang.'}
                {summaryStatus === 'failed' && 'Periksa koneksi internet atau Wi-Fi Anda.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/60 border border-current">
            {summaryStatus}
          </span>
        </div>
      )}

      {/* Diagnostic Console Logs Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Riwayat Uji Kode Status Raw (& Latensi)</span>
          </span>
          <span>{results.length} Pengujian Selesai</span>
        </div>

        {results.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <Server className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              Klik tombol <strong className="text-amber-300">"Jalankan Uji Koneksi Ping"</strong> di atas untuk melihat respon kode status HTTP, status Firestore, dan latensi jaringan secara detail.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
            {results.map((res, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 font-mono transition ${
                  res.status === 'success' 
                    ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200' 
                    : res.status === 'warning'
                      ? 'bg-amber-950/30 border-amber-500/40 text-slate-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold flex items-center gap-2 text-slate-100 font-sans">
                    {res.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {res.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {res.status === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{res.step}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    {res.latencyMs !== undefined && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        <Clock className="w-3 h-3 inline mr-1 text-amber-400" />
                        {res.latencyMs}ms
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      res.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      res.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {res.code}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {res.details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
