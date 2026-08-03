import React, { useState } from 'react';
import { 
  Shield, 
  Newspaper, 
  CreditCard, 
  Calendar, 
  User as UserIcon, 
  Lock, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Volume2, 
  Menu, 
  X,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuthModal }) => {
  const { currentUser, logout, appSettings, generateWhatsAppUrl } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Shield },
    { id: 'artikel', label: 'Artikel & Berita', icon: Newspaper },
    { id: 'idcard', label: 'ID Card Digital', icon: CreditCard },
    { id: 'jadwal', label: 'Jadwal Latihan', icon: Calendar },
    { id: 'profil', label: 'Profil Siswa', icon: UserIcon },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Dashboard Admin', icon: Lock });
  }

  return (
    <header className="sticky top-0 z-40 w-full no-print">
      {/* Top Announcement Bar (Hidden if hideHeaderBanner is true) */}
      {!appSettings.hideHeaderBanner && appSettings.runningAnnouncement && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-amber-200 text-xs py-1.5 px-4 border-b border-red-800/40 flex items-center overflow-hidden">
          <div className="flex items-center space-x-2 shrink-0 bg-red-900/80 px-2 py-0.5 rounded text-[11px] font-bold text-amber-300 mr-2 border border-red-700/50">
            <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>PENGUMUMAN</span>
          </div>
          <div className="whitespace-nowrap overflow-x-auto no-scrollbar font-medium tracking-wide">
            {appSettings.runningAnnouncement}
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand Title */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              {appSettings.logoUrl ? (
                <img
                  src={appSettings.logoUrl}
                  alt={appSettings.namaOrganisasi || 'Logo PAMUR'}
                  className="h-12 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow"
                />
              ) : (
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-amber-400 text-slate-900 font-black text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-slate-900" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-heading font-black text-xl tracking-wider text-white group-hover:text-amber-400 transition-colors">
                    PAMUR
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-400 text-slate-900 rounded">
                    1951
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-tight hidden sm:block">
                  Perguruan Seni Bela Diri Pencak Silat Indonesia
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Actions (WhatsApp Admin, User Auth) */}
            <div className="hidden sm:flex items-center space-x-3">
              
              {/* Direct WA Admin Link */}
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/60 transition"
                title={`Kontak WA Admin (+${appSettings.noWaAdmin})`}
              >
                <PhoneCall className="w-4 h-4" />
              </a>

              {/* User State */}
              {currentUser ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-slate-100 line-clamp-1">{currentUser.nama}</div>
                    <div className="text-[10px] text-amber-400 font-medium">
                      {currentUser.role === 'admin' ? '⚡ Administrator' : currentUser.tingkatSabuk}
                    </div>
                  </div>
                  <img
                    src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                    alt={currentUser.nama}
                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500 shadow"
                  />
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Keluar / Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenAuthModal('login')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>Masuk</span>
                  </button>
                  <button
                    onClick={() => onOpenAuthModal('register')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-900/30"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Siswa</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center space-x-2 sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Auth Buttons in Mobile */}
            {currentUser ? (
              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <img
                    src={currentUser.fotoUrl}
                    alt={currentUser.nama}
                    className="w-8 h-8 rounded-full object-cover border border-red-500"
                  />
                  <div>
                    <div className="font-bold text-white">{currentUser.nama}</div>
                    <div className="text-[10px] text-amber-400">{currentUser.tingkatSabuk}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-800 flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onOpenAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 text-center"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => {
                    onOpenAuthModal('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2 rounded-xl bg-red-600 text-white text-xs font-bold text-center"
                >
                  Daftar Siswa
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
