export type Role = 'siswa' | 'admin';

export type TingkatSabuk = 
  | 'Dasar'
  | 'Putih' 
  | 'Kuning'
  | 'Merah'
  | 'Hijau' 
  | 'Biru' 
  | 'Hitam'
  | string;

export interface User {
  id: string;
  nis: string;
  nik?: string;
  nama: string;
  email: string;
  password?: string;
  role: Role;
  tingkatSabuk: TingkatSabuk;
  ranting: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'Laki-Laki' | 'Perempuan';
  noWa: string;
  alamat: string;
  fotoUrl: string;
  tanggalBergabung: string;
  statusAktif: boolean;
  terverifikasi: boolean;
  presensiCount: number;
  catatanPrestasi?: string[];
}

export type KategoriArtikel = 
  | 'Sejarah & Filsafat' 
  | 'Jurus & Teknik' 
  | 'Kejuaraan & Prestasi' 
  | 'Pengumuman' 
  | 'Tips Kesehatan';

export interface Article {
  id: string;
  judul: string;
  slug: string;
  kategori: KategoriArtikel;
  ringkasan: string;
  konten: string;
  penulis: string;
  tanggal: string;
  gambarUrl: string;
  dibaca: number;
  featured?: boolean;
}

export interface Schedule {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  jamMulai: string;
  jamSelesai: string;
  ranting: string;
  lokasi: string;
  pelatih: string;
  kontakPelatihWa: string;
  materi: string;
  tipeLatihan: 'Reguler' | 'Tanding / TC' | 'Seni / Jurus Paket' | 'Ujian Kenaikan Sabuk';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  scheduleId: string;
  tanggal: string;
  status: 'Hadir' | 'Izin' | 'Sakit';
  catatan?: string;
}

export interface AppSettings {
  namaOrganisasi: string;
  slogan: string;
  noWaAdmin: string;
  emailAdmin: string;
  alamatPusat: string;
  runningAnnouncement: string;
  logoUrl?: string;
  hideHeaderBanner?: boolean;
}
