export default function ProgressBar({ watched, total, darkMode }: { watched: number; total: number; darkMode: boolean }) {
  const pct = total === 0 ? 0 : Math.round((watched / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div className="h-full rounded-full bg-gradient-to-r from-[#232999] to-[#d99a2b] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{watched}/{total}</span>
    </div>
  );
}
