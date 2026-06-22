export default function LanguageToggle({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-sm font-medium text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all shadow-sm"
      title="Toggle language"
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇹🇭' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'ภาษาไทย' : 'English'}</span>
    </button>
  );
}
