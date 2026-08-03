import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { LoginRegisterModal } from './components/LoginRegisterModal';

// Views
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { ArtikelSection } from './components/siswa/ArtikelSection';
import { IdCardDigital } from './components/siswa/IdCardDigital';
import { JadwalLatihanSection } from './components/siswa/JadwalLatihanSection';
import { ProfilSiswaSection } from './components/siswa/ProfilSiswaSection';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <SiswaDashboard
            setActiveTab={setActiveTab}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {activeTab === 'artikel' && <ArtikelSection />}

        {activeTab === 'idcard' && <IdCardDigital />}

        {activeTab === 'jadwal' && <JadwalLatihanSection />}

        {activeTab === 'profil' && <ProfilSiswaSection />}

        {activeTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 className="font-heading font-bold text-xl text-red-400">Akses Terbatas</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Anda memerlukan hak akses Administrator untuk membuka halaman ini. Silakan masuk menggunakan akun Administrator.
              </p>
            </div>
          )
        )}
      </main>

      {/* Floating WhatsApp Action Widget */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Auth Modal (Login / Registration) */}
      <LoginRegisterModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
