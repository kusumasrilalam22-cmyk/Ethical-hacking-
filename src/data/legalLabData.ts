export interface LegalPlatform {
  id: string;
  name: string;
  category: 'Web Security' | 'Network & Systems' | 'Linux Fundamentals' | 'Cryptography' | 'Beginner CTF';
  description: string;
  url: string;
  freeTier: boolean;
  recommendedFor: string;
  legalNotice: string;
}

export const LEGAL_PLATFORMS: LegalPlatform[] = [
  {
    id: 'portswigger-academy',
    name: 'PortSwigger Web Security Academy',
    category: 'Web Security',
    description: 'The gold standard for web application security. Created by the developers of Burp Suite, featuring hundreds of free interactive labs covering SQLi, XSS, CSRF, SSRF, JWT vulnerabilities, OAuth bypasses, and Race Conditions.',
    url: 'https://portswigger.net/web-security',
    freeTier: true,
    recommendedFor: 'Web Penetration Testing & OWASP Top 10 mastery from Apprentice to Practitioner.',
    legalNotice: 'Labs run on isolated cloud containers provisioned specifically for your authenticated PortSwigger account.',
  },
  {
    id: 'tryhackme',
    name: 'TryHackMe (THM)',
    category: 'Network & Systems',
    description: 'Gamified, hands-on cybersecurity training through guided virtual machines and network topologies. Includes complete career tracks like Complete Beginner, Jr Penetration Tester, and Cyber Defense.',
    url: 'https://tryhackme.com',
    freeTier: true,
    recommendedFor: 'Complete beginners learning Linux, Nmap, Wireshark, Metasploit, and network penetration testing.',
    legalNotice: 'All targets are authorized lab VMs connected via private OpenVPN tunnels.',
  },
  {
    id: 'hackthebox',
    name: 'Hack The Box (HTB)',
    category: 'Network & Systems',
    description: 'Industry-standard penetration testing and ethical hacking platform featuring live, intentionally vulnerable machines (Easy to Insane) and HTB Academy for deep conceptual study.',
    url: 'https://www.hackthebox.com',
    freeTier: true,
    recommendedFor: 'Intermediate to advanced penetration testing, active directory exploitation, and OSCP exam preparation.',
    legalNotice: 'Strict Terms of Service: Only machines on the 10.10.x.x or 10.129.x.x lab subnets are authorized for testing.',
  },
  {
    id: 'owasp-juice-shop',
    name: 'OWASP Juice Shop',
    category: 'Web Security',
    description: 'The most modern and sophisticated intentionally vulnerable web application! Built in Node.js, Express, and Angular, covering the entire OWASP Top 10 along with realistic modern application flaws.',
    url: 'https://owasp.org/www-project-juice-shop/',
    freeTier: true,
    recommendedFor: 'Deploying locally via Docker (`docker run -d -p 3000:3000 bkimminich/juice-shop`) for safe offline web security drills.',
    legalNotice: 'Open source project intended exclusively for local containerized or isolated server practice.',
  },
  {
    id: 'overthewire-bandit',
    name: 'OverTheWire: Bandit',
    category: 'Linux Fundamentals',
    description: 'The premier wargame for mastering Linux command line, file permissions, SSH, pipes, regex, and security auditing. Solved level by level via SSH.',
    url: 'https://overthewire.org/wargames/bandit/',
    freeTier: true,
    recommendedFor: 'Mastering the Linux terminal, bash scripting, file permissions, and basic binary analysis.',
    legalNotice: 'Authorized public game server accessed via dedicated SSH ports.',
  },
  {
    id: 'cryptohack',
    name: 'CryptoHack',
    category: 'Cryptography',
    description: 'Fun platform for learning modern cryptography through hands-on challenges: AES, RSA, Elliptic Curves, Diffie-Hellman, and Hash functions.',
    url: 'https://cryptohack.org',
    freeTier: true,
    recommendedFor: 'Understanding how cryptographic math works, why bad implementations fail, and cipher analysis.',
    legalNotice: 'Safe Python-based cryptographic puzzles evaluated against simulated APIs.',
  },
  {
    id: 'picoctf',
    name: 'PicoCTF',
    category: 'Beginner CTF',
    description: 'Created by security experts at Carnegie Mellon University. Designed specifically for high school and college students to learn ethical hacking concepts in a friendly CTF format.',
    url: 'https://picoctf.org',
    freeTier: true,
    recommendedFor: 'Foundations of binary exploitation, web exploitation, forensics, and cryptography.',
    legalNotice: 'Educational environment explicitly authorized for students worldwide.',
  },
];

export const ETHICAL_HACKING_CHARTER = {
  title: 'The Ethical Hacker Code of Conduct & Legal Boundaries',
  coreRules: [
    {
      title: 'Explicit Written Authorization (Rules of Engagement)',
      description:
        'Never scan, probe, or test any system, IP address, or network unless you have explicit, documented, signed written permission from the system owner (e.g. a signed Statement of Work or Rules of Engagement). Verbal permission is never legally sufficient.',
    },
    {
      title: 'Respect the Scope Boundary',
      description:
        'Stay strictly within the agreed IP addresses, domains, and application tiers. If a client authorizes `staging.example.com`, touching `prod.example.com` or third-party DNS/CDN providers is unauthorized access.',
    },
    {
      title: 'No Denial of Service or Destruction',
      description:
        'Ethical hacking seeks to evaluate security posture without harming business availability or destroying customer data. Do not execute destructive payloads, fork bombs, or unmetered network floods.',
    },
    {
      title: 'Confidentiality & Responsible Disclosure',
      description:
        'Any sensitive data encountered during an authorized assessment (e.g., passwords, customer PII) must be encrypted, handled with utmost confidentiality, and reported directly to the asset owner in a formal report.',
    },
  ],
  legalStatutes: [
    {
      name: 'Computer Fraud and Abuse Act (CFAA) - 18 U.S.C. § 1030 (United States)',
      summary:
        'Makes it a federal felony to access a protected computer without authorization or to exceed authorized access. Criminal penalties include substantial fines and multi-year federal imprisonment.',
    },
    {
      name: 'Computer Misuse Act 1990 (United Kingdom)',
      summary:
        'Criminalizes unauthorized access to computer material (Section 1), unauthorized access with intent to commit further offences (Section 2), and unauthorized acts with intent to impair computer operations (Section 3).',
    },
    {
      name: 'General Data Protection Regulation (GDPR) - Article 32 (European Union)',
      summary:
        'Mandates technical and organizational security measures to protect personal data; unauthorized exfiltration of EU citizen data during security audits triggers catastrophic regulatory liabilities.',
    },
  ],
  labSetupGuide: [
    {
      step: '1. Install Type-2 Hypervisor',
      details: 'Install VirtualBox (open source) or VMware Workstation Player on your workstation.',
    },
    {
      step: '2. Create Isolated Host-Only Network Adapter',
      details:
        'In VirtualBox settings, create a Host-Only Network (e.g. `vboxnet0` with subnet `192.168.56.0/24`). Never bridge intentionally vulnerable VMs directly to your public Wi-Fi or home router.',
    },
    {
      step: '3. Deploy Safe Vulnerable Machines',
      details:
        'Import verified vulnerable VMs such as Metasploitable 2 or OWASP Broken Web Apps (BWA) into the host-only adapter.',
    },
    {
      step: '4. Take Clean Snapshots',
      details:
        'Take a VM snapshot before any hands-on practice. If a service becomes corrupted or misconfigured, revert to the clean snapshot in 5 seconds.',
    },
  ],
};
