import React, { useState } from 'react';
import { INTERVIEW_QUESTIONS, CyberInterviewCard } from '../data/interviewData';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Search,
  Send,
  RefreshCw,
  Award,
} from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(INTERVIEW_QUESTIONS[0].id);

  // Mock Viva State
  const [vivaQuestion, setVivaQuestion] = useState<CyberInterviewCard>(INTERVIEW_QUESTIONS[0]);
  const [userVivaAnswer, setUserVivaAnswer] = useState('');
  const [vivaFeedback, setVivaFeedback] = useState<{ score: number; review: string; keywordsFound: string[] } | null>(
    null
  );
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Filter questions
  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase()) ||
      q.keyKeywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesDiff && matchesSearch;
  });

  const categories = ['All', 'Networking', 'Linux & OS', 'Web Security', 'Cryptography', 'Pentesting', 'Blue Team & SOC'];

  const handleEvaluateViva = async () => {
    if (!userVivaAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Question: "${vivaQuestion.question}"\nCandidate Answer: "${userVivaAnswer}"`,
          mode: 'interview',
        }),
      });

      if (!response.ok) throw new Error('API offline');
      const data = await response.json();

      // Local keyword matching to complement
      const lowerAnswer = userVivaAnswer.toLowerCase();
      const matched = vivaQuestion.keyKeywords.filter((k) => lowerAnswer.includes(k.toLowerCase().split(' ')[0]));

      setVivaFeedback({
        score: Math.min(10, Math.max(5, Math.round(5 + (matched.length / vivaQuestion.keyKeywords.length) * 5))),
        review: data.reply || 'Evaluation complete.',
        keywordsFound: matched,
      });
    } catch (err) {
      // Local evaluation fallback
      const lower = userVivaAnswer.toLowerCase();
      const matched = vivaQuestion.keyKeywords.filter((k) => lower.includes(k.toLowerCase().split(' ')[0]));
      const score = Math.min(10, Math.max(4, Math.round(4 + (matched.length / vivaQuestion.keyKeywords.length) * 6)));

      setVivaFeedback({
        score,
        review: `### Viva Evaluation Summary
**Score:** ${score} / 10
**Evaluation:** Your answer demonstrated solid foundational awareness.
**Keywords Mentioned:** ${matched.length > 0 ? matched.join(', ') : 'None of the core technical keywords were detected.'}
**Missing Concepts:** ${vivaQuestion.keyKeywords.filter((k) => !matched.includes(k)).join(', ')}

**Interviewer Recommendation:**
${vivaQuestion.interviewerAdvice}
Make sure to emphasize: "${vivaQuestion.answer.split('\n')[0]}"`,
        keywordsFound: matched,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <Award className="w-4 h-4" />
            <span>Technical Viva & Job Interview Preparation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Cybersecurity Interview & Viva Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Master high-frequency technical questions across networking, OS security, OWASP, cryptography, and pentest methodologies.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Interactive Viva Examiner vs Question Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Viva Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Interactive Mock Viva Simulator</h3>
              <p className="text-[11px] text-slate-400">Practice your response and receive instant examiner feedback.</p>
            </div>
          </div>

          {/* Current Viva Prompt */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider">{vivaQuestion.category}</span>
              <span className="font-mono">{vivaQuestion.difficulty}</span>
            </div>
            <div className="text-slate-100 font-semibold text-sm leading-snug">{vivaQuestion.question}</div>
          </div>

          {/* User Answer Textarea */}
          <div className="space-y-1 flex-1 flex flex-col">
            <label className="text-xs text-slate-400 font-medium">Your Spoken/Written Answer:</label>
            <textarea
              rows={4}
              value={userVivaAnswer}
              onChange={(e) => setUserVivaAnswer(e.target.value)}
              placeholder="Explain the technical concepts, protocol steps, and security mitigations as if speaking to the hiring manager..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed flex-1 min-h-[100px]"
            />
          </div>

          <button
            onClick={handleEvaluateViva}
            disabled={!userVivaAnswer.trim() || isEvaluating}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Examiner is evaluating your answer...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Answer for Viva Evaluation</span>
              </>
            )}
          </button>

          {/* Feedback Card */}
          {vivaFeedback && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200">Examiner Rating:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {vivaFeedback.score} / 10
                </span>
              </div>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {vivaFeedback.review}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Question Bank & Flashcards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Questions Accordion */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded ? 'bg-slate-900 border-slate-700 shadow-md' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span className="text-emerald-400 uppercase font-semibold">{q.category}</span>
                        <span>·</span>
                        <span>{q.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{q.question}</h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                      {/* Model Answer */}
                      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                        <span className="font-semibold text-emerald-400 block mb-1">Model Answer:</span>
                        {q.answer}
                      </div>

                      {/* Keywords */}
                      <div>
                        <span className="font-semibold text-slate-400 block mb-1.5">Key Terminology to Mention:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {q.keyKeywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            >
                              ✓ {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interviewer Advice & Pitfalls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-slate-300">
                          <span className="font-semibold text-emerald-400 block mb-0.5">💡 Interviewer Insight:</span>
                          <p className="leading-relaxed">{q.interviewerAdvice}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-slate-300">
                          <span className="font-semibold text-rose-400 block mb-0.5">⚠️ Pitfall to Avoid:</span>
                          <p className="leading-relaxed">{q.pitfallToAvoid}</p>
                        </div>
                      </div>

                      {/* Button to practice in Mock Viva */}
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            setVivaQuestion(q);
                            setUserVivaAnswer('');
                            setVivaFeedback(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>Load into Mock Viva Simulator</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
