import { CATEGORIES } from '../data/categories';
import LanguageToggle from './LanguageToggle';

export default function CategorySelect({ lang, t, onSelect, onToggleLang }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
              <span className="text-white text-lg">🏥</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">{t.appTitle}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t.appSubtitle}</p>
            </div>
          </div>
          <LanguageToggle lang={lang} onToggle={onToggleLang} />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.selectCategory}</h2>
            <p className="text-slate-500">{t.selectCategorySubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat)}
                className={`group relative flex flex-col items-start p-5 rounded-2xl border-2 bg-white ${cat.border} ${cat.hover} transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-left`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-sm mb-4`}>
                  {cat.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  {lang === 'en' ? cat.en : cat.th}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? cat.descEn : cat.descTh}
                </p>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-slate-400 text-lg">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4">
        MedBot — For educational use only
      </footer>
    </div>
  );
}
