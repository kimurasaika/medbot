import ChatBubble from './ChatBubble';
import LanguageToggle from './LanguageToggle';

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SessionSummary({
  lang,
  t,
  messages,
  disease,
  studentDiagnosis,
  diagnosisResponse,
  elapsedTime,
  category,
  onNewSession,
  onToggleLang,
}) {
  const turnCount = messages.filter((m) => m.role === 'student').length;

  // Simple heuristic: check if AI response contains positive words
  const isCorrect = (() => {
    if (!diagnosisResponse) return null;
    const lower = diagnosisResponse.toLowerCase();
    const positives = ['correct', 'right', 'accurate', 'yes', 'well done', 'ถูก', 'ใช่', 'ถูกต้อง', 'เก่ง'];
    const negatives = ['incorrect', 'wrong', 'not quite', 'not exactly', 'ผิด', 'ไม่ถูก', 'ไม่ใช่'];
    const posScore = positives.filter((w) => lower.includes(w)).length;
    const negScore = negatives.filter((w) => lower.includes(w)).length;
    if (posScore > negScore) return true;
    if (negScore > posScore) return false;
    return null;
  })();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-xl shadow`}>
              {category.icon}
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">MedBot</p>
              <h1 className="text-sm font-bold text-slate-800">{t.sessionSummary}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onToggle={onToggleLang} />
            <button
              onClick={onNewSession}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow"
            >
              {t.newSession}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6 animate-fade-in">
        {/* Score cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ScoreCard
            icon="⏱"
            label={t.timer}
            value={formatTime(elapsedTime)}
            sub="mm:ss"
          />
          <ScoreCard
            icon="🔄"
            label={t.turns}
            value={turnCount}
            sub={lang === 'en' ? 'questions asked' : 'คำถามที่ถาม'}
          />
          <ScoreCard
            icon="🦠"
            label={t.correctAnswer}
            value={disease || '—'}
            sub={lang === 'en' ? 'correct disease' : 'โรคที่ถูกต้อง'}
          />
          <ScoreCard
            icon={isCorrect === true ? '✅' : isCorrect === false ? '❌' : '🤔'}
            label={t.result}
            value={isCorrect === true ? t.correct : isCorrect === false ? t.incorrect : '—'}
            highlight={isCorrect === true ? 'green' : isCorrect === false ? 'red' : 'gray'}
          />
        </div>

        {/* Diagnosis comparison */}
        {studentDiagnosis && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-700">Diagnosis Review</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-xs font-medium text-slate-500 w-28 flex-shrink-0 pt-0.5">
                  {t.yourDiagnosis}
                </span>
                <span className="text-sm text-slate-800 font-medium">{studentDiagnosis}</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xs font-medium text-slate-500 w-28 flex-shrink-0 pt-0.5">
                  {t.correctAnswer}
                </span>
                <span className="text-sm text-emerald-700 font-semibold">{disease || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI feedback */}
        {diagnosisResponse && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
              {lang === 'en' ? 'Feedback' : 'คำแนะนำ'}
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{diagnosisResponse}</p>
          </div>
        )}

        {/* Conversation history */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">{t.conversation}</h2>
          </div>
          <div className="p-5 space-y-5 max-h-[500px] overflow-y-auto">
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} content={msg.content} t={t} />
            ))}
          </div>
        </div>

        <div className="pb-8" />
      </main>
    </div>
  );
}

function ScoreCard({ icon, label, value, sub, highlight = 'default' }) {
  const colors = {
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-slate-200 bg-white',
    default: 'border-slate-200 bg-white',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm flex flex-col gap-1 ${colors[highlight]}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      <span
        className={`text-base font-bold truncate ${
          highlight === 'green' ? 'text-green-700' : highlight === 'red' ? 'text-red-600' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
    </div>
  );
}
