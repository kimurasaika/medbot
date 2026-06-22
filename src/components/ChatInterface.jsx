import { useState, useEffect, useRef, useCallback } from 'react';
import ChatBubble from './ChatBubble';
import DiagnosisModal from './DiagnosisModal';
import LanguageToggle from './LanguageToggle';
import { useTimer } from '../hooks/useTimer';
import { sendMessage } from '../utils/openrouter';
import {
  buildSystemPrompt,
  buildDiagnosisMessage,
  extractDisease,
  stripDiseaseTag,
  isSessionComplete,
  stripSessionComplete,
} from '../utils/prompts';

export default function ChatInterface({ lang, t, category, onToggleLang, onSessionEnd }) {
  const [messages, setMessages] = useState([]);   // { role: 'patient'|'student', content }
  const [apiHistory, setApiHistory] = useState([]); // OpenRouter message format
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryable, setRetryable] = useState(false);
  const [lastRetryFn, setLastRetryFn] = useState(null);
  const [disease, setDisease] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  const { formatted: timerFormatted, elapsed } = useTimer(!sessionDone);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Start session — send the system prompt and get first patient message
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const categoryLabel = lang === 'en' ? category.en : category.th;
    const systemPrompt = buildSystemPrompt(categoryLabel, lang);

    const init = async () => {
      setLoading(true);
      setError('');
      setRetryable(false);
      try {
        const history = [{ role: 'system', content: systemPrompt }];
        const rawResponse = await sendMessage(history);

        const detectedDisease = extractDisease(rawResponse);
        if (detectedDisease) setDisease(detectedDisease);

        const cleanResponse = stripDiseaseTag(rawResponse);

        setApiHistory([
          ...history,
          { role: 'assistant', content: rawResponse },
        ]);
        setMessages([{ role: 'patient', content: cleanResponse }]);
      } catch (err) {
        if (err.message === 'API_KEY_MISSING') {
          setError(t.apiKeyMissing);
        } else {
          setError(err.message);
          setRetryable(!!err.retryable);
          setLastRetryFn(() => () => { initializedRef.current = false; init(); });
        }
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendStudentMessage = useCallback(async (content) => {
    if (!content.trim() || loading || sessionDone) return;

    const newMessages = [...messages, { role: 'student', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');
    setTurnCount((c) => c + 1);

    const updatedHistory = [...apiHistory, { role: 'user', content }];

    try {
      const rawResponse = await sendMessage(updatedHistory);
      const isDone = isSessionComplete(rawResponse);
      const cleanResponse = stripSessionComplete(rawResponse);

      const finalMessages = [...newMessages, { role: 'patient', content: cleanResponse }];
      setMessages(finalMessages);
      setApiHistory([...updatedHistory, { role: 'assistant', content: rawResponse }]);
      setError('');
      setRetryable(false);

      if (isDone) {
        setSessionDone(true);
      }
    } catch (err) {
      const msg = err.message === 'API_KEY_MISSING' ? t.apiKeyMissing : err.message;
      setError(msg);
      setRetryable(!!err.retryable);
      // Store retry as resending the same message
      setLastRetryFn(() => () => sendStudentMessage(content));
      // Roll back student message on error
      setMessages(messages);
      setTurnCount((c) => c - 1);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [messages, apiHistory, loading, sessionDone, t]);

  const handleDiagnosisSubmit = async (diagnosis) => {
    setShowDiagnosisModal(false);
    const diagMsg = buildDiagnosisMessage(diagnosis, lang);
    // Show student's diagnosis as a chat message
    const studentMsg = `${t.submitDiagnosis}: ${diagnosis}`;
    const newMessages = [...messages, { role: 'student', content: studentMsg }];
    setMessages(newMessages);
    setLoading(true);
    setError('');

    const updatedHistory = [...apiHistory, { role: 'user', content: diagMsg }];

    try {
      const rawResponse = await sendMessage(updatedHistory);
      const cleanResponse = stripSessionComplete(rawResponse);
      const finalMessages = [...newMessages, { role: 'patient', content: cleanResponse }];
      setMessages(finalMessages);
      setSessionDone(true);

      // Transition to summary after a short delay
      setTimeout(() => {
        onSessionEnd({
          messages: finalMessages,
          disease,
          studentDiagnosis: diagnosis,
          diagnosisResponse: cleanResponse,
          elapsed,
        });
      }, 1800);
    } catch (err) {
      setError(err.message === 'API_KEY_MISSING' ? t.apiKeyMissing : err.message);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendStudentMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendStudentMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Top bar */}
      <header className="flex-shrink-0 backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: logo + category */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-xl shadow flex-shrink-0`}
            >
              {category.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">MedBot</p>
              <h1 className="text-sm font-bold text-slate-800 truncate">
                {lang === 'en' ? category.en : category.th}
              </h1>
            </div>
          </div>

          {/* Center: stats */}
          <div className="flex items-center gap-3">
            <Stat icon="⏱" label={t.timer} value={timerFormatted} />
            <Stat icon="🔄" label={t.turns} value={turnCount} />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onToggle={onToggleLang} />
            {!sessionDone && (
              <button
                onClick={() => setConfirmEnd(true)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                {t.endSession}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto chat-scroll">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} t={t} />
          ))}

          {loading && (
            <div className="flex items-end gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm shadow flex-shrink-0">
                🧑‍⚕️
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-md bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 animate-fade-in">
              <p className="text-center">⚠️ {error}</p>
              {retryable && (
                <p className="text-center text-xs text-red-400 mt-1">
                  The AI provider is temporarily unavailable (free tier limit). Please wait a moment and retry.
                </p>
              )}
              {retryable && lastRetryFn && (
                <button
                  onClick={() => { setError(''); lastRetryFn()(); }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium text-xs transition"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          )}

          {sessionDone && !loading && (
            <div className="text-center animate-fade-in">
              <div className="inline-block bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-700 text-sm font-medium">
                ✅ {t.sessionEnded}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      {!sessionDone && (
        <div className="flex-shrink-0 border-t border-slate-200/60 bg-white/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <form onSubmit={handleSend} className="flex gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.askPatient}
                disabled={loading}
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition text-sm disabled:opacity-60 min-h-[42px] max-h-32"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow"
                title={t.send}
              >
                <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowDiagnosisModal(true)}
                disabled={loading || messages.length < 2}
                className="flex-shrink-0 px-4 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow whitespace-nowrap"
              >
                {t.submitDiagnosis}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Diagnosis modal */}
      {showDiagnosisModal && (
        <DiagnosisModal
          t={t}
          onSubmit={handleDiagnosisSubmit}
          onCancel={() => setShowDiagnosisModal(false)}
        />
      )}

      {/* Confirm end modal */}
      {confirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center animate-slide-up">
            <p className="text-slate-700 font-medium mb-5">{t.confirmEnd}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEnd(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
              >
                {t.no}
              </button>
              <button
                onClick={() => {
                  setConfirmEnd(false);
                  setSessionDone(true);
                  onSessionEnd({
                    messages,
                    disease,
                    studentDiagnosis: '',
                    diagnosisResponse: '',
                    elapsed,
                  });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-slate-100 rounded-xl px-3 py-1.5 min-w-[60px]">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium leading-none mb-0.5">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-700">{value}</span>
    </div>
  );
}
