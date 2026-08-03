import React, { useState } from 'react';
import { Settings, PhoneCall, Save, CheckCircle2, RotateCcw, Volume2, Shield, Lock, Eye, EyeOff, KeyRound, AlertCircle, Upload, Image as ImageIcon, X, Layout, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettingsManager: React.FC = () => {
  const { currentUser, appSettings, updateAppSettings, updateUser, resetToDefaultData } = useApp();

  const [noWaAdmin, setNoWaAdmin] = useState(appSettings.noWaAdmin);
  const [emailAdmin, setEmailAdmin] = useState(appSettings.emailAdmin);
  const [namaOrganisasi, setNamaOrganisasi] = useState(appSettings.namaOrganisasi);
  const [slogan, setSlogan] = useState(appSettings.slogan);
  const [alamatPusat, setAlamatPusat] = useState(appSettings.alamatPusat);
  const [runningAnnouncement, setRunningAnnouncement] = useState(appSettings.runningAnnouncement);
  const [logoUrl, setLogoUrl] = useState(appSettings.logoUrl || '');
  const [hideHeaderBanner, setHideHeaderBanner] = useState(appSettings.hideHeaderBanner || false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preset Logos for quick selection
  const presetLogos = [
    {
      label: 'Badge Lambang Emas PAMUR',
      url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=200'
    },
    {
      label: 'Logo Perguruan Pencak Silat',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200'
    }
  ];

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings({
      noWaAdmin,
      emailAdmin,
      namaOrganisasi,
      slogan,
      alamatPusat,
      runningAnnouncement,
      logoUrl,
      hideHeaderBanner
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Admin Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentUser) {
      setPwdError('Sesi admin tidak ditemukan.');
      return;
    }

    const actualOldPassword = currentUser.password || 'admin';
    if (oldPassword !== actualOldPassword) {
      setPwdError('Kata sandi lama yang Anda masukkan tidak cocok!');
      return;
    }

    if (newPassword.length < 4) {
      setPwdError('Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }

    // Update password
    updateUser(currentUser.id, { password: newPassword });
    setPwdSuccess('Kata sandi admin berhasil diperbarui! Gunakan password baru ini untuk login berikutnya.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <h2 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Pengaturan Perguruan & Kontak WhatsApp Admin</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ubah nomor WhatsApp resmi admin, pengumuman running text, dan nama organisasi.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Pengaturan berhasil diperbarui dan langsung aktif di seluruh aplikasi!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm text-xs text-slate-800">
        
        {/* WhatsApp Admin Section */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
            <PhoneCall className="w-5 h-5 text-emerald-600" />
            <span>Integrasi Nomor WhatsApp Resmi Admin</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Nomor ini akan digunakan di seluruh tombol "Hubungi Admin via WhatsApp", pendaftaran ID Card, dan konfirmasi jadwal latihan. Gunakan format angka dengan kode negara (misal: <strong className="text-emerald-700">6281234567890</strong>).
          </p>

          <div className="pt-1">
            <label className="block text-slate-700 font-bold mb-1">Nomor WA Admin (Aktif):</label>
            <input
              type="text"
              required
              value={noWaAdmin}
              onChange={(e) => setNoWaAdmin(e.target.value)}
              placeholder="6281234567890"
              className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-emerald-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Custom Logo & Header Configuration */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-950 font-extrabold text-sm">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <span>Logo Organisasi Perguruan & Mode Header</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-200 text-indigo-900 font-bold text-[10px] uppercase">
              Kustomisasi Tampilan
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Admin dapat memasang logo resmi perguruan dan mengatur apakah logo ditampilkan secara bersih (clean) tanpa header banner running text di bagian atas aplikasi.
          </p>

          {/* Logo Input & File Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Upload atau URL Logo Perguruan:</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... atau upload file di bawah"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Logo (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-2.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hapus Logo</span>
                    </button>
                  )}
                </div>

                {/* Preset Logos */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Preset Sampel Logo:</span>
                  <div className="flex flex-wrap gap-2">
                    {presetLogos.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLogoUrl(preset.url)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 border border-slate-200 text-[11px] font-bold text-indigo-900 flex items-center gap-1.5 transition"
                      >
                        <img src={preset.url} alt="" className="w-3.5 h-3.5 object-cover rounded" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-500">Pratinjau Tampilan Logo di Navbar:</span>
              <div className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl w-full justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Preview Logo"
                    className="h-10 w-auto max-w-[100px] object-contain drop-shadow"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-slate-900">
                    <Shield className="w-6 h-6" />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-white font-black text-sm">{namaOrganisasi || 'PAMUR'}</div>
                  <div className="text-amber-400 text-[10px]">Pencak Silat Indonesia 1951</div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Header Banner / Tanpa Header */}
          <div className="pt-3 border-t border-indigo-200/60">
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideHeaderBanner}
                onChange={(e) => setHideHeaderBanner(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <div>
                <span className="font-bold text-indigo-950 text-xs block">
                  Pasang Logo Saja Tanpa Header Banner (Mode Logo Clean)
                </span>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  Sembunyikan bilah pengumuman running text paling atas sehingga navbar utama langsung tampil bersih dengan logo resmi di bagian teratas.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Announcement Section */}
        <div className="space-y-2">
          <label className="block text-slate-800 font-bold flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Pengumuman Running Text (Header Banner):</span>
          </label>
          <textarea
            rows={2}
            value={runningAnnouncement}
            onChange={(e) => setRunningAnnouncement(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 resize-none font-medium"
          />
        </div>

        {/* Organization Name & Slogan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nama Organisasi Perguruan</label>
            <input
              type="text"
              required
              value={namaOrganisasi}
              onChange={(e) => setNamaOrganisasi(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Resmi Admin</label>
            <input
              type="email"
              required
              value={emailAdmin}
              onChange={(e) => setEmailAdmin(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Slogan / Motto PAMUR</label>
          <input
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Alamat Padepokan Pusat</label>
          <textarea
            rows={2}
            value={alamatPusat}
            onChange={(e) => setAlamatPusat(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Atur ulang seluruh data ke sampel bawaan (Reset LocalStorage)?')) {
                resetToDefaultData();
                alert('Data demo berhasil di-reset!');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset Data Demo Bawaan</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>

      </form>

      {/* Admin Password Change Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm text-xs text-slate-800">
        <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-sm border-b border-slate-100 pb-3">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          <span>Keamanan Akun Admin - Ubah Kata Sandi (Password)</span>
        </div>
        
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Gunakan formulir di bawah ini untuk mengganti kata sandi akun Admin PAMUR ({currentUser?.nama || 'Administrator'}). Pastikan kata sandi baru mudah Anda ingat dan tidak diberikan kepada pihak yang tidak berkepentingan.
        </p>

        {pwdError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Kata Sandi Saat Ini (Lama)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 4 karakter"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <KeyRound className="w-4 h-4" />
              <span>Perbarui Kata Sandi Admin</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
