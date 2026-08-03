import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  PhoneCall, 
  CheckCircle2, 
  Search, 
  Filter, 
  Dumbbell, 
  Award,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const JadwalLatihanSection: React.FC = () => {
  const { schedules, currentUser, recordAttendance, generateWhatsAppUrl } = useApp();
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceSuccessId, setAttendanceSuccessId] = useState<string | null>(null);

  const hariOptions = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const filteredSchedules = schedules.filter(s => {
    const matchHari = selectedHari === 'Semua' || s.hari === selectedHari;
    const matchQuery = 
      s.ranting.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.materi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pelatih.toLowerCase().includes(searchQuery.toLowerCase());
    return matchHari && matchQuery;
  });

  const handlePresensi = (scheduleId: string) => {
    if (!currentUser) {
      alert('Silakan masuk akun siswa terlebih dahulu!');
      return;
    }

    recordAttendance(scheduleId, 'Hadir', 'Presensi via Portal Siswa');
    setAttendanceSuccessId(scheduleId);
    setTimeout(() => setAttendanceSuccessId(null), 3000);
  };

  const getTipeBadgeColor = (tipe: string) => {
    switch (tipe) {
      case 'Tanding / TC':
        return 'bg-red-950/80 text-red-300 border-red-700/60';
      case 'Seni / Jurus Paket':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'Ujian Kenaikan Sabuk':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white shadow-md">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-400" />
            <span>Jadwal Latihan & Agenda Perguruan</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Jadwal rutin latihan fisik, jurus paket, simulasi tanding, dan presensi keaktifan siswa.
          </p>
        </div>

        {currentUser && (
          <div className="px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs flex items-center space-x-3 shrink-0">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-300 uppercase font-bold">Presensi Latihan Anda</div>
              <div className="text-sm font-extrabold text-amber-300">
                {currentUser.presensiCount || 0} Sesi Hadir
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Ranting, Pelatih, Lokasi, atau Materi Latihan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Day Pills */}
        <div className="md:col-span-7 flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {hariOptions.map(hari => (
            <button
              key={hari}
              onClick={() => setSelectedHari(hari)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedHari === hari
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {hari}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List Cards */}
      {filteredSchedules.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
          <p className="text-sm font-semibold">Tidak ada jadwal latihan yang sesuai filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md relative overflow-hidden transition-all duration-300 group"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>

              {/* Card Header (Day, Time, Type) */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                      {item.hari}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {item.jamMulai} - {item.jamSelesai} WIB
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 mt-1">
                    {item.ranting}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getTipeBadgeColor(item.tipeLatihan)}`}>
                  {item.tipeLatihan}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{item.lokasi}</span>
                </div>

                <div className="flex items-start space-x-2 text-slate-700">
                  <Dumbbell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Materi: </strong>
                    <span>{item.materi}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Pelatih Penanggung Jawab</div>
                    <div className="font-bold text-indigo-900 text-xs">{item.pelatih}</div>
                  </div>

                  <a
                    href={generateWhatsAppUrl(
                      `Halo Pelatih ${item.pelatih}, saya ${currentUser?.nama || 'Siswa PAMUR'} ingin tanya mengenai jadwal latihan ${item.hari} di ${item.ranting}.`,
                      item.kontakPelatihWa
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center space-x-1 shadow-sm"
                    title="Hubungi Pelatih via WhatsApp"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">WA Pelatih</span>
                  </a>
                </div>
              </div>

              {/* Attendance Button */}
              <div className="pt-1">
                {attendanceSuccessId === item.id ? (
                  <div className="w-full py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Presensi Berhasil Dicatat!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePresensi(item.id)}
                    className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-indigo-950/20"
                  >
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    <span>Konfirmasi Kehadiran Saya</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
