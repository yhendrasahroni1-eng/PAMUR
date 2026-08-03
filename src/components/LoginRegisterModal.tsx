import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, MapPin, Calendar, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, Camera, Upload, KeyRound, HelpCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TingkatSabuk, User as UserType } from '../types';

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess: () => void;
}

export const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { users, login, registerSiswa, updateUser, generateWhatsAppUrl } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Login form state
  const [loginRole, setLoginRole] = useState<'siswa' | 'admin'>('siswa');
  const [emailOrNis, setEmailOrNis] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Forgot Password state
  const [forgotRole, setForgotRole] = useState<'siswa' | 'admin'>('siswa');
  const [forgotIdentity, setForgotIdentity] = useState(''); // Email, NIS, or NIK
  const [forgotVerificationKey, setForgotVerificationKey] = useState(''); // NIK or No WA
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotFoundUser, setForgotFoundUser] = useState<UserType | null>(null);
  const [newForgotPwd, setNewForgotPwd] = useState('');
  const [confirmForgotPwd, setConfirmForgotPwd] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNoWa, setRegNoWa] = useState('');
  const [regTempatLahir, setRegTempatLahir] = useState('Pamekasan');
  const [regTanggalLahir, setRegTanggalLahir] = useState('2005-08-17');
  const [regJenisKelamin, setRegJenisKelamin] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [regRanting, setRegRanting] = useState('Ranting Pamekasan Pusat');
  const [regTingkatSabuk, setRegTingkatSabuk] = useState<TingkatSabuk>('Dasar');
  const [regAlamat, setRegAlamat] = useState('');
  const [regFotoUrl, setRegFotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [registeredSuccessUser, setRegisteredSuccessUser] = useState<any>(null);

  const sabukOptions: TingkatSabuk[] = [
    'Dasar',
    'Putih',
    'Kuning',
    'Merah',
    'Hijau',
    'Biru',
    'Hitam'
  ];
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRegFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!emailOrNis.trim()) {
      setLoginError('Silakan masukkan Email, NIS, atau NIK.');
      return;
    }

    const res = login(emailOrNis, loginRole, password);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setLoginError(res.message || `Akun tidak ditemukan untuk role ${loginRole.toUpperCase()}.`);
    }
  };

  const handleDemoLogin = (email: string, role: 'siswa' | 'admin') => {
    const res = login(email, role);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setLoginError(res.message || 'Gagal login demo.');
    }
  };

  const handleForgotSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const query = forgotIdentity.toLowerCase().trim();
    const vKey = forgotVerificationKey.toLowerCase().trim();

    if (!query) {
      setForgotError('Masukkan Email, NIS, atau NIK akun Anda.');
      return;
    }

    // Search user in AppContext
    const found = users.find(u => {
      if (u.role !== forgotRole) return false;
      
      const matchIdentity = 
        u.email.toLowerCase() === query ||
        u.nis.toLowerCase() === query ||
        (u.nik && u.nik.toLowerCase() === query);

      if (!matchIdentity) return false;

      // Verification key check (if provided for siswa)
      if (forgotRole === 'siswa' && vKey) {
        const matchVerif = 
          (u.nik && u.nik.toLowerCase() === vKey) ||
          u.noWa.toLowerCase().includes(vKey) ||
          u.email.toLowerCase() === vKey ||
          u.nis.toLowerCase() === vKey;
        return matchVerif;
      }

      return true;
    });

    if (found) {
      setForgotFoundUser(found);
      setForgotStep(2);
    } else {
      setForgotError(
        `Akun ${forgotRole === 'siswa' ? 'Siswa' : 'Admin'} tidak ditemukan atau verification key tidak cocok. Pastikan Email / NIS / NIK sudah tepat.`
      );
    }
  };

  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotFoundUser) return;

    if (newForgotPwd.length < 4) {
      setForgotError('Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (newForgotPwd !== confirmForgotPwd) {
      setForgotError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    updateUser(forgotFoundUser.id, { password: newForgotPwd });
    setForgotStep(3);
    setForgotSuccess(`Kata sandi akun ${forgotFoundUser.nama} berhasil diperbarui!`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama.trim() || !regEmail.trim() || !regPassword.trim()) {
      alert('Mohon lengkapi Nama, Email, dan Kata Sandi!');
      return;
    }

    const createdUser = registerSiswa({
      nama: regNama,
      nik: regNik,
      email: regEmail,
      password: regPassword,
      noWa: regNoWa || '6281234567890',
      tempatLahir: regTempatLahir,
      tanggalLahir: regTanggalLahir,
      jenisKelamin: regJenisKelamin,
      ranting: regRanting || 'Ranting Pusat',
      tingkatSabuk: regTingkatSabuk,
      alamat: regAlamat || 'Alamat Belum Diisi',
      fotoUrl: regFotoUrl
    });

    setRegisteredSuccessUser(createdUser);
  };

  const rantingOptions = [
    'Ranting Pamekasan Pusat',
    'Ranting Surabaya Cab. Gubeng',
    'Ranting Malang Kota',
    'Ranting Jakarta Selatan',
    'Ranting Sampang Cab. Kota',
    'Ranting Sumenep Kota'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
        
        {/* Header Modal */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-heading font-extrabold text-lg flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Portal Keanggotaan PAMUR</span>
            </h3>
            <p className="text-xs text-slate-300">Perguruan Seni Bela Diri Pencak Silat Indonesia</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Registration Screen */}
        {registeredSuccessUser ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-heading font-bold text-xl text-slate-900">
              Pendaftaran Siswa Berhasil!
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Selamat datang di PAMUR, <strong className="text-indigo-700">{registeredSuccessUser.nama}</strong>! ID Anggota sementara Anda adalah <span className="font-mono bg-amber-100 px-2 py-1 rounded text-slate-900 font-bold">{registeredSuccessUser.nis}</span>.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Status Akun & Langkah Verifikasi:</span>
              </div>
              <ul className="list-disc pl-5 text-amber-900 space-y-1 text-[11px]">
                <li><strong>NIS Anda:</strong> <span className="font-mono font-bold bg-amber-200 px-1.5 py-0.5 rounded text-amber-950">{registeredSuccessUser.nis}</span></li>
                <li>Akun Anda saat ini <strong>Menunggu Verifikasi Admin</strong>. Setelah diverifikasi oleh Admin PAMUR, Anda dapat login menggunakan Email / NIS / NIK dan Kata Sandi yang telah Anda buat.</li>
                <li>Silakan hubungi Admin via WhatsApp untuk mempercepat proses verifikasi keanggotaan.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={generateWhatsAppUrl(
                  `Halo Admin PAMUR, saya siswa baru nama ${registeredSuccessUser.nama} (NIK: ${registeredSuccessUser.nik || '-'}) dengan NIS ${registeredSuccessUser.nis} (Ranting: ${registeredSuccessUser.ranting}) memohon verifikasi akun siswa.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>Konfirmasi Verifikasi via WA</span>
              </a>
              <button
                onClick={() => {
                  setRegisteredSuccessUser(null);
                  setMode('login');
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                Kembali ke Form Login
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold gap-1">
              <button
                onClick={() => { setMode('login'); setLoginError(''); }}
                className={`py-2 rounded-xl transition ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => { setMode('register'); setLoginError(''); }}
                className={`py-2 rounded-xl transition ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Baru
              </button>
              <button
                onClick={() => { 
                  setMode('forgot'); 
                  setForgotRole(loginRole);
                  setForgotIdentity(emailOrNis);
                  setForgotStep(1);
                  setForgotError(''); 
                  setForgotSuccess(''); 
                }}
                className={`py-2 rounded-xl transition ${
                  mode === 'forgot'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lupa Sandi
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Role Akses:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLoginRole('siswa')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                          loginRole === 'siswa'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Siswa / Anggota</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginRole('admin')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                          loginRole === 'admin'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>Admin / Pengurus</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Email/NIS */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {loginRole === 'siswa' ? 'Email atau NIS Siswa:' : 'Email Administrator:'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={emailOrNis}
                        onChange={(e) => setEmailOrNis(e.target.value)}
                        placeholder={loginRole === 'siswa' ? 'Email, NIS, atau NIK Anda' : 'yhendrasahroni1@gmail.com'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Input Password & Forgot Link */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Kata Sandi:</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotRole(loginRole);
                          setForgotIdentity(emailOrNis);
                          setForgotStep(1);
                          setForgotError('');
                          setForgotSuccess('');
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/20 transition"
                  >
                    Masuk Sekarang
                  </button>

                  {/* Note Login info */}
                  <div className="pt-2 text-[11px] text-slate-500 text-center">
                    Gunakan email dan kata sandi terdaftar untuk masuk.
                  </div>

                </form>
              ) : mode === 'forgot' ? (
                /* Forgot Password Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-3 rounded-2xl text-xs">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>Pemulihan & Reset Kata Sandi</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px] font-bold bg-white px-2 py-1 rounded-lg border border-slate-200"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali Login</span>
                    </button>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Role Akun yang Ingin Direset:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setForgotRole('siswa'); setForgotFoundUser(null); setForgotStep(1); setForgotError(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                          forgotRole === 'siswa'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Siswa / Anggota</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setForgotRole('admin'); setForgotFoundUser(null); setForgotStep(1); setForgotError(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                          forgotRole === 'admin'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>Admin / Pengurus</span>
                      </button>
                    </div>
                  </div>

                  {forgotError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-start gap-2 font-bold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{forgotSuccess}</span>
                    </div>
                  )}

                  {forgotStep === 1 && (
                    <form onSubmit={handleForgotSearch} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {forgotRole === 'siswa' ? 'Email / NIS / NIK Siswa:' : 'Email Administrator:'}
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={forgotIdentity}
                            onChange={(e) => setForgotIdentity(e.target.value)}
                            placeholder={forgotRole === 'siswa' ? 'misal: faiz.pamur@gmail.com / PMR-2024-088' : 'admin@pamur.org'}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {forgotRole === 'siswa' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Verifikasi Tambahan (NIK atau No. WA / Email / NIS):
                          </label>
                          <div className="relative">
                            <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={forgotVerificationKey}
                              onChange={(e) => setForgotVerificationKey(e.target.value)}
                              placeholder="Ketik NIK 16-digit atau No WA untuk konfirmasi identitas"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Opsional: Untuk keamanan tambahan guna memastikan identitas Anda.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Verifikasi & Cari Akun Saya</span>
                      </button>

                      {/* WhatsApp Reset Backup */}
                      <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                        <p className="text-[11px] text-slate-500">Kesulitan mengingat data? Hubungi Admin secara langsung:</p>
                        <a
                          href={generateWhatsAppUrl(
                            `Halo Admin PAMUR, saya ${forgotRole === 'siswa' ? 'Siswa' : 'Admin'} (${forgotIdentity || 'Identitas Belum Diisi'}) mengalami lupa kata sandi akun saya. Mohon bantuan reset kata sandi.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                        >
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <span>Hubungi Admin via WA untuk Reset Password</span>
                        </a>
                      </div>
                    </form>
                  )}

                  {forgotStep === 2 && forgotFoundUser && (
                    <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs space-y-1">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Akun Ditemukan & Terverifikasi!</span>
                        </div>
                        <p className="text-slate-700 text-[11px]">
                          Nama: <strong>{forgotFoundUser.nama}</strong> | Role: <span className="uppercase font-bold text-indigo-700">{forgotFoundUser.role}</span>
                          {forgotFoundUser.nis && <span> | NIS: {forgotFoundUser.nis}</span>}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru:</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            minLength={4}
                            value={newForgotPwd}
                            onChange={(e) => setNewForgotPwd(e.target.value)}
                            placeholder="Minimal 4 karakter"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru:</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            minLength={4}
                            value={confirmForgotPwd}
                            onChange={(e) => setConfirmForgotPwd(e.target.value)}
                            placeholder="Ulangi kata sandi baru"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan Kata Sandi Baru</span>
                      </button>
                    </form>
                  )}

                  {forgotStep === 3 && (
                    <div className="text-center space-y-4 py-3">
                      <div className="w-12 h-12 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        Kata sandi untuk akun <strong>{forgotFoundUser?.nama}</strong> berhasil diperbarui! Silakan gunakan kata sandi baru ini untuk masuk ke portal keanggotaan.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setLoginRole(forgotFoundUser?.role || 'siswa');
                          setEmailOrNis(forgotFoundUser?.email || forgotFoundUser?.nis || '');
                          setPassword('');
                          setForgotStep(1);
                          setForgotFoundUser(null);
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                      >
                        Masuk Sekarang
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      required
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      placeholder="misal: Moh. Rizky Pratama"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan) *</label>
                      <input
                        type="text"
                        required
                        value={regNik}
                        onChange={(e) => setRegNik(e.target.value)}
                        placeholder="16-digit NIK (misal: 3528...)"
                        maxLength={16}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Untuk Login) *</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Buat kata sandi akun"
                        minLength={4}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="rizky@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">No WhatsApp (HP) *</label>
                      <input
                        type="tel"
                        required
                        value={regNoWa}
                        onChange={(e) => setRegNoWa(e.target.value)}
                        placeholder="628123456789"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={regTempatLahir}
                        onChange={(e) => setRegTempatLahir(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={regTanggalLahir}
                        onChange={(e) => setRegTanggalLahir(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select
                        value={regJenisKelamin}
                        onChange={(e: any) => setRegJenisKelamin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Laki-Laki">Laki-Laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ranting / Cabang (Ketik Manual)</label>
                      <input
                        type="text"
                        required
                        value={regRanting}
                        onChange={(e) => setRegRanting(e.target.value)}
                        placeholder="Ketik Ranting / Cabang (misal: Ranting Pamekasan Kota)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Sabuk Saat Ini</label>
                    <select
                      value={regTingkatSabuk}
                      onChange={(e: any) => setRegTingkatSabuk(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {sabukOptions.map(s => (
                        <option key={s} value={s}>Sabuk {s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Rumah</label>
                    <input
                      type="text"
                      value={regAlamat}
                      onChange={(e) => setRegAlamat(e.target.value)}
                      placeholder="misal: Jl. Kabupaten No. 45, Pamekasan"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Profile Photo Upload Section */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Upload Foto Profil / Pasfoto Silat:
                    </label>
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-300 shrink-0 bg-slate-200">
                        {regFotoUrl ? (
                          <img src={regFotoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/60 flex items-center justify-center cursor-pointer text-white transition">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex-1 text-xs">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition shadow-sm mb-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih File Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Format JPG, PNG atau WEBP (Maksimal 5MB).
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition mt-2"
                  >
                    Daftar Sekarang & Buat ID Card
                  </button>

                </form>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
