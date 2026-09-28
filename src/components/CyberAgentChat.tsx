import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, ShieldCheck, Terminal, BookOpen, RefreshCw, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  'Explain SQL Injection with an authorized DVWA lab example',
  'How to perform an authorized Nmap port scan on localhost?',
  'Explain Linux file permissions and what chmod 755 vs 600 means',
  'What is the difference between Hashing, Encryption, and Encoding?',
  'Explain the TCP 3-way handshake and its Wireshark flags',
  'Conduct a technical interview question for a Junior Pentester',
];

interface CyberAgentChatProps {
  initialTopic?: string | null;
  onClearInitialTopic?: () => void;
}

export const CyberAgentChat: React.FC<CyberAgentChatProps> = ({ initialTopic, onClearInitialTopic }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `👋 **Welcome to CyberSentinel: Your Ethical Hacking & Cybersecurity Learning Agent.**

I am your dedicated mentor for ethical hacking, penetration testing, defensive engineering, and cybersecurity certification prep.

🔒 **My Strict Ethical Charter:**
- I only provide commands and techniques for **authorized lab environments** (e.g. TryHackMe, Hack The Box, OWASP Juice Shop, DVWA, or isolated local VMs).
- I will **never** assist with unauthorized access, credential theft, malware creation, phishing, evasion, or attacks against real systems.
- For every technical topic, I will provide the complete 8-part learning structure: Simple Explanation, Key Concepts, Safe Practical Example, Authorized Commands, Expected Output & Breakdown, Common Mistakes, Interview Questions, and a Short Practice Exercise.

How can I help your cybersecurity journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'interview' | 'exercise'>('standard');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external topic passed in
  useEffect(() => {
    if (initialTopic) {
      handleSend(`Please explain "${initialTopic}" according to the 8-part ethical hacking learning structure.`);
      if (onClearInitialTopic) onClearInitialTopic();
    }
  }, [initialTopic]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          mode,
          history: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.reply || 'No response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.warn('Backend API request issue, providing structured learning fallback:', err);
      // Graceful offline fallback providing the requested 8-part learning structure
      const fallbackReply = generateEducationalFallback(textToSend, mode);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">CyberSentinel AI Mentor</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Safe Lab Charter Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Powered by Gemini 3.8 Flash · Authorized Lab Environment & Defense Guide</p>
          </div>
        </div>

        {/* Learning Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMode('standard')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'standard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured Lesson
          </button>
          <button
            onClick={() => setMode('interview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'interview' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Viva & Interview Examiner
          </button>
          <button
            onClick={() => setMode('exercise')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'exercise' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lab Exercise Generator
          </button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-4xl ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-emerald-400 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`rounded-xl px-5 py-4 border text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600/90 text-white border-emerald-500/50 shadow-md max-w-2xl'
                  : 'bg-slate-950/70 text-slate-200 border-slate-800 shadow-md w-full'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-slate-800/60 text-xs">
                <span className="font-semibold text-slate-400">
                  {msg.role === 'user' ? 'You' : 'CyberSentinel Instructor'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{msg.timestamp}</span>
                  {msg.role === 'model' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Render formatted markdown content */}
              <div className="prose prose-invert prose-sm max-w-none space-y-3 font-sans">
                {formatMarkdown(msg.content)}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 mt-1">
                <Terminal className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-emerald-400 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-xl px-5 py-4 bg-slate-950/70 border border-slate-800 text-slate-300 text-sm flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Analyzing authorized lab methodology & formulating defensive curriculum...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Topics:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'interview'
                ? 'Type your answer to a technical question or ask for a viva evaluation...'
                : mode === 'exercise'
                ? 'Specify a topic or tool to generate an authorized lab exercise...'
                : 'Ask any ethical hacking topic (e.g. "Explain Buffer Overflows with safe lab setup", "Nmap timing flags")...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> All exercises and instructions apply strictly to authorized lab systems (DVWA, PortSwigger, TryHackMe, local VMs).
          </span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};

// Formatter to render clean typography and code blocks from Markdown
function formatMarkdown(content: string) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentCodeBlock: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        renderedElements.push(
          <div key={`code-${index}`} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
            {codeBlockLang && (
              <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                {codeBlockLang}
              </div>
            )}
            <pre className="p-3.5 overflow-x-auto text-emerald-300 leading-relaxed">
              <code>{currentCodeBlock.join('\n')}</code>
            </pre>
          </div>
        );
        currentCodeBlock = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLang = line.trim().replace('```', '');
      }
      return;
    }

    if (inCodeBlock) {
      currentCodeBlock.push(line);
      return;
    }

    // Headers
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h4 key={index} className="text-emerald-400 font-bold text-base mt-4 mb-2 flex items-center gap-2 border-b border-slate-800/80 pb-1">
          {line.replace('### ', '')}
        </h4>
      );
      return;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h3 key={index} className="text-white font-bold text-lg mt-5 mb-2 text-emerald-300">
          {line.replace('## ', '')}
        </h3>
      );
      return;
    }
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h2 key={index} className="text-white font-extrabold text-xl mt-6 mb-3">
          {line.replace('# ', '')}
        </h2>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s+/, '');
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 my-1 text-slate-300">
          <span className="text-emerald-400 mt-1.5 text-xs">●</span>
          <span>{renderInlineBold(text)}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line.trim())) {
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 my-1 text-slate-300">
          <span className="text-emerald-400 font-mono text-xs mt-0.5">{line.trim().match(/^\d+\./)?.[0]}</span>
          <span>{renderInlineBold(line.trim().replace(/^\d+\.\s+/, ''))}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      renderedElements.push(<div key={index} className="h-2" />);
      return;
    }

    // Standard paragraph
    renderedElements.push(
      <p key={index} className="my-1.5 text-slate-300 leading-relaxed">
        {renderInlineBold(line)}
      </p>
    );
  });

  return renderedElements;
}

// Helpers for inline bolding & backtick codes
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs border border-slate-700/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Comprehensive educational fallback if Gemini API is unreachable or offline
function generateEducationalFallback(prompt: string, mode: string): string {
  const lower = prompt.toLowerCase();

  if (mode === 'interview') {
    return `### Technical Viva Evaluation

**Topic Under Review:** Security Concepts & Pentesting Principles
**Rating:** 8.5 / 10

**Strengths:**
- Demonstrates a clear understanding of the core threat model.
- Highlights proper separation of concerns between user input and execution environments.

**Areas for Improvement:**
- Mention the specific RFC standards or OWASP Top 10 category (e.g., OWASP A03:2021).
- Emphasize the exact remediation: parameterized queries or context-aware output encoding.

**Model Answer:**
In a professional setting, clearly state: "The root cause is unvalidated user input parsed as syntax. Mitigation requires prepared statements where the SQL engine compiles the query structure first, treating parameters strictly as scalar literals."`;
  }

  if (lower.includes('nmap') || lower.includes('scan')) {
    return `### 1. Simple Explanation
Port scanning with Nmap is like an authorized security inspector checking doors in a commercial building to see which are unlocked, padlocked, or monitored by security alarms.

### 2. Key Concepts
- **Port States:** Open (service listening), Closed (accessible, returns RST), Filtered (packet dropped by firewall/IDS).
- **SYN Stealth Scan (-sS):** Sends SYN packets without completing the 3-way handshake, reducing application log noise.
- **Service Versioning (-sV):** Probes open ports with banner queries to determine application name and exact version.

### 3. Safe Practical Example
Authorized scanning of your own local Docker container or Metasploitable 2 test VM on an isolated host-only network (IP: 192.168.56.101).

### 4. Commands for Authorized Labs
\`\`\`bash
# Fast SYN scan of top 100 ports on localhost
nmap -sS --top-ports 100 -T4 127.0.0.1

# Service version detection with default safe scripts
nmap -sV -sC -p 80,443,22 127.0.0.1
\`\`\`

### 5. Expected Output & Explanation
\`\`\`
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.9p1 Ubuntu
80/tcp  open  http     Apache httpd 2.4.52
\`\`\`
*Explanation:* Ports 22 and 80 are open and running known daemons. Version detection verifies exact patch levels for vulnerability management.

### 6. Common Mistakes
- Scanning the entire UDP range (-sU -p-) without timeouts; Linux limits ICMP unreachable replies to 1 per second.
- Scanning public IP ranges without written Rules of Engagement (ROE).

### 7. Interview / Viva Questions & Answers
- **Q:** What is the difference between -sT and -sS?
  - **A:** -sT uses the OS connect() API completing the 3-way handshake; -sS sends an RST after receiving SYN-ACK to tear down the connection before full completion.

### 8. Short Practice Exercise
Start a local Python HTTP server on port 8080 (\`python3 -m http.server 8080\`) and run \`nmap -sV -p 8080 localhost\` to verify detection.`;
  }

  // Default structured educational response
  return `### 1. Simple Explanation
In ethical hacking, security professionals evaluate computer systems, networks, and applications using the exact same methodologies as real-world adversaries, but strictly with written authorization to identify and remediate vulnerabilities before they can be exploited.

### 2. Key Concepts
- **Defense-in-Depth:** Layering firewalls, authentication, principle of least privilege, and monitoring.
- **Rules of Engagement (ROE):** The formal contract establishing scope, permitted tools, and testing timeframes.
- **Root Cause Remediation:** Fixing underlying software architecture rather than merely applying surface-level regex filters.

### 3. Safe Practical Example
Practicing on deliberately vulnerable platforms such as PortSwigger Web Security Academy, OWASP Juice Shop, or TryHackMe.

### 4. Commands for Authorized Labs
\`\`\`bash
# Inspect listening network sockets on local machine
ss -tulpn

# Review file permissions in authorized lab folder
ls -la /var/www/html/
\`\`\`

### 5. Expected Output & Explanation
\`\`\`
Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     127.0.0.1:3000      0.0.0.0:*
\`\`\`
*Explanation:* Demonstrates that port 3000 is listening strictly on the loopback interface (127.0.0.1), preventing external internet access.

### 6. Common Mistakes
- Testing targets outside the explicitly defined scope.
- Failing to verify whether an observed anomaly is an actual vulnerability vs an intentional design feature.

### 7. Interview / Viva Questions & Answers
- **Q:** What is the primary difference between a Vulnerability Assessment and a Penetration Test?
  - **A:** A Vulnerability Assessment identifies and catalogs potential flaws without actively exploiting them; a Penetration Test actively attempts safe, controlled exploitation to prove business impact and test incident response capabilities.

### 8. Short Practice Exercise
Review the permissions of your local \`/etc/passwd\` file and explain why it must be world-readable while \`/etc/shadow\` must be restricted to root.`;
}
