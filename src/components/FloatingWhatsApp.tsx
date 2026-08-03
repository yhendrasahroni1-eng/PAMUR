import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingWhatsApp: React.FC = () => {
  const { appSettings, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const formattedWa = appSettings.noWaAdmin.replace(/[^0-9]/g, '');

  const quickTemplates = [
    {
      icon: ShieldCheck,
      title: 'Verifikasi Pendaftaran ID Card',
      text: currentUser 
        ? `Halo Admin PAMUR, saya ${currentUser.nama} (NIS: ${currentUser.nis}) ingin memverifikasi pendaftaran akun dan ID Card saya.`
        : `Halo Admin PAMUR, saya ingin mengonfirmasi pendaftaran akun siswa baru PAMUR.`
    },
    {
      icon: Calendar,
      title: 'Tanya Jadwal Latihan & Lokasi',
      text: `Halo Admin PAMUR, saya ingin menanyakan jadwal latihan dan lokasi Ranting terdekat.`
    },
    {
      icon: FileText,
      title: 'Informasi Ujian Kenaikan Sabuk',
      text: `Halo Admin PAMUR, mohon informasi mengenai syarat dan tanggal pendaftaran Ujian Kenaikan Sabuk.`
    }
  ];

  const handleSend = (textToSend: string) => {
    const finalMsg = encodeURIComponent(textToSend.trim() || 'Halo Admin PAMUR, saya ingin bertanya.');
    window.open(`https://wa.me/${formattedWa}?text=${finalMsg}`, '_blank');
    setIsOpen(false);
    setCustomText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {/* Expanded Quick Chat Box */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center border border-white/30">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-heading">Layanan WhatsApp PAMUR</h4>
                <p className="text-xs text-amber-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online - +{formattedWa}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition text-white"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-900/80 text-slate-200 text-xs">
            <p className="text-slate-400 italic font-light">
              Pilih pesan cepat di bawah ini atau ketik pesan Anda langsung ke WhatsApp Admin PAMUR Indonesia:
            </p>

            <div className="space-y-2">
              {quickTemplates.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-red-500/50 transition flex items-start space-x-2.5 group"
                >
                  <item.icon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-red-400">{item.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.text}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="pt-2 border-t border-slate-800">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Tulis pesan Anda untuk Admin PAMUR..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 resize-none h-16"
              />
              <button
                onClick={() => handleSend(customText)}
                disabled={!customText.trim()}
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition text-xs shadow-md shadow-emerald-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-full shadow-xl shadow-emerald-950/50 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-emerald-400/40"
        title="Hubungi Admin WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white animate-bounce group-hover:animate-none" />
        
        {/* Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none"></span>

        {/* Badge Indicator */}
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
          WA
        </span>
      </button>
    </div>
  );
};
