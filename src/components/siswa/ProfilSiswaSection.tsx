import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Edit3, 
  Check, 
  Save, 
  Plus, 
  Trash2,
  Sparkles,
  Camera,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfilSiswaSection: React.FC = () => {
  const { currentUser, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [nama, setNama] = useState(currentUser?.nama || '');
  const [nik, setNik] = useState(currentUser?.nik || '');
  const [noWa, setNoWa] = useState(currentUser?.noWa || '');
  const [ranting, setRanting] = useState(currentUser?.ranting || '');
  const [alamat, setAlamat] = useState(currentUser?.alamat || '');
  const [fotoUrl, setFotoUrl] = useState(currentUser?.fotoUrl || '');
  const [newPrestasi, setNewPrestasi] = useState('');
  const [prestasiList, setPrestasiList] = useState<string[]>(currentUser?.catatanPrestasi || []);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
        <p className="text-sm">Silakan masuk akun siswa untuk melihat dan mengedit profil Anda.</p>
      </div>
    );
  }

  const handleAddPrestasi = () => {
    if (newPrestasi.trim()) {
      setPrestasiList(prev => [...prev, newPrestasi.trim()]);
      setNewPrestasi('');
    }
  };

  const handleRemovePrestasi = (index: number) => {
    setPrestasiList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      nama,
      nik,
      noWa,
      ranting,
      alamat,
      fotoUrl,
      catatanPrestasi: prestasiList
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    const actualOldPassword = currentUser.password || '123456';
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

    updateUser(currentUser.id, { password: newPassword });
    setPwdSuccess('Kata sandi akun siswa Anda berhasil diperbarui!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Profile Card */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 overflow-hidden text-white shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          
          {/* Avatar */}
          <div className="relative group shrink-0">
            <img
              src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
              alt={currentUser.nama}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-xl font-bold shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="font-heading font-black text-2xl text-white">
                {currentUser.nama}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider inline-block shadow">
                NIS: {currentUser.nis}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold text-[10px] uppercase tracking-wider inline-block shadow">
                NIK: {currentUser.nik || '-'}
              </span>
            </div>

            <p className="text-amber-300 font-bold text-sm flex items-center justify-center md:justify-start gap-1">
              <span>{currentUser.tingkatSabuk}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{currentUser.ranting}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Bergabung: {currentUser.tanggalBergabung}</span>
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Presensi: {currentUser.presensiCount || 0} Sesi</span>
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
            >
              <Edit3 className="w-4 h-4 text-amber-300" />
              <span>{isEditing ? 'Batal Edit' : 'Edit Profil'}</span>
            </button>
          </div>

        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Profil berhasil diperbarui dan tersimpan!</span>
        </div>
      )}

      {/* Profile Details or Edit Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-slate-800">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-heading font-bold text-base text-indigo-900 border-b border-slate-100 pb-2">
              Formulir Edit Data Siswa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="16-digit NIK dari KTP/KK"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No WhatsApp</label>
                <input
                  type="text"
                  value={noWa}
                  onChange={(e) => setNoWa(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ranting / Cabang</label>
                <input
                  type="text"
                  value={ranting}
                  onChange={(e) => setRanting(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Foto Profil</label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Achievements Editor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Prestasi & Kejuaraan</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPrestasi}
                  onChange={(e) => setNewPrestasi(e.target.value)}
                  placeholder="Tambah prestasi baru (misal: Juara 1 O2SN Silat 2025)"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddPrestasi}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {prestasiList.map((p, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                    <span>• {p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrestasi(idx)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>

          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Left Box: Biodata */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-indigo-900 border-b border-slate-100 pb-2">
                Biodata Keanggotaan
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Nomor Induk Siswa (NIS):</span>
                  <span className="font-mono font-bold text-indigo-700">{currentUser.nis}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">NIK (KTP/KK):</span>
                  <span className="font-mono font-bold text-slate-800">{currentUser.nik || '-'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{currentUser.email}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">No WhatsApp:</span>
                  <span className="font-semibold text-slate-800">+{currentUser.noWa}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Tempat, Tgl Lahir:</span>
                  <span className="text-slate-800">{currentUser.tempatLahir}, {currentUser.tanggalLahir}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Jenis Kelamin:</span>
                  <span className="text-slate-800">{currentUser.jenisKelamin}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Alamat Rumah:</span>
                  <span className="text-slate-800 text-right">{currentUser.alamat}</span>
                </div>
              </div>
            </div>

            {/* Right Box: Achievements */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-indigo-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Catatan Prestasi & Kejuaraan</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>

              {(!currentUser.catatanPrestasi || currentUser.catatanPrestasi.length === 0) ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  Belum ada catatan prestasi yang diinput. Klik "Edit Profil" untuk menambahkan prestasi Anda!
                </div>
              ) : (
                <div className="space-y-2">
                  {currentUser.catatanPrestasi.map((p, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 flex items-start gap-2.5 shadow-sm"
                    >
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Password Change Card for Siswa */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-xs text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-sm">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <span>Keamanan Akun - Ubah Kata Sandi Saya</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            {showPasswordSection ? 'Sembunyikan Form' : 'Ubah Kata Sandi'}
          </button>
        </div>

        {showPasswordSection && (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Pastikan Anda menggunakan kata sandi yang kuat dan mudah diingat agar akun siswa PAMUR Anda tetap aman.
            </p>

            {pwdError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-xl">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <span>Simpan Kata Sandi Baru</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};
