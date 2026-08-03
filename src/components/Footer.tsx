import React from 'react';
import { Shield, PhoneCall, MapPin, Mail, ExternalLink, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAuthModal }) => {
  const { appSettings, generateWhatsAppUrl, currentUser } = useApp();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 p-0.5 flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-heading font-black text-white text-base">PAMUR INDONESIA</h3>
                <p className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">Est. 1951 - Pamekasan</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              {appSettings.slogan}
            </p>

            <div className="pt-2">
              <a
                href={generateWhatsAppUrl("Halo Admin, saya ingin bertanya seputar perguruan PAMUR.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Admin: +{appSettings.noWaAdmin}</span>
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="font-heading font-bold text-amber-300 text-xs mb-3 uppercase tracking-wider">
              Portal Siswa
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-amber-300 transition">
                  Beranda & Pengumuman
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('artikel')} className="hover:text-amber-300 transition">
                  Artikel & Sejarah PAMUR
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('idcard')} className="hover:text-amber-300 transition">
                  Kartu Anggota Digital
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('jadwal')} className="hover:text-amber-300 transition">
                  Jadwal Latihan & Presensi
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('profil')} className="hover:text-amber-300 transition">
                  Profil & Sabuk Siswa
                </button>
              </li>
            </ul>
          </div>

          {/* Access & Registration */}
          <div>
            <h4 className="font-heading font-bold text-amber-300 text-xs mb-3 uppercase tracking-wider">
              Akses & Keanggotaan
            </h4>
            <ul className="space-y-2">
              {!currentUser && (
                <>
                  <li>
                    <button onClick={() => onOpenAuthModal('register')} className="hover:text-amber-300 transition flex items-center space-x-1">
                      <span>Daftar Siswa Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onOpenAuthModal('login')} className="hover:text-amber-300 transition">
                      Masuk Portal Siswa
                    </button>
                  </li>
                </>
              )}
              {currentUser?.role === 'admin' && (
                <li>
                  <button onClick={() => setActiveTab('admin')} className="text-amber-300 font-bold hover:text-amber-200 transition">
                    Dashboard Admin & Kelola
                  </button>
                </li>
              )}
              <li>
                <a 
                  href={generateWhatsAppUrl("Halo Admin, saya berminat membuka Ranting/Cabang PAMUR baru.")}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition"
                >
                  Pengajuan Ranting Baru (WA)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Address */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-amber-300 text-xs mb-3 uppercase tracking-wider">
              Padepokan Pusat
            </h4>
            <div className="flex items-start space-x-2 text-[11px] text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{appSettings.alamatPusat}</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-300">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{appSettings.emailAdmin}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 leading-normal">
              Induk Organisasi: <strong className="text-white">IPSI (Ikatan Pencak Silat Indonesia)</strong>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} {appSettings.namaOrganisasi}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Sistem Management Digital PAMUR dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> untuk Pencak Silat Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};
