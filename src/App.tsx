import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Bot,
  Terminal as TerminalIcon,
  ShieldAlert,
  FileText,
  Award,
  Scale,
  Sparkles,
  Lock,
} from 'lucide-react';
import { CyberAgentChat } from './components/CyberAgentChat';
import { CurriculumViewer } from './components/CurriculumViewer';
import { TerminalSimulator } from './components/TerminalSimulator';
import { VulnerabilityLab } from './components/VulnerabilityLab';
import { ReportBuilder } from './components/ReportBuilder';
import { InterviewPrep } from './components/InterviewPrep';
import { LegalDirectory } from './components/LegalDirectory';

type ActiveTab =
  | 'curriculum'
  | 'agent'
  | 'terminal'
  | 'vulnlab'
  | 'report'
  | 'interview'
  | 'legal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('curriculum');
  const [agentTopic, setAgentTopic] = useState<string | null>(null);

  const handleAskAgentAboutTopic = (topicTitle: string) => {
    setAgentTopic(topicTitle);
    setActiveTab('agent');
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'curriculum', label: 'Curriculum & Concepts', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'agent', label: 'Cyber Learning Agent', icon: <Bot className="w-4 h-4" /> },
    { id: 'terminal', label: 'Lab Terminal Sandbox', icon: <TerminalIcon className="w-4 h-4" /> },
    { id: 'vulnlab', label: 'Vulnerability vs Defense', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'report', label: 'Pentest Report & CVSS', icon: <FileText className="w-4 h-4" /> },
    { id: 'interview', label: 'Interview & Viva Prep', icon: <Award className="w-4 h-4" /> },
    { id: 'legal', label: 'Legal & Safe Labs', icon: <Scale className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">
                    CYBER<span className="text-emerald-400">SENTINEL</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Lock className="w-3 h-3" /> Ethical Academy
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Ethical Hacking, Penetration Testing & Defensive Engineering
                </p>
              </div>
            </div>

            {/* Quick Safety Badge */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Authorized Lab Sandbox</span>
              </div>
              <button
                onClick={() => setActiveTab('legal')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
              >
                Safe Harbor Rules
              </button>
            </div>
          </div>

          {/* Navigation Bar / Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-800/60 no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'curriculum' && (
          <CurriculumViewer onSelectTopicForChat={handleAskAgentAboutTopic} />
        )}

        {activeTab === 'agent' && (
          <CyberAgentChat
            initialTopic={agentTopic}
            onClearInitialTopic={() => setAgentTopic(null)}
          />
        )}

        {activeTab === 'terminal' && <TerminalSimulator />}

        {activeTab === 'vulnlab' && <VulnerabilityLab />}

        {activeTab === 'report' && <ReportBuilder />}

        {activeTab === 'interview' && <InterviewPrep />}

        {activeTab === 'legal' && <LegalDirectory />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">CyberSentinel Academy</span>
            <span>·</span>
            <span>Dedicated to Ethical Security Education & Authorized Defense</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Compliant with CFAA, PTES, and NIST SP 800-115 Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
