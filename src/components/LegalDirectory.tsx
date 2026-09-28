import React, { useState } from 'react';
import { LEGAL_PLATFORMS, ETHICAL_HACKING_CHARTER } from '../data/legalLabData';
import {
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Terminal,
  FileCheck,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  Server,
} from 'lucide-react';

const SAMPLE_ROE_TEMPLATE = `PERMISSION TO PERFORM SECURITY ASSESSMENT & RULES OF ENGAGEMENT (ROE)

1. AUTHORIZATION & SCOPE:
   Client ("Asset Owner"): LabCorp Systems Inc.
   Assessor ("Authorized Tester"): Senior Security Analyst
   Authorized Timeframe: October 1, 2026 00:00 UTC through October 7, 2026 23:59 UTC
   
   Explicitly IN-SCOPE Targets:
   - https://staging.example.lab (Web Application)
   - 192.168.56.101/32 (Isolated Staging Host)
   
   Explicitly OUT-OF-SCOPE Targets:
   - Any production server or production database (*.prod.example.com)
   - Third-party SaaS providers (e.g. AWS Console, Cloudflare CDN, Stripe gateway)
   - Denial of Service (DoS/DDoS) testing
   - Phishing or Social Engineering against employees

2. SAFE HARBOR PLEDGE:
   The Asset Owner affirms they own and control all targets listed in Section 1. 
   Testing conducted strictly within the authorized boundaries shall not constitute
   unauthorized access under the Computer Fraud and Abuse Act (CFAA) or state computer crime statutes.

3. EMERGENCY ESCALATION CONTACTS:
   Security Operations Center: soc@example.lab | +1-555-0199
   Incident Response Lead: ir-lead@example.lab`;

export const LegalDirectory: React.FC = () => {
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleCopyROE = () => {
    navigator.clipboard.writeText(SAMPLE_ROE_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Frameworks & Safe Training Environments</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Legal Practice Platforms & Ethical Charter</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ethical hacking is defined strictly by written authorization. Practice only on systems you own or authorized platforms.
          </p>
        </div>
      </div>

      {/* Core Rules of Engagement */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>The Ethical Hacker Code of Conduct</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ETHICAL_HACKING_CHARTER.coreRules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 block text-sm">
                0{idx + 1}. {rule.title}
              </span>
              <p className="text-slate-300 leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Statutes Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>International Computer Crime Legislation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {ETHICAL_HACKING_CHARTER.legalStatutes.map((statute, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 block leading-snug">{statute.name}</span>
              <p className="text-slate-400 leading-relaxed">{statute.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Legal Training Platforms Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Authorized Practice Platforms & Intentionally Vulnerable Apps</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">100% Legal & Safe</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEGAL_PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono uppercase font-semibold text-emerald-400">
                    {platform.category}
                  </span>
                  {platform.freeTier && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Free Tier Available
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-100">{platform.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{platform.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Recommended For:</span>
                  <span className="text-slate-300 text-[11px]">{platform.recommendedFor}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Safety Notice: </span>
                  {platform.legalNotice}
                </div>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Visit Platform</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Home Lab Architecture Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Building an Isolated Local Home Lab</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          When practicing penetration testing on your own computer, never expose deliberately vulnerable virtual machines to your public home Wi-Fi. Follow the 4-step isolated host-only setup:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {ETHICAL_HACKING_CHARTER.labSetupGuide.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-xs">{step.step}</span>
              <p className="text-slate-400 leading-relaxed">{step.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rules of Engagement (ROE) Template */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Rules of Engagement (ROE) Template</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every authorized engagement requires documented written permission prior to scanning.
            </p>
          </div>
          <button
            onClick={handleCopyROE}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTemplate ? 'Copied Template' : 'Copy ROE Template'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
          {SAMPLE_ROE_TEMPLATE}
        </pre>
      </div>
    </div>
  );
};
