import { useState } from 'react';
import type { EspaceSection, QuizQuestion } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizResult } from '../../utils/progress';

type Phase = 'idle' | 'summary' | 'answering' | 'result';

const T: Record<Locale, {
  title: string; bestScore: (score: number, total: number) => string;
  start: (count: number) => string;
  retry: string; submit: string; submitting: string;
  scoreResult: (score: number, total: number) => string;
  saveError: string;
}> = {
  FR: {
    title: 'Quiz de la section',
    bestScore: (s, t) => `Votre meilleur score : ${s}/${t}`,
    start: (n) => `Commencer le quiz (${n} question${n > 1 ? 's' : ''})`,
    retry: 'Refaire le quiz',
    submit: 'Valider mes réponses', submitting: 'Envoi…',
    scoreResult: (s, t) => `${s}/${t} bonnes réponses`,
    saveError: "Le score n'a pas pu être enregistré. Votre correction reste visible ci-dessous ; réessayez plus tard.",
  },
  EN: {
    title: 'Section quiz',
    bestScore: (s, t) => `Your best score: ${s}/${t}`,
    start: (n) => `Start the quiz (${n} question${n > 1 ? 's' : ''})`,
    retry: 'Retry the quiz',
    submit: 'Submit my answers', submitting: 'Submitting…',
    scoreResult: (s, t) => `${s}/${t} correct answers`,
    saveError: 'Your score could not be saved. The correction below is still shown; please try again later.',
  },
  DE: {
    title: 'Quiz zum Abschnitt',
    bestScore: (s, t) => `Ihr bestes Ergebnis: ${s}/${t}`,
    start: (n) => `Quiz starten (${n} Frage${n > 1 ? 'n' : ''})`,
    retry: 'Quiz wiederholen',
    submit: 'Antworten absenden', submitting: 'Wird gesendet…',
    scoreResult: (s, t) => `${s}/${t} richtige Antworten`,
    saveError: 'Das Ergebnis konnte nicht gespeichert werden. Die Korrektur unten bleibt sichtbar; versuchen Sie es später erneut.',
  },
};

function scoreOf(quiz: { questions: QuizQuestion[] }, answers: Record<string, Set<string>>): number {
  let score = 0;
  for (const q of quiz.questions) {
    const selected = answers[q.id] || new Set<string>();
    const correct = new Set(q.correctOptionIds);
    if (selected.size === correct.size && [...selected].every(id => correct.has(id))) score++;
  }
  return score;
}

export default function QuizBlock({ section, darkMode, currentLang }: {
  section: EspaceSection;
  darkMode: boolean;
  currentLang: Locale;
}) {
  const { progress, submitQuizResult } = useAuth();
  const t = T[currentLang];
  const quiz = section.quiz;
  const bestResult = getQuizResult(progress, section);

  const [phase, setPhase] = useState<Phase>(bestResult ? 'summary' : 'idle');
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [saveError, setSaveError] = useState(false);

  if (!quiz) return null;

  const toggleOption = (question: QuizQuestion, optionId: string) => {
    setAnswers(prev => {
      const current = new Set(prev[question.id] || []);
      if (question.multiple) {
        if (current.has(optionId)) current.delete(optionId); else current.add(optionId);
      } else {
        current.clear();
        current.add(optionId);
      }
      return { ...prev, [question.id]: current };
    });
  };

  const allAnswered = quiz.questions.every(q => (answers[q.id]?.size ?? 0) > 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSaveError(false);
    const score = scoreOf(quiz, answers);
    try {
      await submitQuizResult(section.key, score, quiz.questions.length);
    } catch {
      setSaveError(true);
    }
    setLastScore(score);
    setPhase('result');
    setSubmitting(false);
  };

  const restart = () => {
    setAnswers({});
    setSaveError(false);
    setPhase('answering');
  };

  const cardClass = `p-6 rounded-2xl border-2 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`;

  return (
    <div className="mb-8">
      <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.title}</h3>

      {phase === 'idle' ? (
        <div className={cardClass}>
          <button type="button" onClick={() => setPhase('answering')} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#232999] to-indigo-600 hover:shadow-lg transition-all cursor-pointer">
            <i className="ri-play-fill"></i>{t.start(quiz.questions.length)}
          </button>
        </div>
      ) : phase === 'summary' && bestResult ? (
        <div className={`${cardClass} flex items-center justify-between flex-wrap gap-4`}>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.bestScore(bestResult.bestScoreCount, bestResult.totalQuestions)}</p>
          <button type="button" onClick={restart} className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-colors cursor-pointer ${darkMode ? 'border-indigo-400 text-indigo-400 hover:bg-indigo-900/20' : 'border-[#232999] text-[#232999] hover:bg-indigo-50'}`}>
            {t.retry}
          </button>
        </div>
      ) : phase === 'answering' ? (
        <div className={cardClass}>
          <div className="space-y-6">
            {quiz.questions.map((q, qIndex) => (
              <div key={q.id}>
                <p className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{qIndex + 1}. {q.prompt[currentLang]}</p>
                <div className="space-y-2">
                  {q.options.map(option => {
                    const selected = answers[q.id]?.has(option.id) ?? false;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleOption(q, option.id)}
                        className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm transition-colors cursor-pointer ${
                          selected
                            ? darkMode ? 'border-indigo-400 bg-indigo-900/20 text-white' : 'border-[#232999] bg-indigo-50 text-gray-900'
                            : darkMode ? 'border-gray-700 text-gray-300 hover:border-gray-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <i className={selected ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
                        {option.label[currentLang]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="mt-6 bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </div>
      ) : (
        <div className={cardClass}>
          <p className={`text-lg font-bold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.scoreResult(lastScore, quiz.questions.length)}</p>

          {saveError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <i className="ri-error-warning-line mr-1"></i>{t.saveError}
            </div>
          )}

          <div className="space-y-6">
            {quiz.questions.map((q, qIndex) => {
              const selected = answers[q.id] || new Set<string>();
              const correct = new Set(q.correctOptionIds);
              return (
                <div key={q.id}>
                  <p className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{qIndex + 1}. {q.prompt[currentLang]}</p>
                  <div className="space-y-2">
                    {q.options.map(option => {
                      const isCorrect = correct.has(option.id);
                      const wasSelected = selected.has(option.id);
                      const state = isCorrect ? 'correct' : wasSelected ? 'incorrect' : 'neutral';
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm ${
                            state === 'correct'
                              ? darkMode ? 'border-emerald-700 bg-emerald-900/20 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : state === 'incorrect'
                              ? darkMode ? 'border-red-800 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
                              : darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                          }`}
                        >
                          <i className={state === 'correct' ? 'ri-checkbox-circle-fill' : state === 'incorrect' ? 'ri-error-warning-line' : 'ri-checkbox-blank-circle-line'}></i>
                          {option.label[currentLang]}
                        </div>
                      );
                    })}
                  </div>
                  {q.feedback && (
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <i className="ri-information-line mr-1"></i>{q.feedback[currentLang]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button type="button" onClick={restart} className={`mt-6 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-colors cursor-pointer ${darkMode ? 'border-indigo-400 text-indigo-400 hover:bg-indigo-900/20' : 'border-[#232999] text-[#232999] hover:bg-indigo-50'}`}>
            {t.retry}
          </button>
        </div>
      )}
    </div>
  );
}
