import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Edit3, PhoneCall, Save, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Schedule } from '../../types';

export const AdminJadwalManager: React.FC = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form state
  const [hari, setHari] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'>('Senin');
  const [jamMulai, setJamMulai] = useState('15:30');
  const [jamSelesai, setJamSelesai] = useState('17:30');
  const [ranting, setRanting] = useState('Ranting Pamekasan Pusat');
  const [lokasi, setLokasi] = useState('Padepokan PAMUR Pusat, Pamekasan');
  const [pelatih, setPelatih] = useState('Pelatih Utama');
  const [kontakPelatihWa, setKontakPelatihWa] = useState('6281234567890');
  const [materi, setMateri] = useState('Latihan Kuda-Kuda, Tangkapan, dan Jurus Paket');
  const [tipeLatihan, setTipeLatihan] = useState<'Reguler' | 'Tanding / TC' | 'Seni / Jurus Paket' | 'Ujian Kenaikan Sabuk'>('Reguler');

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleOpenEdit = (s: Schedule) => {
    setEditingSchedule(s);
    setHari(s.hari);
    setJamMulai(s.jamMulai);
    setJamSelesai(s.jamSelesai);
    setRanting(s.ranting);
    setLokasi(s.lokasi);
    setPelatih(s.pelatih);
    setKontakPelatihWa(s.kontakPelatihWa);
    setMateri(s.materi);
    setTipeLatihan(s.tipeLatihan);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, {
        hari,
        jamMulai,
        jamSelesai,
        ranting,
        lokasi,
        pelatih,
        kontakPelatihWa,
        materi,
        tipeLatihan
      });
    } else {
      addSchedule({
        hari,
        jamMulai,
        jamSelesai,
        ranting,
        lokasi,
        pelatih,
        kontakPelatihWa,
        materi,
        tipeLatihan
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Kelola Jadwal Latihan PAMUR ({schedules.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur jadwal mingguan per ranting, materi fisik/jurus, dan kontak pelatih.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Latihan</span>
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-1 rounded bg-indigo-600 text-white font-extrabold text-xs">
                  {s.hari}
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900 mt-1">
                  {s.ranting}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                {s.jamMulai} - {s.jamSelesai}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div><strong className="text-slate-800">Lokasi: </strong>{s.lokasi}</div>
              <div><strong className="text-slate-800">Pelatih: </strong>{s.pelatih} (+{s.kontakPelatihWa})</div>
              <div><strong className="text-slate-800">Materi: </strong>{s.materi}</div>
              <div>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10px]">
                  Tipe: {s.tipeLatihan}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus jadwal ${s.hari} - ${s.ranting}?`)) {
                    deleteSchedule(s.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Latihan Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hari</label>
                  <select
                    value={hari}
                    onChange={(e: any) => setHari(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jam Mulai</label>
                  <input
                    type="text"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jam Selesai</label>
                  <input
                    type="text"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ranting / Cabang</label>
                <input
                  type="text"
                  required
                  value={ranting}
                  onChange={(e) => setRanting(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lokasi Latihan</label>
                <input
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pelatih</label>
                  <input
                    type="text"
                    value={pelatih}
                    onChange={(e) => setPelatih(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No WA Pelatih</label>
                  <input
                    type="text"
                    value={kontakPelatihWa}
                    onChange={(e) => setKontakPelatihWa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Materi Latihan</label>
                <input
                  type="text"
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipe Latihan</label>
                <select
                  value={tipeLatihan}
                  onChange={(e: any) => setTipeLatihan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Reguler">Reguler</option>
                  <option value="Tanding / TC">Tanding / TC</option>
                  <option value="Seni / Jurus Paket">Seni / Jurus Paket</option>
                  <option value="Ujian Kenaikan Sabuk">Ujian Kenaikan Sabuk</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
