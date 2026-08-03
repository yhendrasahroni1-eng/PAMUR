import React, { useState } from 'react';
import { Newspaper, Search, Eye, Calendar, User, BookOpen, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Article, KategoriArtikel } from '../../types';
import { ArticleDetailModal } from '../ArticleDetailModal';

export const ArtikelSection: React.FC = () => {
  const { articles } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeArticleModal, setActiveArticleModal] = useState<Article | null>(null);

  const categories: string[] = [
    'Semua',
    'Sejarah & Filsafat',
    'Jurus & Teknik',
    'Kejuaraan & Prestasi',
    'Pengumuman',
    'Tips Kesehatan'
  ];

  const filteredArticles = articles.filter(art => {
    const matchCat = selectedCategory === 'Semua' || art.kategori === selectedCategory;
    const matchQuery = 
      art.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.penulis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white shadow-md">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-amber-400" />
            <span>Artikel, Wawasan & Berita PAMUR</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Edukasi sejarah perguruan 1951, teknik jurus paket rasio, panduan kesehatan pesilat, dan berita prestasi.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel, jurus, atau kabar kejuaraan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article Grid (If any featured and on "Semua") */}
      {selectedCategory === 'Semua' && !searchQuery && articles.some(a => a.featured) && (
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Artikel Pilihan / Utama</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.filter(a => a.featured).map((feat) => (
              <div
                key={feat.id}
                onClick={() => setActiveArticleModal(feat)}
                className="group relative bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition duration-300 flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={feat.gambarUrl}
                    alt={feat.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] uppercase shadow">
                    {feat.kategori}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-heading font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    {feat.judul}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {feat.ringkasan}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-indigo-600" />
                      <span>{feat.penulis}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>{feat.dibaca} views</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Articles Grid */}
      <div className="space-y-3">
        <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Semua Artikel ({filteredArticles.length})
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
            <p className="text-sm font-semibold">Tidak ada artikel ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setActiveArticleModal(art)}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition duration-300 flex flex-col justify-between group"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={art.gambarUrl}
                    alt={art.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-amber-300 font-extrabold text-[9px] uppercase">
                    {art.kategori}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                      {art.judul}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {art.ringkasan}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{art.tanggal}</span>
                    </span>
                    <span className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
                      <span>Baca Selengkapnya</span>
                      <BookOpen className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <ArticleDetailModal
        article={activeArticleModal}
        onClose={() => setActiveArticleModal(null)}
      />

    </div>
  );
};
