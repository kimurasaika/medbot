import { useState, useCallback } from 'react';
import CategorySelect from './components/CategorySelect';
import ChatInterface from './components/ChatInterface';
import SessionSummary from './components/SessionSummary';
import { translations } from './data/translations';
import { DEFAULT_LANG } from './config';

export default function App() {
  const [screen, setScreen] = useState('category'); // 'category' | 'chat' | 'summary'
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Chat state lifted here so summary can read it
  const [messages, setMessages] = useState([]);   // { role: 'patient'|'student', content: string }
  const [disease, setDisease] = useState('');
  const [studentDiagnosis, setStudentDiagnosis] = useState('');
  const [diagnosisResponse, setDiagnosisResponse] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const t = translations[lang];

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'en' ? 'th' : 'en'));
  }, []);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setMessages([]);
    setDisease('');
    setStudentDiagnosis('');
    setDiagnosisResponse('');
    setElapsedTime(0);
    setScreen('chat');
  };

  const handleSessionEnd = ({ messages, disease, studentDiagnosis, diagnosisResponse, elapsed }) => {
    setMessages(messages);
    setDisease(disease);
    setStudentDiagnosis(studentDiagnosis);
    setDiagnosisResponse(diagnosisResponse);
    setElapsedTime(elapsed);
    setScreen('summary');
  };

  const handleNewSession = () => {
    setScreen('category');
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      {screen === 'category' && (
        <CategorySelect
          lang={lang}
          t={t}
          onSelect={handleSelectCategory}
          onToggleLang={toggleLang}
        />
      )}
      {screen === 'chat' && (
        <ChatInterface
          lang={lang}
          t={t}
          category={selectedCategory}
          onToggleLang={toggleLang}
          onSessionEnd={handleSessionEnd}
        />
      )}
      {screen === 'summary' && (
        <SessionSummary
          lang={lang}
          t={t}
          messages={messages}
          disease={disease}
          studentDiagnosis={studentDiagnosis}
          diagnosisResponse={diagnosisResponse}
          elapsedTime={elapsedTime}
          category={selectedCategory}
          onNewSession={handleNewSession}
          onToggleLang={toggleLang}
        />
      )}
    </div>
  );
}
