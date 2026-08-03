import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Newspaper, 
  User as UserIcon, 
  ArrowRight, 
  Clock, 
  Award, 
  ChevronRight, 
  PhoneCall, 
  Sparkles,
  BookOpen,
  Eye,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IdCardDigital } from './IdCardDigital';
import { ArticleDetailModal } from '../ArticleDetailModal';
import { Article } from '../../types';

interface SiswaDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ setActiveTab, onOpenAuthModal }) => {
  const { currentUser, articles, schedules, generateWhatsAppUrl } = useApp();
  const [selectedHomeArticle, setSelectedHomeArticle] = useState<Article | null>(null);
  const [homeArticleCategory, setHomeArticleCategory] = useState<string>('Semua');

  const categories: string[] = [
    'Semua',
    'Sejarah & Filsafat',
    'Jurus & Teknik',
    'Kejuaraan & Prestasi',
    'Pengumuman'
  ];

  const filteredHomeArticles = articles.filter(art => {
    if (homeArticleCategory === 'Semua') return true;
    return art.kategori === homeArticleCategory;
  });

  const nextSchedules = schedules.slice(0, 2);

  return (
    <div className="space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-amber-300 font-black text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>PORTAL UTAMA SILAT PAMUR INDONESIA</span>
          </div>

          <div className="max-w-2xl space-y-2">
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white leading-tight">
              {currentUser 
                ? `Selamat Datang, ${currentUser.nama}!` 
                : 'Selamat Datang di Portal Resmi PAMUR Indonesia'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {currentUser 
                ? `Anggota Aktif Ranting ${currentUser.ranting}. Pantau jadwal latihan, unduh Kartu ID Anggota Digital, dan perbarui wawasan silat Anda.`
                : 'Perguruan Seni Bela Diri Pencak Silat Angkatan Muda Rasio (PAMUR) - Membina generasi muda berjiwa pendekar, berbudi luhur, dan berprestasi sejak 1951.'}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 flex flex-wrap gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => setActiveTab('idcard')}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <CreditCard className="w-4 h-4 text-slate-900" />
                  <span>Buka ID Card Digital</span>
                </button>

                <button
                  onClick={() => setActiveTab('jadwal')}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md shadow-indigo-900/30"
                >
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Lihat Jadwal Latihan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center space-x-2 shadow-xl shadow-amber-500/20 transition"
                >
                  <span>Daftar Siswa Baru Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-900/30"
                >
                  Masuk Portal Siswa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: ID Card */}
        <div 
          onClick={() => setActiveTab('idcard')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer transition duration-300 space-y-3 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
              ID Card Digital
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              Kartu Anggota Resmi dengan QR Code Verifikasi dan cetak PDF.
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-indigo-600 flex items-center space-x-1 pt-1">
            <span>Buka ID Card</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Jadwal Latihan */}
        <div 
          onClick={() => setActiveTab('jadwal')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer transition duration-300 space-y-3 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
              Jadwal Latihan
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              Agenda latihan mingguan per Ranting dan konfirmasi kehadiran.
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-indigo-600 flex items-center space-x-1 pt-1">
            <span>Cek Jadwal & Presensi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Artikel & Sejarah */}
        <div 
          onClick={() => setActiveTab('artikel')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer transition duration-300 space-y-3 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
              Artikel & Jurus
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              Sejarah Hasan Habudin 1951, panduan jurus paket, dan tips fisik.
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-indigo-600 flex items-center space-x-1 pt-1">
            <span>Baca Artikel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Profil Siswa */}
        <div 
          onClick={() => setActiveTab('profil')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer transition duration-300 space-y-3 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
              Profil Siswa
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              Perbarui data diri, tingkat sabuk, dan riwayat prestasi kejuaraan.
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-indigo-600 flex items-center space-x-1 pt-1">
            <span>Kelola Profil</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Main Feature Sections Grid (2 Columns: Next Schedule & ID Card Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Upcoming Practice Schedule & WhatsApp Admin Contact */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Jadwal Latihan Terdekat</span>
              </h3>
              <button
                onClick={() => setActiveTab('jadwal')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Lihat Semua ({schedules.length})
              </button>
            </div>

            <div className="space-y-3">
              {nextSchedules.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[10px]">
                        {item.hari}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-900">
                        {item.jamMulai} - {item.jamSelesai} WIB
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                      {item.ranting}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Materi: {item.materi}
                    </p>
                  </div>

                  <a
                    href={generateWhatsAppUrl(`Halo Pelatih ${item.pelatih}, saya mengonfirmasi kehadiran latihan ${item.hari}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-sm transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WA Pelatih</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick WhatsApp Support Box */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-white text-sm">
                Butuh Bantuan atau Verifikasi Akun?
              </h4>
              <p className="text-xs text-slate-300">
                Hubungi Pengurus / Admin PAMUR Indonesia via WhatsApp fast response.
              </p>
            </div>

            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chat WA Admin</span>
            </a>
          </div>

        </div>

        {/* Right Col: Digital ID Card Preview */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>KTA Digital Siswa</span>
              </h3>
              <button
                onClick={() => setActiveTab('idcard')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Cetak & Detail →
              </button>
            </div>

            <IdCardDigital />
          </div>
        </div>

      </div>

      {/* Featured / Public Articles Section (Tampil di Halaman Utama Tanpa Login) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] uppercase tracking-wider">
                Publik & Terbuka
              </span>
              <h3 className="font-heading font-black text-xl text-slate-900">
                Artikel, Berita & Edukasi PAMUR
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Dapat dibaca langsung di halaman utama tanpa harus masuk/login akun.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('artikel')}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
          >
            <span>Buka Semua Artikel ({articles.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setHomeArticleCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                homeArticleCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Cards Grid */}
        {filteredHomeArticles.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            Belum ada artikel untuk kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredHomeArticles.slice(0, 6).map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedHomeArticle(art)}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition duration-300 flex flex-col justify-between group"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={art.gambarUrl}
                    alt={art.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-amber-300 font-extrabold text-[9px] uppercase shadow">
                    {art.kategori}
                  </span>
                  {art.featured && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase shadow">
                      ★ Utama
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                      {art.judul}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {art.ringkasan}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 text-indigo-600 font-bold">
                    <span className="flex items-center gap-1 text-slate-500 text-[10px] font-normal">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{art.tanggal}</span>
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Baca Artikel</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reader Modal for Homepage Articles */}
      <ArticleDetailModal
        article={selectedHomeArticle}
        onClose={() => setSelectedHomeArticle(null)}
      />

    </div>
  );
};
