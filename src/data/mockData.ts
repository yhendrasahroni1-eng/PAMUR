import { User, Article, Schedule, AppSettings } from '../types';

export const initialAppSettings: AppSettings = {
  namaOrganisasi: 'Perguruan Seni Bela Diri Pencak Silat PAMUR Indonesia',
  slogan: 'Pencak Silat Angkatan Muda Rasio - Berbudi Pekerti Luhur, Tangguh & Berprestasi',
  noWaAdmin: '6281234567890',
  emailAdmin: 'yhendrasahroni1@gmail.com',
  alamatPusat: 'Jl. Raden Abdul Aziz No. 45, Pamekasan, Madura, Jawa Timur',
  runningAnnouncement: '📢 Selamat datang di Portal Resmi PAMUR Indonesia! Pendaftaran Ujian Kenaikan Sabuk Gelombang II dibuka sampai 15 Agustus 2026. Tetap semangat latihan!',
  logoUrl: '',
  hideHeaderBanner: false,
};

export const initialUsers: User[] = [
  {
    id: 'usr-admin-1',
    nis: 'PMR-ADM-001',
    nik: '3528011205780001',
    nama: 'Y. Hendra Sahroni',
    email: 'yhendrasahroni1@gmail.com',
    password: 'Yahyarnb',
    role: 'admin',
    tingkatSabuk: 'Hitam',
    ranting: 'Ranting Pamekasan Pusat',
    tempatLahir: 'Pamekasan',
    tanggalLahir: '1985-05-12',
    jenisKelamin: 'Laki-Laki',
    noWa: '6281234567890',
    alamat: 'Jl. Raya Panglegur No. 12, Pamekasan',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    tanggalBergabung: '2010-01-10',
    statusAktif: true,
    terverifikasi: true,
    presensiCount: 150,
    catatanPrestasi: [
      'Pengurus & Administrator Utama PAMUR Indonesia',
      'Wasit Juri IPSI Tingkat Nasional'
    ]
  }
];

export const initialArticles: Article[] = [
  {
    id: 'art-1',
    judul: 'Sejarah Pendirian PAMUR: Warisan Hasan Habudin Sejak Tahun 1951 di Madura',
    slug: 'sejarah-pendirian-pamur-1951',
    kategori: 'Sejarah & Filsafat',
    ringkasan: 'Mengenal asal usul Perguruan Pencak Silat Angkatan Muda Rasio (PAMUR) yang didirikan oleh Guru Besar Hasan Habudin di Pamekasan Madura pada 31 Desember 1951.',
    konten: `Perguruan Seni Bela Diri Pencak Silat **PAMUR** (Pencak Silat Angkatan Muda Rasio) didirikan secara resmi pada tanggal 31 Desember 1951 di Pamekasan, Madura, Jawa Timur oleh **Guru Besar Hasan Habudin**.

### Sejarah Singkat
Nama *PAMUR* diambil dari singkatan *Pencak Silat Angkatan Muda Rasio*. Pendirian perguruan ini didasari oleh semangat membina mental, spiritual, dan ketahanan fisik para pemuda Indonesia pasca kemerdekaan. Guru Besar Hasan Habudin meramu teknik-teknik silat tradisional Madura yang lugas, efektif, dan penuh perhitungan logis (rasional).

### Falsafah Utama PAMUR
1. **Rasio dan Jiwa yang Bersih**: Setiap gerak bela diri harus dilandasi akal sehat, bukan emosi buta.
2. **Kewibawaan Tanpa Kesombongan**: Pesilat PAMUR diajarkan untuk selalu rendah hati, santun, dan melindungi yang lemah.
3. **Keteguhan Jiwa Pendekar**: Menjunjung tinggi persaudaraan sesama anggota dan seluruh praktisi pencak silat Indonesia di bawah naungan IPSI.

Hingga hari ini, PAMUR telah berkembang pesat dengan puluhan cabang di Jawa Timur, DKI Jakarta, Jawa Barat, Kalimantan, hingga mancanegara.`,
    penulis: 'Humas Dewan Pendekar PAMUR',
    tanggal: '2026-07-28',
    gambarUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    dibaca: 342,
    featured: true
  },
  {
    id: 'art-2',
    judul: 'Panduan Jurus Paket Wajib PAMUR untuk Persiapan Ujian Kenaikan Sabuk',
    slug: 'panduan-jurus-paket-wajib-pamur',
    kategori: 'Jurus & Teknik',
    ringkasan: 'Penjelasan detail 12 gerakan dasar tangkapan, pukulan rasio, dan langkah kuda-kuda yang wajib dikuasai peserta ujian kenaikan sabuk Hijau dan Biru.',
    konten: `Dalam disiplin latihan PAMUR, penguasaan **Jurus Paket Wajib** merupakan syarat mutlak sebelum seorang siswa dapat dinyatakan lulus ujian kenaikan tingkat sabuk.

### Komponen Utama Jurus Paket:
1. **Kuda-kuda Seimbang (Sikap Pasang)**: Keseimbangan tumpuan beban tubuh antara kaki depan dan belakang untuk mobilitas tinggi.
2. **Pukulan Lurus Rasio**: Pukulan bertenaga penuh yang mengandalkan putaran pinggul dan penguncian bahu saat benturan.
3. **Tangkis Silang & Tangkap Siku**: Teknik pertahanan mengalihkan serangan lawan menggunakan penguncian sendi.
4. **Tendangan Lurus & T**: Sapuan dan tendangan presisi menyasar titik vital lawan secara efisien.

*Tips Latihan:* Lakukan pengulangan minimal 50 kali setiap sesi latihan mandiri di rumah untuk melatih *muscle memory*!`,
    penulis: 'Pelatih Kepala Ranting Pusat',
    tanggal: '2026-07-15',
    gambarUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800',
    dibaca: 215,
    featured: false
  },
  {
    id: 'art-3',
    judul: 'Kontingen PAMUR Sabet 5 Emas di Kejuaraan Pencak Silat Antar Perguruan 2026',
    slug: 'pamur-sabet-5-emas-kejuaraan-2026',
    kategori: 'Kejuaraan & Prestasi',
    ringkasan: 'Kabar membanggakan dari gelanggang olahraga! Atlet-atlet muda PAMUR berhasil memboyong 5 medali emas dan 3 perak pada ajang Kejurprov Jawa Timur.',
    konten: `Selamat kepada para atlet Pencak Silat PAMUR yang telah berjuang habis-habisan di Gelanggang Olahraga Remaja (GOR) Jayandaru dalam Kejuaraan Pencak Silat Terbuka 2026.

### Perolehan Medali:
* **Emas**: Tanding Kelas D Putra, Tanding Kelas C Putri, Seni Tunggal Baku Putra, Seni Ganda Putra, dan Tanding Bebas Pendekar.
* **Perak**: Tanding Kelas B Putra, Tanding Kelas A Putri, dan Seni Beregu Putri.

Ketua Umum Pengurus Pusat PAMUR mengapresiasi kedisiplinan dan semangat *fighting spirit* para pesilat yang tetap menjunjung tinggi sportifitas dan persaudaraan sesama pendekar.`,
    penulis: 'Tim Media PAMUR News',
    tanggal: '2026-06-30',
    gambarUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800',
    dibaca: 489,
    featured: true
  },
  {
    id: 'art-4',
    judul: 'Tips Menjaga Stamina & Nutrisi Pesilat Menjelang Pertandingan TC',
    slug: 'tips-stamina-nutrisi-pesilat',
    kategori: 'Tips Kesehatan',
    ringkasan: 'Inilah pola makan karbohidrat kompleks, hidrasi optimal, dan jeda istirahat ideal agar kondisi fisik tetap prima saat latihan intensif Training Center.',
    konten: `Latihan beban fisik intensif dalam pencak silat membutuhkan suplai energi yang seimbang agar terhindar dari kram otot dan kelelahan kronis.

### 4 Pilar Fisik Pesilat:
1. **Hidrasi Cukup**: Minum air putih minimal 3 liter per hari dan hindari minuman bersoda.
2. **Asupan Protein Tinggi**: Konsumsi telur rebus, dada ayam, atau tahu tempe pasca latihan untuk pemulihan jaringan otot.
3. **Tidur Berkualitas**: Tidur malam 7-8 jam sangat krusial untuk regenerasi hormon pertumbuhan.
4. **Pemanasan & Pendinginan**: Jangan pernah melewatkan *stretching* 15 menit sebelum dan sesudah latihan fisik.`,
    penulis: 'Dr. Hendra (Dokter Tim PAMUR)',
    tanggal: '2026-06-10',
    gambarUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    dibaca: 180,
    featured: false
  }
];

export const initialSchedules: Schedule[] = [
  {
    id: 'sch-1',
    hari: 'Senin',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    ranting: 'Ranting Pamekasan Pusat',
    lokasi: 'Padepokan PAMUR Pusat, Jl. Raden Abdul Aziz, Pamekasan',
    pelatih: 'Pelatih Utama Supriyadi & Kang Faiz',
    kontakPelatihWa: '6281234567890',
    materi: 'Latihan Fisik Kuda-Kuda, Tangkapan, dan Teknik Pukulan Rasio',
    tipeLatihan: 'Reguler'
  },
  {
    id: 'sch-2',
    hari: 'Rabu',
    jamMulai: '19:00',
    jamSelesai: '21:00',
    ranting: 'Ranting Pamekasan Pusat',
    lokasi: 'Lapangan Outdoor Alun-Alun Pamekasan',
    pelatih: 'Pendekar Muda Bambang Suroso',
    kontakPelatihWa: '6281234567890',
    materi: 'Simulasi Tanding Peraturan IPSI & Drill Target Kicking',
    tipeLatihan: 'Tanding / TC'
  },
  {
    id: 'sch-3',
    hari: 'Jumat',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    ranting: 'Ranting Surabaya Cab. Gubeng',
    lokasi: 'Aula Serbaguna Kampus Unair A, Surabaya',
    pelatih: 'Pelatih Syaiful Anam',
    kontakPelatihWa: '6281987654321',
    materi: 'Penguasaan Jurus Paket Wajib & Seni Tunggal Baku',
    tipeLatihan: 'Seni / Jurus Paket'
  },
  {
    id: 'sch-4',
    hari: 'Sabtu',
    jamMulai: '07:00',
    jamSelesai: '10:00',
    ranting: 'Ranting Malang Kota',
    lokasi: 'GOR Lapangan Rampal, Malang',
    pelatih: 'Mas Ridwan & Tim Asisten',
    kontakPelatihWa: '6281357924680',
    materi: 'Latihan Gabungan Lintas Ranting & Pra-Ujian Sabuk',
    tipeLatihan: 'Ujian Kenaikan Sabuk'
  },
  {
    id: 'sch-5',
    hari: 'Minggu',
    jamMulai: '06:00',
    jamSelesai: '08:30',
    ranting: 'Ranting Pamekasan Pusat',
    lokasi: 'Padepokan PAMUR Pusat, Pamekasan',
    pelatih: 'Guru Kebatinan & Pelatih Fisik',
    kontakPelatihWa: '6281234567890',
    materi: 'Lari Pagi, Pernapasan / Olah Rasa, dan Kerohanian PAMUR',
    tipeLatihan: 'Reguler'
  }
];
