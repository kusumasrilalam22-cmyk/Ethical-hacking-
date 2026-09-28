import React, { useState } from 'react';
import { CURRICULUM_TOPICS } from '../data/curriculumData';
import { CurriculumTopic, CategoryId } from '../types/cyber';
import {
  BookOpen,
  Search,
  Terminal,
  Shield,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface CurriculumViewerProps {
  onSelectTopicForChat?: (topicTitle: string) => void;
}

const CATEGORIES: { id: CategoryId | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Modules', icon: '🌐' },
  { id: 'networking', label: 'Networking', icon: '📡' },
  { id: 'linux', label: 'Linux Security', icon: '🐧' },
  { id: 'web', label: 'OWASP Web Security', icon: '🛡️' },
  { id: 'cryptography', label: 'Cryptography & PKI', icon: '🔐' },
  { id: 'auth', label: 'Authentication & Access', icon: '🔑' },
  { id: 'tools', label: 'Security Tools', icon: '🛠️' },
];

export const CurriculumViewer: React.FC<CurriculumViewerProps> = ({ onSelectTopicForChat }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(CURRICULUM_TOPICS[0].id);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState<number | null>(0);

  // Filter topics
  const filteredTopics = CURRICULUM_TOPICS.filter((topic) => {
    const matchesCategory = selectedCategory === 'all' || topic.categoryId === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentTopic: CurriculumTopic =
    CURRICULUM_TOPICS.find((t) => t.id === selectedTopicId) || CURRICULUM_TOPICS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[750px]">
      {/* Sidebar: Categories & Topic List */}
      <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4">
        {/* Category Filter Pills (Functional Buttons) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
            <span>Security Domains</span>
            <span className="text-[11px] font-mono text-slate-500">{CURRICULUM_TOPICS.length} Lessons</span>
          </div>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {cat.id === 'all'
                    ? CURRICULUM_TOPICS.length
                    : CURRICULUM_TOPICS.filter((t) => t.categoryId === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts, tools, CWEs..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Topic List */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 overflow-y-auto max-h-[500px] space-y-1">
          {filteredTopics.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No lessons match your search criteria.</div>
          ) : (
            filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setShowSolution(false);
                }}
                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                  selectedTopicId === topic.id
                    ? 'bg-slate-800 border border-emerald-500/40 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    {topic.categoryId}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      topic.difficulty === 'Beginner'
                        ? 'bg-blue-500/10 text-blue-400'
                        : topic.difficulty === 'Intermediate'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-1">{topic.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{topic.summary}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area: 8-Part Structured Learning Guide */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        {/* Topic Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
              <span className="uppercase font-semibold tracking-wider text-emerald-400">{currentTopic.categoryId}</span>
              <span>·</span>
              <span className="text-slate-400">{currentTopic.difficulty} Level</span>
              <span>·</span>
              <span>Safe Lab Training</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{currentTopic.title}</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">{currentTopic.summary}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {currentTopic.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {onSelectTopicForChat && (
            <button
              onClick={() => onSelectTopicForChat(currentTopic.title)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Cyber Agent</span>
            </button>
          )}
        </div>

        {/* 8-Part Structured Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {/* Section 1: Simple Explanation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>1. Simple Explanation</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm leading-relaxed">
              {currentTopic.simpleExplanation}
            </div>
          </div>

          {/* Section 2: Key Concepts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>2. Key Concepts & Architecture</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTopic.keyConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{concept}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Safe Practical Example */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>3. Safe Practical Example (Authorized Lab Setting)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <span className="font-semibold text-slate-200">
                  Scenario: {currentTopic.safePracticalExample.scenario}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                  {currentTopic.safePracticalExample.labEnvironment}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{currentTopic.safePracticalExample.walkthrough}</p>
            </div>
          </div>

          {/* Section 4: Authorized Commands */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Terminal className="w-4 h-4" />
              <span>4. Commands for Authorized Labs</span>
            </div>
            <div className="space-y-3">
              {currentTopic.authorizedCommands.map((cmd, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{cmd.explanation}</span>
                    <button
                      onClick={() => handleCopy(cmd.command)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Copy command"
                    >
                      {copiedCommand === cmd.command ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3.5 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <code>{cmd.command}</code>
                  </div>
                  {cmd.flagsExplanation && (
                    <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-400">Flags Breakdown:</span> {cmd.flagsExplanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Expected Output & Line-by-Line Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Code2 className="w-4 h-4" />
              <span>5. Expected Output & Explanation</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                Command: {currentTopic.expectedOutput.command}
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {currentTopic.expectedOutput.rawOutput}
              </pre>
              <div className="p-4 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400 block mb-1">Analysis & Meaning:</span>
                {currentTopic.expectedOutput.breakdown}
              </div>
            </div>
          </div>

          {/* Section 6: Common Mistakes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>6. Common Mistakes & How to Avoid Them</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTopic.commonMistakes.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                    <span>❌ Mistake:</span>
                    <span>{item.mistake}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed pl-4 border-l-2 border-emerald-500/40">
                    <span className="text-emerald-400 font-medium">Fix: </span>
                    {item.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Interview / Viva Questions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>7. Interview & Viva Questions</span>
            </div>
            <div className="space-y-2">
              {currentTopic.interviewQuestions.map((iq, idx) => {
                const isOpen = expandedInterviewIdx === idx;
                return (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
                    <button
                      onClick={() => setExpandedInterviewIdx(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-semibold text-slate-200 hover:text-emerald-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono">Q{idx + 1}:</span>
                        <span>{iq.question}</span>
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1 bg-slate-900/30">
                        <span className="font-semibold text-emerald-400 block mb-1">Model Answer:</span>
                        {iq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 8: Short Practice Exercise */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Flame className="w-4 h-4" />
              <span>8. Short Hands-On Practice Exercise</span>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">{currentTopic.practiceExercise.title}</span>
                <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hands-On Challenge
                </span>
              </div>
              <div className="text-slate-300">
                <span className="font-semibold text-slate-400">Objective: </span>
                {currentTopic.practiceExercise.objective}
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400 block mb-1">Lab Instructions:</span>
                {currentTopic.practiceExercise.safeLabInstructions}
              </div>
              <div className="text-slate-400 text-[11px] italic">
                💡 <span className="font-semibold">Hint:</span> {currentTopic.practiceExercise.hint}
              </div>

              {/* Reveal Solution Toggle */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center gap-2"
                >
                  <span>{showSolution ? 'Hide Solution & Walkthrough' : 'Reveal Solution & Verification'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {showSolution && (
                  <div className="mt-3 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-slate-200 leading-relaxed">
                    <span className="font-semibold text-emerald-400 block mb-1">Verified Solution:</span>
                    <pre className="font-sans whitespace-pre-wrap">{currentTopic.practiceExercise.solution}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
