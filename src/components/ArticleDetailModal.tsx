import React, { useEffect } from 'react';
import { X, Calendar, User, Eye, Share2, MessageSquare, BookOpen, Tag } from 'lucide-react';
import { Article } from '../types';
import { useApp } from '../context/AppContext';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  const { incrementArticleViews, generateWhatsAppUrl } = useApp();

  useEffect(() => {
    if (article) {
      incrementArticleViews(article.id);
    }
  }, [article?.id]);

  if (!article) return null;

  const handleShareWa = () => {
    const text = `*${article.judul}*\n\nRead article from PAMUR Indonesia:\n"${article.ringkasan}"\n\nKategori: ${article.kategori}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Cover Image */}
        <div className="relative h-64 w-full bg-slate-950 shrink-0 overflow-hidden">
          <img
            src={article.gambarUrl}
            alt={article.judul}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Tag */}
          <div className="absolute bottom-4 left-6 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow">
              {article.kategori}
            </span>
            {article.featured && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow">
                ★ Utaman
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white leading-tight">
            {article.judul}
          </h2>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4 border-b border-slate-800">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-semibold">{article.penulis}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{article.tanggal}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{article.dibaca + 1}x dibaca</span>
            </span>
          </div>

          {/* Summary Callout */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border-l-4 border-red-600 text-slate-300 text-xs italic leading-relaxed">
            "{article.ringkasan}"
          </div>

          {/* Formatted Article Body */}
          <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
            {article.konten.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="font-heading font-bold text-base text-amber-400 pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('* ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1 text-slate-300">
                    {paragraph.split('\n').map((li, liIdx) => (
                      <li key={liIdx}>{li.replace('* ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleShareWa}
            className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900 font-bold text-xs flex items-center space-x-2 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Bagikan ke WhatsApp</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Tutup Artikel
          </button>
        </div>

      </div>
    </div>
  );
};
