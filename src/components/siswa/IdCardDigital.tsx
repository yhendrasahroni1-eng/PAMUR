import React, { useState } from 'react';
import { 
  Shield,
  ShieldCheck, 
  RotateCw, 
  Printer, 
  QrCode, 
  Share2, 
  AlertTriangle,
  MapPin,
  ScanLine,
  FileCheck,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface IdCardDigitalProps {
  userOverride?: User | null;
}

export const IdCardDigital: React.FC<IdCardDigitalProps> = ({ userOverride }) => {
  const { currentUser, appSettings, generateWhatsAppUrl } = useApp();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'both'>('3d');

  const targetUser = userOverride || currentUser;

  if (!targetUser) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
        <p className="text-sm">Silakan masuk akun siswa terlebih dahulu untuk melihat ID Card Digital Anda.</p>
      </div>
    );
  }

  // Get belt color styling
  const getSabukBadge = (sabuk: string) => {
    const s = (sabuk || '').toLowerCase();
    if (s.includes('dasar')) return { bg: 'bg-slate-200 text-slate-950 border-slate-400', label: 'SABUK DASAR' };
    if (s.includes('putih')) return { bg: 'bg-slate-100 text-slate-900 border-slate-300', label: 'SABUK PUTIH' };
    if (s.includes('kuning')) return { bg: 'bg-amber-400 text-slate-950 border-amber-300', label: 'SABUK KUNING' };
    if (s.includes('merah')) return { bg: 'bg-red-600 text-white border-red-400', label: 'SABUK MERAH' };
    if (s.includes('hijau')) return { bg: 'bg-emerald-600 text-white border-emerald-400', label: 'SABUK HIJAU' };
    if (s.includes('biru')) return { bg: 'bg-blue-600 text-white border-blue-400', label: 'SABUK BIRU' };
    if (s.includes('hitam')) return { bg: 'bg-slate-950 text-amber-300 border-amber-500', label: 'SABUK HITAM' };
    return { bg: 'bg-amber-500 text-slate-950 border-amber-400', label: `SABUK ${sabuk.toUpperCase()}` };
  };

  const sabukStyle = getSabukBadge(targetUser.tingkatSabuk);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-900/40 no-print">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
              Kartu Tanda Anggota Digital (KTA PAMUR)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Diterbitkan resmi oleh Perguruan Seni Bela Diri Pencak Silat PAMUR Indonesia.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode(viewMode === '3d' ? 'both' : '3d')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Ubah Mode Tampilan"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{viewMode === '3d' ? 'Lihat 2 Sisi' : 'Mode 3D Flip'}</span>
          </button>

          {viewMode === '3d' && (
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isFlipped ? 'Tampilkan Depan' : 'Tampilkan Belakang'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black flex items-center gap-2 transition shadow-lg shadow-red-950/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak ID Card</span>
          </button>
        </div>
      </div>

      {/* Screen Interactive Viewer (Hidden during printing) */}
      <div className="no-print space-y-4">
        {viewMode === '3d' ? (
          /* Single Card Flip Mode */
          <div className="flex justify-center items-center py-4">
            <div className="w-full max-w-md perspective-1000">
              <div className={`relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT SIDE */}
                {!isFlipped ? (
                  <div className="w-full bg-slate-950 rounded-3xl border-2 border-amber-500/60 shadow-2xl overflow-hidden relative p-6 space-y-4 text-white font-sans">
                    {/* Background Watermark Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-amber-500/40 relative z-10">
                      <div className="flex items-center space-x-3">
                        {appSettings.logoUrl ? (
                          <img
                            src={appSettings.logoUrl}
                            alt="Logo PAMUR"
                            className="h-11 w-auto max-w-[80px] object-contain drop-shadow"
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            <Shield className="w-8 h-8 text-amber-400 drop-shadow" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading font-black text-xs uppercase tracking-wider text-amber-300">
                            PAMUR INDONESIA
                          </h3>
                          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">
                            KARTU TANDA ANGGOTA (KTA) RESMI
                          </p>
                        </div>
                      </div>

                      {/* Verification Status Stamp */}
                      <div>
                        {targetUser.terverifikasi ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold text-[9px] flex items-center gap-1 uppercase">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            AKTIF
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 font-extrabold text-[9px] flex items-center gap-1 uppercase">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content (Photo + Details) */}
                    <div className="grid grid-cols-12 gap-4 items-center relative z-10 pt-1">
                      {/* Photo Column */}
                      <div className="col-span-4 text-center">
                        <div className="relative inline-block w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl bg-slate-900">
                          <img
                            src={targetUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                            alt={targetUser.nama}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur py-0.5 text-[8px] font-mono text-amber-300 font-bold">
                            {targetUser.nis}
                          </div>
                        </div>
                      </div>

                      {/* Info Column */}
                      <div className="col-span-8 space-y-2 text-xs">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Nama Anggota</div>
                          <div className="font-heading font-black text-slate-100 text-sm leading-snug">
                            {targetUser.nama}
                          </div>
                        </div>

                        {targetUser.nik && (
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">NIK (KTP/KK)</div>
                            <div className="font-mono text-slate-300 text-[11px] font-semibold">
                              {targetUser.nik}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Ranting</div>
                            <div className="font-bold text-amber-200 text-[11px] line-clamp-1">
                              {targetUser.ranting}
                            </div>
                          </div>

                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Bergabung</div>
                            <div className="font-semibold text-slate-300 text-[11px]">
                              {targetUser.tanggalBergabung}
                            </div>
                          </div>
                        </div>

                        {/* Belt Level Tag */}
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Tingkat Sabuk</div>
                          <span className={`inline-block px-2.5 py-1 rounded-lg border font-extrabold text-[10px] tracking-wide shadow ${sabukStyle.bg}`}>
                            {targetUser.tingkatSabuk}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>Pamekasan - Madura, Jawa Timur</span>
                      </div>

                      {/* Mini QR Button */}
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-400 transition"
                        title="Scan QR Code Verifikasi"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BACK SIDE */
                  <div className="w-full bg-slate-950 rounded-3xl border-2 border-amber-500/60 shadow-2xl overflow-hidden relative p-6 space-y-4 text-white font-sans min-h-[290px] flex flex-col justify-between">
                    <div className="border-b border-slate-800 pb-2 text-center">
                      <h4 className="font-heading font-extrabold text-xs text-amber-400 uppercase tracking-widest">
                        SUMPAH PESILAT PAMUR INDONESIA
                      </h4>
                    </div>

                    <div className="text-[10px] text-slate-300 space-y-1.5 leading-relaxed italic text-center px-2 font-serif">
                      <p>1. Bertakwa kepada Tuhan Yang Maha Esa dan Berbudi Pekerti Luhur.</p>
                      <p>2. Menjunjung tinggi persaudaraan, kejujuran, dan kehormatan Perguruan.</p>
                      <p>3. Menggunakan ilmu silat semata-mata untuk membela diri dan kebenaran.</p>
                      <p>4. Patuh dan taat kepada Guru Besar serta Peraturan Organisasi PAMUR.</p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-bold text-amber-400">VERIFIKASI DIGITAL NIS</div>
                        <div className="font-mono text-[11px] font-bold text-slate-200">{targetUser.nis}</div>
                        <div className="text-[8px] text-slate-400 mt-0.5">Status: TERDAFTAR IPSI JATIM</div>
                      </div>

                      <div className="w-16 h-16 bg-white p-1 rounded-xl shadow shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <rect x="0" y="0" width="30" height="30" fill="#000"/>
                          <rect x="5" y="5" width="20" height="20" fill="#fff"/>
                          <rect x="10" y="10" width="10" height="10" fill="#000"/>
                          <rect x="70" y="0" width="30" height="30" fill="#000"/>
                          <rect x="75" y="5" width="20" height="20" fill="#fff"/>
                          <rect x="80" y="10" width="10" height="10" fill="#000"/>
                          <rect x="0" y="70" width="30" height="30" fill="#000"/>
                          <rect x="5" y="75" width="20" height="20" fill="#fff"/>
                          <rect x="10" y="80" width="10" height="10" fill="#000"/>
                          <rect x="40" y="40" width="20" height="20" fill="#000"/>
                          <rect x="40" y="70" width="20" height="10" fill="#000"/>
                          <rect x="70" y="40" width="10" height="20" fill="#000"/>
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-end justify-between text-[8px] text-slate-400 pt-1">
                      <div>
                        <div>Diterbitkan di: Pamekasan</div>
                        <div>Sekretariat Dewan Pendekar PAMUR</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-300 text-[10px]">Dewan Pelatih Utama</div>
                        <div className="h-5 text-amber-400/80 italic font-mono flex items-center justify-end">Bambang S.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Dual Side Preview Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
            {/* Front Card */}
            <div className="bg-slate-950 rounded-3xl border-2 border-amber-500/60 shadow-xl p-5 space-y-4 text-white">
              <div className="text-xs font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>TAMPAKAN DEPAN</span>
                <span className="text-[10px] text-slate-400 font-mono">CR-80 Format</span>
              </div>
              <div className="flex items-center space-x-3">
                {appSettings.logoUrl ? (
                  <img
                    src={appSettings.logoUrl}
                    alt="Logo PAMUR"
                    className="h-9 w-auto max-w-[70px] object-contain drop-shadow"
                  />
                ) : (
                  <Shield className="w-7 h-7 text-amber-400 shrink-0 drop-shadow" />
                )}
                <div>
                  <h4 className="font-heading font-black text-xs text-amber-300">PAMUR INDONESIA</h4>
                  <p className="text-[9px] text-slate-300">KARTU TANDA ANGGOTA RESMI</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <img
                  src={targetUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                  alt={targetUser.nama}
                  className="w-20 h-28 object-cover rounded-xl border border-amber-400/80 shrink-0"
                />
                <div className="space-y-1.5 text-xs overflow-hidden">
                  <div className="font-black text-sm text-slate-100 truncate">{targetUser.nama}</div>
                  <div className="text-[10px] text-amber-300 font-mono">NIS: {targetUser.nis}</div>
                  {targetUser.nik && <div className="text-[10px] text-slate-400 font-mono">NIK: {targetUser.nik}</div>}
                  <div className="text-[10px] text-slate-300 truncate">Ranting: {targetUser.ranting}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${sabukStyle.bg}`}>
                    {targetUser.tingkatSabuk}
                  </span>
                </div>
              </div>
            </div>

            {/* Back Card */}
            <div className="bg-slate-950 rounded-3xl border-2 border-amber-500/60 shadow-xl p-5 space-y-3 text-white min-h-[220px] flex flex-col justify-between">
              <div className="text-xs font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>TAMPAKAN BELAKANG</span>
                <span className="text-[10px] text-slate-400">Sumpah & Verifikasi</span>
              </div>
              <div className="text-[9px] text-slate-300 space-y-1 italic text-center font-serif">
                <p>1. Bertakwa kepada Tuhan YME & Berbudi Pekerti Luhur.</p>
                <p>2. Menjunjung persaudaraan, kejujuran & kehormatan.</p>
                <p>3. Menggunakan silat membela diri & kebenaran.</p>
                <p>4. Patuh Guru Besar & Peraturan PAMUR.</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[9px]">
                <div>
                  <div className="font-bold text-amber-400">VERIFIKASI NIS</div>
                  <div className="font-mono text-slate-200">{targetUser.nis}</div>
                </div>
                <div className="w-10 h-10 bg-white p-0.5 rounded">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="0" y="0" width="30" height="30" fill="#000"/>
                    <rect x="70" y="0" width="30" height="30" fill="#000"/>
                    <rect x="0" y="70" width="30" height="30" fill="#000"/>
                    <rect x="40" y="40" width="20" height="20" fill="#000"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <button
          onClick={handlePrint}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-red-950/40"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>Cetak ID Card Sekarang</span>
        </button>

        <a
          href={generateWhatsAppUrl(
            `Halo Admin PAMUR, mohon verifikasi KTA Digital atas nama ${targetUser.nama} (NIS: ${targetUser.nis}).`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>Kirim KTA ke WA Admin</span>
        </a>

        <button
          onClick={() => setShowQrModal(true)}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <ScanLine className="w-4 h-4 text-amber-400" />
          <span>Scan Verifikasi QR Code</span>
        </button>
      </div>


      {/* Dedicated Printable Area (#printable-id-card-section) */}
      <div id="printable-id-card-section" className="hidden print:block">
        <div className="max-w-2xl mx-auto p-4 space-y-6 text-slate-900 font-sans">
          
          {/* Print Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <h1 className="text-lg font-black tracking-wide text-slate-950 uppercase">
              PERGURUAN SENI BELA DIRI PENCAK SILAT PAMUR INDONESIA
            </h1>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              KARTU TANDA ANGGOTA (KTA) DIGITAL RESMI
            </p>
            <p className="text-[10px] text-slate-500">
              Sekretariat Pusat: Pamekasan, Madura, Jawa Timur | Terdaftar Resmi IPSI
            </p>
          </div>

          {/* Dual Card Printable Grid */}
          <div className="grid grid-cols-2 gap-6 items-start justify-center pt-2">
            
            {/* FRONT PRINT CARD */}
            <div className="w-[340px] mx-auto bg-slate-950 rounded-2xl border-2 border-amber-500 p-5 space-y-3 text-white shadow-md relative overflow-hidden" style={{ minHeight: '215px' }}>
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/50">
                <div className="flex items-center space-x-2">
                  {appSettings.logoUrl ? (
                    <img
                      src={appSettings.logoUrl}
                      alt="Logo PAMUR"
                      className="h-8 w-auto max-w-[65px] object-contain drop-shadow"
                    />
                  ) : (
                    <Shield className="w-6 h-6 text-amber-400 shrink-0 drop-shadow" />
                  )}
                  <div>
                    <div className="font-extrabold text-[10px] text-amber-300 tracking-wider">PAMUR INDONESIA</div>
                    <div className="text-[8px] text-slate-300">KTA SISWA RESMI</div>
                  </div>
                </div>
                <div className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-500">
                  VERIFIED
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4 text-center">
                  <img
                    src={targetUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                    alt={targetUser.nama}
                    className="w-20 h-28 object-cover rounded-xl border-2 border-amber-400 mx-auto"
                  />
                  <div className="text-[8px] font-mono font-bold text-amber-300 mt-1">{targetUser.nis}</div>
                </div>

                <div className="col-span-8 space-y-1.5 text-[10px]">
                  <div>
                    <div className="text-[8px] text-slate-400 uppercase font-bold">Nama Lengkap</div>
                    <div className="font-black text-slate-100 text-xs leading-tight">{targetUser.nama}</div>
                  </div>

                  {targetUser.nik && (
                    <div>
                      <div className="text-[8px] text-slate-400 uppercase font-bold">NIK (KTP/KK)</div>
                      <div className="font-mono text-slate-300 font-bold text-[9px]">{targetUser.nik}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-[8px] text-slate-400 uppercase font-bold">Ranting</div>
                      <div className="font-bold text-amber-200 text-[9px] truncate">{targetUser.ranting}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-slate-400 uppercase font-bold">Bergabung</div>
                      <div className="font-semibold text-slate-300 text-[9px]">{targetUser.tanggalBergabung}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] text-slate-400 uppercase font-bold mb-0.5">Tingkat Sabuk</div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-extrabold ${sabukStyle.bg}`}>
                      {targetUser.tingkatSabuk}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[8px] text-slate-400">
                <span>Pamekasan - Madura, Jawa Timur</span>
                <span className="font-mono font-bold text-amber-400">SISI DEPAN</span>
              </div>
            </div>

            {/* BACK PRINT CARD */}
            <div className="w-[340px] mx-auto bg-slate-950 rounded-2xl border-2 border-amber-500 p-5 space-y-3 text-white shadow-md flex flex-col justify-between" style={{ minHeight: '215px' }}>
              <div className="border-b border-slate-800 pb-1 text-center">
                <div className="font-extrabold text-[10px] text-amber-400 uppercase tracking-wider">
                  SUMPAH PESILAT PAMUR INDONESIA
                </div>
              </div>

              <div className="text-[8px] text-slate-300 space-y-1 italic text-center font-serif leading-tight">
                <p>1. Bertakwa kepada Tuhan YME & Berbudi Pekerti Luhur.</p>
                <p>2. Menjunjung tinggi persaudaraan, kejujuran & kehormatan.</p>
                <p>3. Menggunakan ilmu silat membela diri & kebenaran.</p>
                <p>4. Patuh Guru Besar & Peraturan Organisasi PAMUR.</p>
              </div>

              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[8px] font-bold text-amber-400">VERIFIKASI NIS DIGITAL</div>
                  <div className="font-mono text-[10px] font-bold text-slate-200">{targetUser.nis}</div>
                  <div className="text-[7px] text-slate-400">Status: TERDAFTAR IPSI</div>
                </div>
                <div className="w-12 h-12 bg-white p-0.5 rounded shadow shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="0" y="0" width="30" height="30" fill="#000"/>
                    <rect x="70" y="0" width="30" height="30" fill="#000"/>
                    <rect x="0" y="70" width="30" height="30" fill="#000"/>
                    <rect x="40" y="40" width="20" height="20" fill="#000"/>
                  </svg>
                </div>
              </div>

              <div className="flex items-end justify-between text-[8px] text-slate-400">
                <div>
                  <div>Sekretariat Dewan Pendekar</div>
                  <div>Pamekasan - Jatim</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-300 text-[9px]">Dewan Pelatih Utama</div>
                  <div className="italic font-mono text-amber-400">Master Bambang S.</div>
                </div>
              </div>
            </div>

          </div>

          {/* Print Instructions Footer */}
          <div className="text-center pt-4 border-t border-slate-300 text-[9px] text-slate-600">
            <p>Petunjuk: Potong mengikuti garis luar kartu dan rekatkan sisi Depan & Belakang atau masukkan ke dalam Card Holder ID Card standard (CR-80).</p>
          </div>

        </div>
      </div>

      {/* Modal QR Scanner Simulator */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in no-print">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            
            <h3 className="font-heading font-bold text-lg text-white">
              Hasil Verifikasi QR Code
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">NIS:</span>
                <span className="font-mono font-bold text-amber-400">{targetUser.nis}</span>
              </div>
              {targetUser.nik && (
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">NIK:</span>
                  <span className="font-mono text-slate-200">{targetUser.nik}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Nama:</span>
                <span className="font-bold text-white">{targetUser.nama}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Sabuk:</span>
                <span className="font-semibold text-emerald-400">{targetUser.tingkatSabuk}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Ranting:</span>
                <span className="text-slate-200">{targetUser.ranting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Keanggotaan:</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TERVERIFIKASI RESMI
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Tutup Scanner
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

