import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Shield, 
  PhoneCall, 
  FileText, 
  Sparkles,
  Save,
  Award,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  Camera,
  Check,
  User as UserIcon,
  AlertCircle,
  Building,
  RotateCcw,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { User, TingkatSabuk } from '../../types';

export const AdminSiswaManager: React.FC = () => {
  const { users, verifyUser, deleteUser, updateUser, registerSiswa, importUsersBatch, generateWhatsAppUrl } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRanting, setFilterRanting] = useState<string>('Semua');
  const [filterSabuk, setFilterSabuk] = useState<string>('Semua');
  const [filterRole, setFilterRole] = useState<string>('Semua');
  const [filterVerification, setFilterVerification] = useState<string>('Semua');

  // Dynamic rantings list based on initial list + registered users
  const availableRantings = Array.from(
    new Set([
      'Ranting Pamekasan Pusat',
      'Ranting Surabaya Cab. Gubeng',
      'Ranting Malang Kota',
      'Ranting Jakarta Selatan',
      'Ranting Sampang Cab. Kota',
      'Ranting Sumenep Kota',
      ...users.map(u => u.ranting).filter(Boolean)
    ])
  ).sort();

  // Modal edit student (full fields)
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [newPrestasiText, setNewPrestasiText] = useState('');
  
  // Modal add student
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newEmail, setNewEmail] = useState('');
  const [newNoWa, setNewNoWa] = useState('');
  const [newRanting, setNewRanting] = useState('Ranting Pamekasan Pusat');
  const [newSabuk, setNewSabuk] = useState<TingkatSabuk>('Dasar');
  const [newTempatLahir, setNewTempatLahir] = useState('Pamekasan');
  const [newTanggalLahir, setNewTanggalLahir] = useState('2006-01-01');
  const [newJenisKelamin, setNewJenisKelamin] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [newAlamat, setNewAlamat] = useState('');
  const [newFotoUrl, setNewFotoUrl] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400');

  // Modal import Excel
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [parsedExcelUsers, setParsedExcelUsers] = useState<User[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelError, setExcelError] = useState('');
  const [importNotice, setImportNotice] = useState('');

  const sabukList: TingkatSabuk[] = [
    'Dasar',
    'Putih',
    'Kuning',
    'Merah',
    'Hijau',
    'Biru',
    'Hitam'
  ];

  const getSabukBadgeClass = (sabuk: string) => {
    switch (sabuk) {
      case 'Putih':
        return 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold';
      case 'Kuning':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
      case 'Hijau':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';
      case 'Biru':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold';
      case 'Merah':
        return 'bg-red-100 text-red-900 border-red-300 font-extrabold';
      case 'Hitam':
        return 'bg-slate-900 text-amber-300 border-slate-800 font-black';
      case 'Dasar':
      default:
        return 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
    }
  };

  const handleQuickChangeBelt = (userId: string, newBelt: TingkatSabuk) => {
    updateUser(userId, { tingkatSabuk: newBelt });
  };

  const rantingOptions = [
    'Ranting Pamekasan Pusat',
    'Ranting Surabaya Cab. Gubeng',
    'Ranting Malang Kota',
    'Ranting Jakarta Selatan',
    'Ranting Sampang Cab. Kota',
    'Ranting Sumenep Kota'
  ];

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchRole = filterRole === 'Semua' || u.role === filterRole;
    const matchQuery = 
      !q ||
      u.nama.toLowerCase().includes(q) ||
      u.nis.toLowerCase().includes(q) ||
      (u.nik && u.nik.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.ranting.toLowerCase().includes(q) ||
      u.tingkatSabuk.toLowerCase().includes(q);
    
    const matchRanting = filterRanting === 'Semua' || u.ranting === filterRanting;
    const matchSabuk = filterSabuk === 'Semua' || u.tingkatSabuk === filterSabuk;
    const matchVerif = 
      filterVerification === 'Semua' ? true :
      filterVerification === 'Aktif' ? u.terverifikasi :
      !u.terverifikasi;

    return matchRole && matchQuery && matchRanting && matchSabuk && matchVerif;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || filterRanting !== 'Semua' || filterSabuk !== 'Semua' || filterRole !== 'Semua' || filterVerification !== 'Semua';

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterRanting('Semua');
    setFilterSabuk('Semua');
    setFilterRole('Semua');
    setFilterVerification('Semua');
  };

  // Save full edits
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateUser(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  // Add achievement to student in edit modal
  const handleAddAchievement = () => {
    if (newPrestasiText.trim() && editingStudent) {
      const updatedList = [...(editingStudent.catatanPrestasi || []), newPrestasiText.trim()];
      setEditingStudent({ ...editingStudent, catatanPrestasi: updatedList });
      setNewPrestasiText('');
    }
  };

  // Remove achievement
  const handleRemoveAchievement = (index: number) => {
    if (editingStudent) {
      const updatedList = (editingStudent.catatanPrestasi || []).filter((_, i) => i !== index);
      setEditingStudent({ ...editingStudent, catatanPrestasi: updatedList });
    }
  };

  // Student Photo Upload in Edit Modal
  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingStudent) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditingStudent({ ...editingStudent, fotoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Student Photo Upload in Add Modal
  const handleAddPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newEmail.trim()) {
      alert('Isi Nama dan Email siswa!');
      return;
    }

    const created = registerSiswa({
      nama: newNama,
      nik: newNik,
      email: newEmail,
      password: newPassword || '123456',
      noWa: newNoWa || '6281234567890',
      tempatLahir: newTempatLahir || 'Pamekasan',
      tanggalLahir: newTanggalLahir || '2006-01-01',
      jenisKelamin: newJenisKelamin,
      ranting: newRanting || 'Ranting Pusat',
      tingkatSabuk: newSabuk,
      alamat: newAlamat || 'Alamat Belum Diisi',
      fotoUrl: newFotoUrl
    });

    // Automatically verify when added by Admin
    verifyUser(created.id, true);

    setShowAddModal(false);
    setNewNama('');
    setNewNik('');
    setNewEmail('');
    setNewPassword('123456');
    setNewNoWa('');
    setNewAlamat('');
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        'NIS': 'PMR-2026-101',
        'NIK': '3528011708040001',
        'Nama Lengkap': 'Ahmad Fauzi',
        'Email': 'fauzi@gmail.com',
        'Kata Sandi': '123456',
        'No WA': '6281234567890',
        'Ranting': 'Ranting Pamekasan Pusat',
        'Tingkat Sabuk': 'Dasar',
        'Tempat Lahir': 'Pamekasan',
        'Tanggal Lahir': '2006-08-17',
        'Jenis Kelamin': 'Laki-Laki',
        'Alamat': 'Jl. Kabupaten No. 12, Pamekasan'
      },
      {
        'NIS': 'PMR-2026-102',
        'NIK': '3578022011050002',
        'Nama Lengkap': 'Siti Nurhaliza',
        'Email': 'siti@gmail.com',
        'Kata Sandi': '123456',
        'No WA': '6281987654321',
        'Ranting': 'Ranting Surabaya Cab. Gubeng',
        'Tingkat Sabuk': 'Hijau',
        'Tempat Lahir': 'Surabaya',
        'Tanggal Lahir': '2005-11-20',
        'Jenis Kelamin': 'Perempuan',
        'Alamat': 'Jl. Pemuda No. 45, Surabaya'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');
    XLSX.writeFile(workbook, 'Template_Data_Siswa_PAMUR.xlsx');
  };

  // Read and parse Excel file
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setExcelError('');
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          setExcelError('File Excel tidak memiliki baris data!');
          setParsedExcelUsers([]);
          return;
        }

        const year = new Date().getFullYear();
        const parsed: User[] = jsonRows.map((row, idx) => {
          // Robust column extraction with fallback headers
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              const foundKey = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
              if (foundKey && String(row[foundKey]).trim()) {
                return String(row[foundKey]).trim();
              }
            }
            return '';
          };

          const nama = getVal(['Nama Lengkap', 'Nama', 'nama', 'Name']) || `Siswa Excel ${idx + 1}`;
          const nik = getVal(['NIK', 'nik', 'No KTP']) || `3528${Date.now()}${idx}`;
          const email = getVal(['Email', 'email', 'E-Mail']) || `siswa.${Date.now()}.${idx}@pamur.org`;
          const password = getVal(['Kata Sandi', 'Password', 'password']) || '123456';
          const noWa = getVal(['No WA', 'No HP', 'WhatsApp', 'Telepon', 'Phone', 'noWa']) || '6281234567890';
          const customNis = getVal(['NIS', 'Nis', 'ID Anggota']) || `PMR-${year}-${100 + idx}`;
          const ranting = getVal(['Ranting', 'Cabang', 'ranting']) || 'Ranting Pamekasan Pusat';
          const sabukRaw = getVal(['Tingkat Sabuk', 'Sabuk', 'tingkatSabuk']) || 'Dasar';
          const tempatLahir = getVal(['Tempat Lahir', 'tempatLahir']) || 'Pamekasan';
          const tanggalLahir = getVal(['Tanggal Lahir', 'tanggalLahir']) || '2005-01-01';
          const jenisKelaminRaw = getVal(['Jenis Kelamin', 'Gender', 'jenisKelamin']) || 'Laki-Laki';
          const alamat = getVal(['Alamat', 'alamat']) || 'Alamat Belum Diisi';

          // Match sabuk or use raw string
          const matchedSabuk = sabukList.find(s => s.toLowerCase() === sabukRaw.toLowerCase()) || sabukRaw || 'Dasar';
          const matchedGender: 'Laki-Laki' | 'Perempuan' = jenisKelaminRaw.toLowerCase().includes('p') ? 'Perempuan' : 'Laki-Laki';

          return {
            id: `usr-excel-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            nis: customNis,
            nik,
            nama,
            email,
            password,
            role: 'siswa',
            tingkatSabuk: matchedSabuk,
            ranting,
            tempatLahir,
            tanggalLahir,
            jenisKelamin: matchedGender,
            noWa,
            alamat,
            fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            tanggalBergabung: new Date().toISOString().split('T')[0],
            statusAktif: true,
            terverifikasi: true,
            presensiCount: 0,
            catatanPrestasi: []
          };
        });

        setParsedExcelUsers(parsed);
      } catch (err) {
        console.error(err);
        setExcelError('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv valid.');
        setParsedExcelUsers([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Submit batch import
  const handleConfirmExcelImport = () => {
    if (parsedExcelUsers.length === 0) return;
    importUsersBatch(parsedExcelUsers);
    setImportNotice(`Berhasil mengimpor ${parsedExcelUsers.length} data siswa dari file Excel!`);
    setShowExcelModal(false);
    setParsedExcelUsers([]);
    setExcelFileName('');
    setTimeout(() => setImportNotice(''), 4000);
  };

  // Export full/filtered student list to Excel file
  const handleExportToExcel = () => {
    const exportData = filteredUsers.map(u => ({
      'NIS': u.nis || '-',
      'NIK': u.nik || '-',
      'Nama Lengkap': u.nama || '-',
      'Tempat Lahir': u.tempatLahir || '-',
      'Tanggal Lahir': u.tanggalLahir || '-',
      'Jenis Kelamin': u.jenisKelamin || '-',
      'Email': u.email || '-',
      'No WA': u.noWa || '-',
      'Ranting / Cabang': u.ranting || '-',
      'Tingkat Sabuk': u.tingkatSabuk || '-',
      'Alamat': u.alamat || '-',
      'Tanggal Bergabung': u.tanggalBergabung || '-',
      'Status Verifikasi': u.terverifikasi ? 'Terverifikasi (Aktif)' : 'Pending Verifikasi',
      'Catatan Prestasi': (u.catatanPrestasi && u.catatanPrestasi.length > 0) ? u.catatanPrestasi.join('; ') : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa_PAMUR');
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Data_Siswa_PAMUR_${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Kelola Data Siswa & Anggota PAMUR ({users.filter(u => u.role === 'siswa').length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah, verifikasi, edit seluruh bidang data siswa, ekspor ke Excel, atau impor massal (.xlsx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel Button */}
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
            title="Download/Export daftar siswa yang tampil ke file Excel"
          >
            <Download className="w-4 h-4 text-blue-100" />
            <span>Export Excel ({filteredUsers.length})</span>
          </button>

          {/* Upload Excel Button */}
          <button
            onClick={() => setShowExcelModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Upload File Excel</span>
          </button>

          {/* Add Manual Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Manual</span>
          </button>
        </div>
      </div>

      {/* Success Import Notification */}
      {importNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter & Pencarian Siswa ({filteredUsers.length} dari {users.filter(u => u.role === 'siswa').length} siswa)</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-[11px] font-bold bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, NIS, NIK, Ranting..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-bold"
            >
              <option value="Semua">-- Semua Peran (Siswa & Admin) --</option>
              <option value="siswa">Siswa / Anggota</option>
              <option value="admin">Admin / Pengurus</option>
            </select>
          </div>

          {/* Ranting / Cabang Filter */}
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={filterRanting}
              onChange={(e) => setFilterRanting(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Semua">-- Semua Ranting --</option>
              {availableRantings.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Tingkat Sabuk Filter */}
          <div>
            <select
              value={filterSabuk}
              onChange={(e) => setFilterSabuk(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Semua">-- Semua Sabuk --</option>
              {sabukList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Semua">-- Status Verifikasi --</option>
              <option value="Aktif">Terverifikasi (Aktif)</option>
              <option value="Pending">Pending Verifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Anggota / Admin</th>
                <th className="p-4">NIS & Ranting</th>
                <th className="p-4">Tingkat Sabuk</th>
                <th className="p-4">Status & Kontak</th>
                <th className="p-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={siswa.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                          alt={siswa.nama}
                          className="w-10 h-10 rounded-full object-cover border border-indigo-200 shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{siswa.nama}</span>
                            {siswa.role === 'admin' && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-amber-300 border border-indigo-800 font-black text-[9px] uppercase tracking-wider">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{siswa.email}</div>
                          <div className="text-[10px] text-slate-400">{siswa.tempatLahir}, {siswa.tanggalLahir} ({siswa.jenisKelamin})</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono font-bold text-indigo-700">{siswa.nis}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{siswa.ranting}</div>
                    </td>

                    <td className="p-4">
                      <select
                        value={siswa.tingkatSabuk}
                        onChange={(e) => handleQuickChangeBelt(siswa.id, e.target.value as TingkatSabuk)}
                        className={`px-2.5 py-1 rounded-xl text-xs border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition ${getSabukBadgeClass(siswa.tingkatSabuk)}`}
                        title="Klik untuk mengubah tingkat sabuk siswa secara cepat"
                      >
                        {sabukList.map((s) => (
                          <option key={s} value={s} className="bg-white text-slate-900 font-bold">
                            Sabuk {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        {siswa.terverifikasi ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            TERVERIFIKASI
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-amber-600" />
                            PENDING
                          </span>
                        )}
                        <div className="text-[11px] font-mono text-slate-600">+{siswa.noWa}</div>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        
                        {/* Verify Toggle */}
                        <button
                          onClick={() => verifyUser(siswa.id, !siswa.terverifikasi)}
                          className={`p-1.5 rounded-lg border transition ${
                            siswa.terverifikasi 
                              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={siswa.terverifikasi ? 'Batalkan Verifikasi' : 'Setujui Verifikasi'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* WA Chat */}
                        <a
                          href={generateWhatsAppUrl(`Halo Siswa ${siswa.nama} (NIS: ${siswa.nis}), ada informasi dari Admin PAMUR.`, siswa.noWa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition"
                          title="Chat WhatsApp Siswa"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </a>

                        {/* Edit All Fields */}
                        <button
                          onClick={() => setEditingStudent({ ...siswa })}
                          className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition"
                          title="Edit Semua Data Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Student */}
                        <button
                          onClick={() => {
                            if (confirm(`Hapus akun siswa ${siswa.nama}?`)) {
                              deleteUser(siswa.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-800 max-h-[90vh] flex flex-col my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <span>Edit Lengkap Data Siswa</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah seluruh informasi profil, NIS, sabuk, foto, verifikasi, & catatan prestasi.
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              
              {/* Photo Upload & Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500 shrink-0 bg-slate-200 shadow-sm">
                  <img
                    src={editingStudent.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                    alt={editingStudent.nama}
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/60 flex items-center justify-center cursor-pointer text-white transition">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="font-bold text-slate-800">Foto Profil Pasfoto Silat</div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition inline-flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={editingStudent.fotoUrl}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fotoUrl: e.target.value })}
                    placeholder="Atau masukkan URL Foto (https://...)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Main Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Peran / Hak Akses *</label>
                  <select
                    value={editingStudent.role}
                    onChange={(e: any) => setEditingStudent({ ...editingStudent, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="siswa">Siswa / Anggota</option>
                    <option value="admin">Admin / Pengurus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Pengguna *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nama}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor Induk Siswa (NIS) *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nis}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-indigo-700 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email (untuk Login) *</label>
                  <input
                    type="email"
                    required
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kata Sandi Login *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.password || '123456'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor NIK KTP/KTA</label>
                  <input
                    type="text"
                    value={editingStudent.nik || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nik: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">No WhatsApp (628...)</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.noWa}
                    onChange={(e) => setEditingStudent({ ...editingStudent, noWa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tingkat Sabuk</label>
                  <select
                    value={editingStudent.tingkatSabuk}
                    onChange={(e: any) => setEditingStudent({ ...editingStudent, tingkatSabuk: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {sabukList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ranting / Cabang</label>
                  <input
                    type="text"
                    value={editingStudent.ranting}
                    onChange={(e) => setEditingStudent({ ...editingStudent, ranting: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={editingStudent.tempatLahir}
                    onChange={(e) => setEditingStudent({ ...editingStudent, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editingStudent.tanggalLahir}
                    onChange={(e) => setEditingStudent({ ...editingStudent, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jenis Kelamin</label>
                  <select
                    value={editingStudent.jenisKelamin}
                    onChange={(e: any) => setEditingStudent({ ...editingStudent, jenisKelamin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jumlah Sesi Presensi Kehadiran</label>
                  <input
                    type="number"
                    value={editingStudent.presensiCount || 0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, presensiCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alamat Rumah Lengkap</label>
                <textarea
                  rows={2}
                  value={editingStudent.alamat}
                  onChange={(e) => setEditingStudent({ ...editingStudent, alamat: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStudent.terverifikasi}
                    onChange={(e) => setEditingStudent({ ...editingStudent, terverifikasi: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-bold text-slate-800 text-xs">Status Terverifikasi (Resmi)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStudent.statusAktif}
                    onChange={(e) => setEditingStudent({ ...editingStudent, statusAktif: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800 text-xs">Status Akun Aktif</span>
                </label>
              </div>

              {/* Achievements Management */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Prestasi & Kejuaraan Siswa</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPrestasiText}
                    onChange={(e) => setNewPrestasiText(e.target.value)}
                    placeholder="Tambah kejuaraan (misal: Juara 1 Kejurda Jatim 2025)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(editingStudent.catatanPrestasi || []).map((p, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{p}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Data</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-800 max-h-[90vh] flex flex-col my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Impor Massal Data Siswa via Excel</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Upload file spreadsheet (.xlsx / .csv) untuk memasukkan banyak siswa sekaligus.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setParsedExcelUsers([]);
                  setExcelFileName('');
                  setExcelError('');
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              
              {/* Step 1: Download Format Excel */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="font-bold text-slate-900 text-sm">Belum punya format file Excel?</div>
                  <div className="text-[11px] text-slate-600">
                    Unduh file contoh template Excel resmi yang sudah disiapkan kolom-kolomnya.
                  </div>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template Excel</span>
                </button>
              </div>

              {/* Step 2: Upload Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                <div>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Excel (.xlsx / .csv)</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleExcelFileUpload}
                      className="hidden"
                    />
                  </label>
                  {excelFileName && (
                    <div className="text-xs font-mono font-bold text-emerald-800 mt-2">
                      File terpilih: {excelFileName}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Kolom otomatis terdeteksi: Nama Lengkap, Email, No WA, NIS, Ranting, Tingkat Sabuk, Tanggal Lahir, Jenis Kelamin, Alamat.
                </p>
              </div>

              {excelError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{excelError}</span>
                </div>
              )}

              {/* Step 3: Preview Table */}
              {parsedExcelUsers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">
                      Pratinjau Hasil Pembacaan ({parsedExcelUsers.length} Siswa Ditemukan):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Siap Diimpor
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-[11px] text-slate-700">
                      <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-2">No</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">NIS</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">No WA</th>
                          <th className="p-2">Ranting</th>
                          <th className="p-2">Sabuk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedExcelUsers.map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{u.nama}</td>
                            <td className="p-2 font-mono text-indigo-700 font-bold">{u.nis}</td>
                            <td className="p-2 text-slate-500">{u.email}</td>
                            <td className="p-2 font-mono">{u.noWa}</td>
                            <td className="p-2">{u.ranting}</td>
                            <td className="p-2">{u.tingkatSabuk}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowExcelModal(false);
                  setParsedExcelUsers([]);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={parsedExcelUsers.length === 0}
                onClick={handleConfirmExcelImport}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>Proses Impor {parsedExcelUsers.length} Data Siswa</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add New Student Modal (Manual) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-800 my-auto max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Tambah Siswa PAMUR Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStudent} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              
              {/* Photo Upload */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-400 shrink-0 bg-slate-200">
                  <img src={newFotoUrl} alt="Foto Baru" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/60 flex items-center justify-center cursor-pointer text-white">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleAddPhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex-1 text-xs">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition shadow-sm mb-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Siswa</span>
                    <input type="file" accept="image/*" onChange={handleAddPhotoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-500">Pilih file pasfoto dari perangkat</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="misal: Moh. Rizky Pratama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIK (KTP/KK) *</label>
                  <input
                    type="text"
                    value={newNik}
                    onChange={(e) => setNewNik(e.target.value)}
                    placeholder="3528xxxxxxxxxxxx"
                    maxLength={16}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kata Sandi Login *</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No WA *</label>
                  <input
                    type="text"
                    required
                    value={newNoWa}
                    onChange={(e) => setNewNoWa(e.target.value)}
                    placeholder="62812345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={newTempatLahir}
                    onChange={(e) => setNewTempatLahir(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={newTanggalLahir}
                    onChange={(e) => setNewTanggalLahir(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={newJenisKelamin}
                    onChange={(e: any) => setNewJenisKelamin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tingkat Sabuk</label>
                  <select
                    value={newSabuk}
                    onChange={(e: any) => setNewSabuk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {sabukList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ranting / Cabang (Ketik Manual)</label>
                <input
                  type="text"
                  required
                  value={newRanting}
                  onChange={(e) => setNewRanting(e.target.value)}
                  placeholder="Ketik Ranting / Cabang (misal: Ranting Pamekasan Kota)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Rumah</label>
                <input
                  type="text"
                  value={newAlamat}
                  onChange={(e) => setNewAlamat(e.target.value)}
                  placeholder="Jl. Trunojoyo No. 45"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah & Terbitkan NIS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
