import React, { useState } from 'react';
import { Finding, PentestReport, CvssMetrics } from '../types/cyber';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Calculator,
  Shield,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  Edit3,
} from 'lucide-react';

const INITIAL_REPORT: PentestReport = {
  clientName: 'LabCorp Global / Staging Testbed',
  assessmentType: 'Web Application & API Penetration Test',
  assessorName: 'Senior Security Analyst (Certified Ethical Hacker)',
  date: 'September 2026',
  executiveSummary:
    'During the authorized security assessment of the LabCorp staging environment conducted between Sep 20 and Sep 26, 2026, the assessment team identified a total of 3 findings: 1 Critical, 1 High, and 1 Medium risk. The primary concern is an unauthenticated SQL injection on the product search endpoint which allows arbitrary database data extraction. Immediate remediation through parameterized queries is recommended before production promotion.',
  scope: [
    'https://staging-app.labcorp.internal (Web Application)',
    'https://staging-api.labcorp.internal/v1/* (REST API)',
    '10.0.2.15/32 (Isolated Lab Gateway)',
  ],
  rulesOfEngagement:
    'Testing was performed strictly within the agreed maintenance window (02:00 - 06:00 UTC). DoS testing, mass credential stuffing, and modification of production data were strictly out of scope. Written authorization was verified prior to test initiation.',
  findings: [
    {
      id: 'FIND-001',
      title: 'Unauthenticated SQL Injection in Product Search API',
      severity: 'Critical',
      cvssScore: 9.8,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      affectedAsset: 'https://staging-api.labcorp.internal/v1/products?search=',
      cwe: 'CWE-89: SQL Injection',
      description:
        'The search parameter is concatenated directly into a dynamic SQL query without parameter binding or input sanitization. An external unauthenticated attacker can supply boolean and UNION SQL payloads to dump customer records, credentials, and internal database tables.',
      reproductionSteps:
        '1. Send HTTP GET to `/v1/products?search=\' UNION SELECT id, username, password_hash FROM users --`\n2. Observe that the API returns the entire user credential table in the response JSON.',
      businessImpact:
        'Total loss of confidentiality and integrity of all backend database records, regulatory non-compliance under GDPR/HIPAA, and potential database server compromise.',
      remediation:
        'Refactor the database queries to use parameterized queries (prepared statements). Enforce least privilege on the database user account so the application cannot read system schemas.',
    },
    {
      id: 'FIND-002',
      title: 'Insecure Direct Object Reference (IDOR) on Invoices Endpoint',
      severity: 'High',
      cvssScore: 7.5,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N',
      affectedAsset: 'https://staging-app.labcorp.internal/api/invoices/{id}',
      cwe: 'CWE-639: Authorization Bypass Through User-Controlled Key',
      description:
        'The invoices API verifies that the requester is an authenticated user, but fails to verify that the requesting user owns the requested invoice ID. By iterating sequential integers, any user can download invoices belonging to other corporate clients.',
      reproductionSteps:
        '1. Log in as test user A (ID: 1042).\n2. Send request to `/api/invoices/1041` (belonging to User B).\n3. Server returns User B invoice with HTTP 200 OK.',
      businessImpact:
        'Confidential corporate pricing, customer names, and banking transaction histories are exposed to competitor accounts.',
      remediation:
        'Implement server-side authorization checks verifying that the requested invoice belongs to the authenticated user organization before returning data.',
    },
    {
      id: 'FIND-003',
      title: 'Missing Content-Security-Policy & Anti-Clickjacking Headers',
      severity: 'Medium',
      cvssScore: 5.3,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N',
      affectedAsset: 'https://staging-app.labcorp.internal/*',
      cwe: 'CWE-1021: Improper Restriction of Rendered UI Layers',
      description:
        'The web application does not return Content-Security-Policy (CSP) or X-Frame-Options HTTP response headers, leaving the application susceptible to UI redressing (Clickjacking) attacks.',
      reproductionSteps:
        '1. Inspect HTTP response headers using curl: `curl -I https://staging-app.labcorp.internal`\n2. Note the absence of `X-Frame-Options` and `Content-Security-Policy`.',
      businessImpact:
        'An attacker could frame the application inside a transparent iframe on a malicious website, tricking users into clicking unauthorized actions.',
      remediation:
        'Configure the web server to return `Content-Security-Policy: frame-ancestors \'none\';` and `X-Frame-Options: DENY`.',
    },
  ],
};

export const ReportBuilder: React.FC = () => {
  const [report, setReport] = useState<PentestReport>(INITIAL_REPORT);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'cvss'>('editor');
  const [copied, setCopied] = useState(false);

  // CVSS Calculator State
  const [cvss, setCvss] = useState<CvssMetrics>({
    attackVector: 'N',
    attackComplexity: 'L',
    privilegesRequired: 'N',
    userInteraction: 'N',
    scope: 'U',
    confidentiality: 'H',
    integrity: 'H',
    availability: 'H',
  });

  // Calculate CVSS 3.1 Base Score accurately
  const calculateCvssScore = (metrics: CvssMetrics): { score: number; vector: string; severity: string } => {
    const avScores = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
    const acScores = { L: 0.77, H: 0.44 };
    const prScores = {
      U: { N: 0.85, L: 0.62, H: 0.27 },
      C: { N: 0.85, L: 0.68, H: 0.5 },
    };
    const uiScores = { N: 0.85, R: 0.62 };
    const cScores = { H: 0.56, L: 0.22, N: 0 };
    const iScores = { H: 0.56, L: 0.22, N: 0 };
    const aScores = { H: 0.56, L: 0.22, N: 0 };

    const av = avScores[metrics.attackVector];
    const ac = acScores[metrics.attackComplexity];
    const pr = prScores[metrics.scope][metrics.privilegesRequired];
    const ui = uiScores[metrics.userInteraction];

    const c = cScores[metrics.confidentiality];
    const i = iScores[metrics.integrity];
    const a = aScores[metrics.availability];

    const iss = 1 - (1 - c) * (1 - i) * (1 - a);
    let impact = 0;
    if (metrics.scope === 'U') {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    const exploitability = 8.22 * av * ac * pr * ui;

    let score = 0;
    if (impact <= 0) {
      score = 0;
    } else if (metrics.scope === 'U') {
      score = Math.min(10, Math.ceil((impact + exploitability) * 10) / 10);
    } else {
      score = Math.min(10, Math.ceil((1.08 * (impact + exploitability)) * 10) / 10);
    }

    let severity = 'None';
    if (score >= 9.0) severity = 'Critical';
    else if (score >= 7.0) severity = 'High';
    else if (score >= 4.0) severity = 'Medium';
    else if (score >= 0.1) severity = 'Low';

    const vector = `CVSS:3.1/AV:${metrics.attackVector}/AC:${metrics.attackComplexity}/PR:${metrics.privilegesRequired}/UI:${metrics.userInteraction}/S:${metrics.scope}/C:${metrics.confidentiality}/I:${metrics.integrity}/A:${metrics.availability}`;

    return { score, vector, severity };
  };

  const currentCvssCalc = calculateCvssScore(cvss);

  // New Finding form state
  const [newFinding, setNewFinding] = useState<Partial<Finding>>({
    title: '',
    severity: 'Medium',
    cvssScore: 5.3,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
    affectedAsset: '',
    cwe: 'CWE-200: Exposure of Sensitive Information',
    description: '',
    reproductionSteps: '',
    businessImpact: '',
    remediation: '',
  });

  const handleAddFinding = () => {
    if (!newFinding.title || !newFinding.description) return;
    const item: Finding = {
      id: `FIND-${String(report.findings.length + 1).padStart(3, '0')}`,
      title: newFinding.title || 'Untitled Finding',
      severity: (newFinding.severity as any) || 'Medium',
      cvssScore: newFinding.cvssScore || 5.0,
      cvssVector: newFinding.cvssVector || 'CVSS:3.1/...',
      affectedAsset: newFinding.affectedAsset || 'In-scope Asset',
      cwe: newFinding.cwe || 'CWE-Unknown',
      description: newFinding.description || '',
      reproductionSteps: newFinding.reproductionSteps || '',
      businessImpact: newFinding.businessImpact || '',
      remediation: newFinding.remediation || '',
    };

    setReport((prev) => ({
      ...prev,
      findings: [...prev.findings, item],
    }));

    setNewFinding({
      title: '',
      severity: 'Medium',
      cvssScore: 5.3,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
      affectedAsset: '',
      cwe: 'CWE-200: Exposure of Sensitive Information',
      description: '',
      reproductionSteps: '',
      businessImpact: '',
      remediation: '',
    });
  };

  const handleDeleteFinding = (id: string) => {
    setReport((prev) => ({
      ...prev,
      findings: prev.findings.filter((f) => f.id !== id),
    }));
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownReport(report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Penetration-Testing-Report-${report.clientName.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const md = generateMarkdownReport(report);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <FileText className="w-4 h-4" />
            <span>NIST SP 800-115 & PTES Compliant</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Professional Pentest Report Builder</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Document findings, calculate CVSS 3.1 scores, and export client-ready penetration test deliverables.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'editor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Findings Editor ({report.findings.length})
          </button>
          <button
            onClick={() => setActiveTab('cvss')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'cvss'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            CVSS 3.1 Calculator
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Full Report Preview
          </button>
        </div>
      </div>

      {/* CVSS 3.1 CALCULATOR TAB */}
      {activeTab === 'cvss' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <span>CVSS v3.1 Base Metrics Calculator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Common Vulnerability Scoring System (CVSS) calculates standardized risk ratings for security vulnerabilities.
              </p>
            </div>

            {/* Score Display Card */}
            <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className="text-xs text-slate-400">Base Score</div>
                <div className="text-2xl font-black font-mono text-emerald-400">{currentCvssCalc.score.toFixed(1)}</div>
              </div>
              <div
                className={`px-3 py-1 rounded text-xs font-bold font-mono uppercase ${
                  currentCvssCalc.severity === 'Critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : currentCvssCalc.severity === 'High'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : currentCvssCalc.severity === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {currentCvssCalc.severity}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Attack Vector */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Attack Vector (AV)</span>
              <div className="space-y-1">
                {[
                  { id: 'N', label: 'Network (Remote web/internet)' },
                  { id: 'A', label: 'Adjacent (Same LAN/Wi-Fi)' },
                  { id: 'L', label: 'Local (Requires local shell)' },
                  { id: 'P', label: 'Physical (Hardware access)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, attackVector: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.attackVector === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Attack Complexity */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Attack Complexity (AC)</span>
              <div className="space-y-1">
                {[
                  { id: 'L', label: 'Low (Repeatable, no race conditions)' },
                  { id: 'H', label: 'High (Special timing / conditions)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, attackComplexity: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.attackComplexity === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privileges Required */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Privileges Required (PR)</span>
              <div className="space-y-1">
                {[
                  { id: 'N', label: 'None (Unauthenticated attacker)' },
                  { id: 'L', label: 'Low (Standard user account)' },
                  { id: 'H', label: 'High (Administrator privileges)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, privilegesRequired: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.privilegesRequired === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Interaction */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">User Interaction (UI)</span>
              <div className="space-y-1">
                {[
                  { id: 'N', label: 'None (No user click required)' },
                  { id: 'R', label: 'Required (Victim must click/visit)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, userInteraction: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.userInteraction === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Scope (S)</span>
              <div className="space-y-1">
                {[
                  { id: 'U', label: 'Unchanged (Impacts vulnerable component only)' },
                  { id: 'C', label: 'Changed (Escapes sandbox/VM/origin)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, scope: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.scope === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidentiality Impact */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Confidentiality (C)</span>
              <div className="space-y-1">
                {[
                  { id: 'H', label: 'High (Total database/file leak)' },
                  { id: 'L', label: 'Low (Partial data disclosed)' },
                  { id: 'N', label: 'None (No information disclosed)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, confidentiality: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.confidentiality === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrity Impact */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Integrity (I)</span>
              <div className="space-y-1">
                {[
                  { id: 'H', label: 'High (Total modification/tampering)' },
                  { id: 'L', label: 'Low (Limited data modified)' },
                  { id: 'N', label: 'None (No modification permitted)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, integrity: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.integrity === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Impact */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Availability (A)</span>
              <div className="space-y-1">
                {[
                  { id: 'H', label: 'High (Total shutdown/denial of service)' },
                  { id: 'L', label: 'Low (Reduced performance)' },
                  { id: 'N', label: 'None (No availability impact)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCvss({ ...cvss, availability: opt.id as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-all ${
                      cvss.availability === opt.id
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vector String & Action Button */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-xs text-slate-300">
              <span className="text-slate-400">Vector String: </span>
              <span className="text-emerald-400 font-semibold">{currentCvssCalc.vector}</span>
            </div>
            <button
              onClick={() => {
                setNewFinding((prev) => ({
                  ...prev,
                  cvssScore: currentCvssCalc.score,
                  cvssVector: currentCvssCalc.vector,
                  severity: currentCvssCalc.severity as any,
                }));
                setActiveTab('editor');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Apply Score to New Finding</span>
            </button>
          </div>
        </div>
      )}

      {/* EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Executive & Scope Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Engagement Details & Scope</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Organization / Client</label>
                <input
                  type="text"
                  value={report.clientName}
                  onChange={(e) => setReport({ ...report, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assessment Methodology</label>
                <input
                  type="text"
                  value={report.assessmentType}
                  onChange={(e) => setReport({ ...report, assessmentType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Lead Assessor / Team</label>
                <input
                  type="text"
                  value={report.assessorName}
                  onChange={(e) => setReport({ ...report, assessorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium text-xs">Executive Summary</label>
              <textarea
                rows={3}
                value={report.executiveSummary}
                onChange={(e) => setReport({ ...report, executiveSummary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Current Findings Register */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Documented Vulnerability Findings</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300">
                  {report.findings.length}
                </span>
              </h3>
            </div>

            <div className="space-y-3">
              {report.findings.map((f) => (
                <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{f.id}</span>
                      <h4 className="text-sm font-bold text-slate-100">{f.title}</h4>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          f.severity === 'Critical'
                            ? 'bg-red-500/20 text-red-400'
                            : f.severity === 'High'
                            ? 'bg-orange-500/20 text-orange-400'
                            : f.severity === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {f.severity} (CVSS {f.cvssScore})
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteFinding(f.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors text-xs flex items-center gap-1"
                      title="Delete finding"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-400 block mb-1">Affected Asset / Endpoint:</span>
                      <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded block overflow-x-auto">
                        {f.affectedAsset}
                      </code>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block mb-1">CWE Classification:</span>
                      <div className="text-slate-300 py-1">{f.cwe}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-400 block mb-1">Vulnerability Description:</span>
                    {f.description}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                    <span className="font-semibold text-emerald-400 block mb-1">Actionable Remediation Roadmap:</span>
                    <p className="text-slate-300 leading-relaxed">{f.remediation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Finding Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Technical Finding to Report</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1 font-medium">Finding Title</label>
                <input
                  type="text"
                  placeholder="e.g. Broken Object Level Authorization on Order Status API"
                  value={newFinding.title}
                  onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Severity & CVSS Score</label>
                <div className="flex gap-2">
                  <select
                    value={newFinding.severity}
                    onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value as any })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none flex-1"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Informational">Informational</option>
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newFinding.cvssScore}
                    onChange={(e) => setNewFinding({ ...newFinding, cvssScore: parseFloat(e.target.value) || 0 })}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-200 text-center font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Affected Asset / URL</label>
                <input
                  type="text"
                  placeholder="https://app.target.local/api/orders/{id}"
                  value={newFinding.affectedAsset}
                  onChange={(e) => setNewFinding({ ...newFinding, affectedAsset: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">CWE ID & Name</label>
                <input
                  type="text"
                  placeholder="CWE-639: Insecure Direct Object Reference"
                  value={newFinding.cwe}
                  onChange={(e) => setNewFinding({ ...newFinding, cwe: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Vulnerability Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of the technical root cause..."
                  value={newFinding.description}
                  onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reproduction Steps (Safe Lab Context)</label>
                <textarea
                  rows={2}
                  placeholder="1. Authenticate as User A\n2. Request order ID of User B..."
                  value={newFinding.reproductionSteps}
                  onChange={(e) => setNewFinding({ ...newFinding, reproductionSteps: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Remediation Recommendations</label>
                <textarea
                  rows={2}
                  placeholder="Specific architectural and code fixes to resolve the issue..."
                  value={newFinding.remediation}
                  onChange={(e) => setNewFinding({ ...newFinding, remediation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={handleAddFinding}
              disabled={!newFinding.title || !newFinding.description}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Save Finding to Report</span>
            </button>
          </div>
        </div>
      )}

      {/* FULL REPORT PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 font-sans max-w-4xl mx-auto shadow-2xl">
          {/* Export Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs text-emerald-400 font-mono font-semibold uppercase tracking-wider">
                CONFIDENTIAL DELIVERABLE
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Penetration Test Report</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Deliverable (.md)</span>
              </button>
            </div>
          </div>

          {/* Title Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Security Assessment & Penetration Testing Report
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
              <div>Client: <span className="text-slate-200">{report.clientName}</span></div>
              <div>·</div>
              <div>Type: <span className="text-slate-200">{report.assessmentType}</span></div>
              <div>·</div>
              <div>Lead: <span className="text-slate-200">{report.assessorName}</span></div>
              <div>·</div>
              <div>Date: <span className="text-slate-200">{report.date}</span></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">1. Executive Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{report.executiveSummary}</p>
          </div>

          {/* Risk Severity Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">2. Findings Severity Matrix</h3>
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40">
                <div className="text-2xl font-bold font-mono text-red-400">
                  {report.findings.filter((f) => f.severity === 'Critical').length}
                </div>
                <div className="text-slate-400 font-semibold mt-1">Critical</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-950/30 border border-orange-900/40">
                <div className="text-2xl font-bold font-mono text-orange-400">
                  {report.findings.filter((f) => f.severity === 'High').length}
                </div>
                <div className="text-slate-400 font-semibold mt-1">High</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40">
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {report.findings.filter((f) => f.severity === 'Medium').length}
                </div>
                <div className="text-slate-400 font-semibold mt-1">Medium</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40">
                <div className="text-2xl font-bold font-mono text-blue-400">
                  {report.findings.filter((f) => f.severity === 'Low' || f.severity === 'Informational').length}
                </div>
                <div className="text-slate-400 font-semibold mt-1">Low / Info</div>
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Findings */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">3. Detailed Technical Findings</h3>

            {report.findings.map((finding, idx) => (
              <div key={finding.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <span className="font-bold text-sm text-slate-100">
                    3.{idx + 1} {finding.title}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {finding.severity} (CVSS: {finding.cvssScore})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-400">Asset: </span>
                    <code className="text-emerald-400 font-mono">{finding.affectedAsset}</code>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Classification: </span>
                    <span>{finding.cwe}</span>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Description:</span>
                  <p className="text-slate-300 leading-relaxed">{finding.description}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Reproduction Steps:</span>
                  <pre className="p-3 rounded bg-slate-900 font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {finding.reproductionSteps}
                  </pre>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Business Impact:</span>
                  <p className="text-slate-300 leading-relaxed">{finding.businessImpact}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <span className="font-semibold text-emerald-400 block mb-1">Remediation Guidance:</span>
                  <p className="text-slate-200 leading-relaxed">{finding.remediation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Rules of Engagement & Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300 block">4. Engagement Governance & Legal Disclaimer</span>
            <p>{report.rulesOfEngagement}</p>
            <p className="text-[11px] text-slate-500">
              This report contains highly confidential vulnerability data intended solely for the authorized asset owner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Markdown Generator Helper
function generateMarkdownReport(report: PentestReport): string {
  return `# Penetration Testing & Vulnerability Assessment Report

**Client:** ${report.clientName}  
**Assessment Type:** ${report.assessmentType}  
**Lead Assessor:** ${report.assessorName}  
**Date:** ${report.date}  

---

## 1. Executive Summary
${report.executiveSummary}

---

## 2. Scope & Rules of Engagement
**Authorized Assets in Scope:**
${report.scope.map((s) => `- ${s}`).join('\n')}

**Rules of Engagement:**
${report.rulesOfEngagement}

---

## 3. Vulnerability Findings Summary

| ID | Title | Severity | CVSS 3.1 | CWE |
|---|---|---|---|---|
${report.findings
  .map(
    (f) =>
      `| ${f.id} | ${f.title} | **${f.severity}** | ${f.cvssScore} | ${f.cwe} |`
  )
  .join('\n')}

---

## 4. Technical Findings & Remediation Roadmap

${report.findings
  .map(
    (f, idx) => `### 4.${idx + 1} ${f.title} (${f.id})
- **Severity:** ${f.severity} (CVSS: ${f.cvssScore})
- **CVSS Vector:** \`${f.cvssVector}\`
- **Affected Asset:** \`${f.affectedAsset}\`
- **Classification:** ${f.cwe}

#### Technical Description
${f.description}

#### Proof of Concept / Reproduction Steps
\`\`\`
${f.reproductionSteps}
\`\`\`

#### Business Impact
${f.businessImpact}

#### Remediation Guidance
${f.remediation}

---
`
  )
  .join('\n')}

*Confidential Report delivered by CyberSentinel Ethical Hacking Academy.*
`;
}
