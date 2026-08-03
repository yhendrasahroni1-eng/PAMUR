import React, { useState } from 'react';
import { Newspaper, Plus, Trash2, Edit3, Eye, Sparkles, Save, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Article, KategoriArtikel } from '../../types';

export const AdminArtikelManager: React.FC = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form state
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<KategoriArtikel>('Sejarah & Filsafat');
  const [ringkasan, setRingkasan] = useState('');
  const [konten, setKonten] = useState('');
  const [penulis, setPenulis] = useState('Admin Dewan Pendekar');
  const [gambarUrl, setGambarUrl] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800');
  const [featured, setFeatured] = useState(false);

  const categories: KategoriArtikel[] = [
    'Sejarah & Filsafat',
    'Jurus & Teknik',
    'Kejuaraan & Prestasi',
    'Pengumuman',
    'Tips Kesehatan'
  ];

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setJudul('');
    setKategori('Sejarah & Filsafat');
    setRingkasan('');
    setKonten('');
    setPenulis('Admin Dewan Pendekar');
    setGambarUrl('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800');
    setFeatured(false);
    setShowModal(true);
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setJudul(art.judul);
    setKategori(art.kategori);
    setRingkasan(art.ringkasan);
    setKonten(art.konten);
    setPenulis(art.penulis);
    setGambarUrl(art.gambarUrl);
    setFeatured(art.featured || false);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !ringkasan.trim() || !konten.trim()) {
      alert('Mohon lengkapi Judul, Ringkasan, dan Konten artikel!');
      return;
    }

    const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        judul,
        slug,
        kategori,
        ringkasan,
        konten,
        penulis,
        gambarUrl,
        featured
      });
    } else {
      addArticle({
        judul,
        slug,
        kategori,
        ringkasan,
        konten,
        penulis,
        gambarUrl,
        featured
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
            <Newspaper className="w-6 h-6 text-indigo-600" />
            <span>Kelola Artikel & Berita PAMUR ({articles.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan artikel sejarah silat 1951, panduan jurus rasio, dan berita kejuaraan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 flex flex-col justify-between shadow-sm"
          >
            <div className="flex gap-4">
              <img
                src={art.gambarUrl}
                alt={art.judul}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold text-[10px] uppercase border border-indigo-200">
                  {art.kategori}
                </span>
                <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-2">
                  {art.judul}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {art.ringkasan}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-2">
                <span>{art.tanggal}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  {art.dibaca} views
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEdit(art)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Edit Artikel"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus artikel "${art.judul}"?`)) {
                      deleteArticle(art.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="misal: Sejarah Perjuangan Guru Besar Hasan Habudin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kategori *</label>
                  <select
                    value={kategori}
                    onChange={(e: any) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Penulis</label>
                  <input
                    type="text"
                    value={penulis}
                    onChange={(e) => setPenulis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Gambar Sampul</label>
                <input
                  type="url"
                  value={gambarUrl}
                  onChange={(e) => setGambarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ringkasan / Excerpt *</label>
                <textarea
                  required
                  rows={2}
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Konten Artikel Lengkap *</label>
                <textarea
                  required
                  rows={8}
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  placeholder="Tulis paragraf dengan pemisah baris ganda..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-50 border-slate-300 accent-indigo-600"
                />
                <label htmlFor="featuredCheck" className="text-slate-700 font-semibold">
                  Tampilkan sebagai Artikel Pilihan (Featured)
                </label>
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
                  <span>Simpan Artikel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
