export default function ChatBubble({ role, content, t, isNew }) {
  const isPatient = role === 'patient';

  return (
    <div
      className={`flex items-end gap-2.5 animate-slide-up ${isPatient ? 'justify-start' : 'justify-end'}`}
    >
      {isPatient && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm shadow">
          🧑‍⚕️
        </div>
      )}

      <div className={`max-w-[75%] ${isPatient ? '' : 'items-end flex flex-col'}`}>
        <div className={`text-[11px] font-medium mb-1 ${isPatient ? 'text-slate-500 ml-1' : 'text-indigo-500 mr-1'}`}>
          {isPatient ? t.patient : t.student}
        </div>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isPatient
              ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm shadow'
          }`}
        >
          {content}
        </div>
      </div>

      {!isPatient && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm shadow">
          👨‍⚕️
        </div>
      )}
    </div>
  );
}
