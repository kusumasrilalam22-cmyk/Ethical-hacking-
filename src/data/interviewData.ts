export interface CyberInterviewCard {
  id: string;
  category: 'Networking' | 'Linux & OS' | 'Web Security' | 'Cryptography' | 'Pentesting' | 'Blue Team & SOC';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  answer: string;
  keyKeywords: string[];
  interviewerAdvice: string;
  pitfallToAvoid: string;
}

export const INTERVIEW_QUESTIONS: CyberInterviewCard[] = [
  {
    id: 'int-1',
    category: 'Networking',
    difficulty: 'Beginner',
    question: 'Explain what happens when you type https://google.com into your browser and press Enter.',
    answer:
      '1. DNS Resolution: Browser checks local cache, OS cache, hosts file, and queries recursive DNS resolver to resolve domain to IP.\n2. TCP 3-Way Handshake: Client initiates SYN, server replies SYN-ACK, client sends ACK to port 443.\n3. TLS Handshake: Client Hello (supported ciphers, SNI) -> Server Hello (chosen cipher, digital certificate) -> Client verifies certificate chain via trusted Root CAs -> Key Exchange (ECDHE) derives symmetric session keys.\n4. HTTP/2 or HTTP/3 Request: Client sends encrypted GET request.\n5. Server Processing & Response: Web server processes request and returns encrypted HTML/CSS/JS payload.\n6. Browser Rendering: DOM tree and CSSOM are built, layout computed, and page painted.',
    keyKeywords: ['DNS Resolution', 'TCP 3-Way Handshake', 'TLS Handshake', 'Root CA Trust Chain', 'ECDHE Key Exchange', 'Symmetric Session Keys', 'DOM Rendering'],
    interviewerAdvice: 'Highlight the security transitions: moving from cleartext DNS to the TLS certificate validation and symmetric encryption derivation.',
    pitfallToAvoid: 'Skipping the TLS handshake or confusing symmetric encryption with asymmetric key exchange.',
  },
  {
    id: 'int-2',
    category: 'Web Security',
    difficulty: 'Intermediate',
    question: 'What is the Same-Origin Policy (SOP), and how does CORS relate to it?',
    answer:
      'The Same-Origin Policy (SOP) is a critical browser security boundary that restricts scripts running in one origin from reading resources or interacting directly with data from a different origin. An origin is defined by the exact combination of Protocol, Hostname, and Port.\n\nCross-Origin Resource Sharing (CORS) is a server-controlled relaxing mechanism, not a security control. It allows a web server to declare (via HTTP response headers like `Access-Control-Allow-Origin: https://trusted.app`) that specific external origins are permitted to read its responses.',
    keyKeywords: ['Protocol + Hostname + Port', 'Browser Security Boundary', 'Read Access Restriction', 'Access-Control-Allow-Origin', 'Preflight OPTIONS Request'],
    interviewerAdvice: 'Emphasize that CORS does NOT stop requests from being SENT; the browser sends the request anyway, but blocks the client JavaScript from READING the response unless approved by the CORS header.',
    pitfallToAvoid: 'Saying CORS is a firewall or that CORS protects the server. CORS is strictly enforced by the client browser.',
  },
  {
    id: 'int-3',
    category: 'Web Security',
    difficulty: 'Advanced',
    question: 'How do you differentiate between Reflected, Stored, and DOM-based XSS, and how do you remediate each?',
    answer:
      '- Reflected XSS: Non-persistent; payload is carried inside the immediate HTTP request (URL query/body) and echoed into the server response HTML. Remediated via server-side context-aware HTML entity encoding.\n- Stored XSS: Persistent; payload is stored in the database or server filesystem and executed in every victim browser that views the record. Remediated via strict input validation and output encoding before rendering.\n- DOM XSS: Vulnerability exists purely in client-side JavaScript execution; data from an untrusted source (like `location.hash`) is written to an unsafe execution sink (like `element.innerHTML` or `eval()`). Remediated by avoiding dangerous sinks, using `textContent`, and safe DOM APIs.\nUniversal Defense: Enforce a strict Content Security Policy (CSP) with nonces/hashes and set `HttpOnly` on sensitive session cookies.',
    keyKeywords: ['Sources and Sinks', 'Context-Aware Output Encoding', 'Execution Sinks (innerHTML vs textContent)', 'Content Security Policy', 'HttpOnly Cookie Flag'],
    interviewerAdvice: 'Draw the distinction between where the malicious script is stored vs where the transformation/vulnerability exists.',
    pitfallToAvoid: 'Claiming that input sanitization alone or `HttpOnly` cookies completely solve XSS.',
  },
  {
    id: 'int-4',
    category: 'Linux & OS',
    difficulty: 'Beginner',
    question: 'What is the difference between /etc/passwd and /etc/shadow in Linux?',
    answer:
      '`/etc/passwd` is world-readable (`chmod 644`) by all users on the system because many applications need to map numeric User IDs (UIDs) to human usernames. It contains username, UID, primary GID, home directory, and default shell. In historical Unix, password hashes were stored here, allowing anyone to copy and crack them offline.\n\n`/etc/shadow` was created to fix this; it is strictly restricted (`chmod 640` or `000`, readable only by root and group `shadow`). It holds the salted, cryptographically hashed passwords (e.g., using SHA-512 or yescrypt) along with password aging, expiration, and lockout policies.',
    keyKeywords: ['World-Readable (/etc/passwd)', 'Root Restricted (/etc/shadow)', 'Salted Hashes', 'UID/GID Mapping', 'Password Aging Policies'],
    interviewerAdvice: 'State that an `x` in the second field of `/etc/passwd` indicates that the password hash has been moved to `/etc/shadow`.',
    pitfallToAvoid: 'Forgetting why `/etc/passwd` must be readable by ordinary users.',
  },
  {
    id: 'int-5',
    category: 'Cryptography',
    difficulty: 'Intermediate',
    question: 'What is Perfect Forward Secrecy (PFS), and how does Ephemeral Diffie-Hellman (DHE/ECDHE) achieve it?',
    answer:
      'Perfect Forward Secrecy (PFS) ensures that the compromise of a server long-term private key in the future does NOT compromise the confidentiality of previously recorded encrypted sessions.\n\nUnder classic RSA key exchange, the client encrypted the pre-master secret directly with the server public key; an attacker who captured network traffic and later stole the server private key could decrypt all historical traffic. In Ephemeral Diffie-Hellman (ECDHE), unique temporary key pairs are generated for every single session. Once the session ends, the temporary keys are discarded from memory. Even if the server permanent certificate is compromised later, the session keys cannot be mathematically recovered.',
    keyKeywords: ['Long-Term Key vs Session Key', 'ECDHE (Ephemeral)', 'Historical Decryption Prevention', 'Pre-master Secret Discard', 'TLS 1.3 Mandatory'],
    interviewerAdvice: 'Note that TLS 1.3 removed static RSA and static Diffie-Hellman entirely, making Forward Secrecy mandatory for all TLS connections.',
    pitfallToAvoid: 'Confusing PFS with standard asymmetric encryption or certificate expiration.',
  },
  {
    id: 'int-6',
    category: 'Pentesting',
    difficulty: 'Intermediate',
    question: 'Walk me through the phases of a professional Penetration Test according to PTES.',
    answer:
      'According to the Penetration Testing Execution Standard (PTES):\n1. Pre-engagement Interactions: Establish Rules of Engagement (ROE), legal permission to test, defined scope, communication channels, and emergency pause contacts.\n2. Intelligence Gathering (Reconnaissance): Passive (OSINT, whois, certificate transparency) and active reconnaissance without exploitation.\n3. Threat Modeling: Identify high-value business assets and threat vectors.\n4. Vulnerability Analysis: Discover flaws using scanners and manual inspection.\n5. Exploitation: Safe, controlled verification of identified vulnerabilities without causing disruption.\n6. Post-Exploitation: Determine the true business risk, value of compromised assets, and potential lateral movement.\n7. Reporting: Deliver Executive Summary, technical findings, CVSS scores, evidence, and actionable remediation roadmap.',
    keyKeywords: ['PTES Standard', 'Rules of Engagement (ROE)', 'Reconnaissance', 'Threat Modeling', 'Controlled Exploitation', 'Executive vs Technical Reporting'],
    interviewerAdvice: 'Always emphasize that Pre-engagement and Reporting are the most critical phases for a client.',
    pitfallToAvoid: 'Describing pentesting as merely "running automated tools and hacking into a box". Emphasize the business risk context.',
  },
  {
    id: 'int-7',
    category: 'Blue Team & SOC',
    difficulty: 'Intermediate',
    question: 'What is the difference between an Indicator of Compromise (IoC) and an Indicator of Attack (IoA)?',
    answer:
      '- Indicator of Compromise (IoC): Forensic evidence collected AFTER an intrusion has already occurred. It represents reactive evidence such as known malicious file hashes (MD5/SHA256), known malicious IP addresses, domain names, or specific registry modification keys.\n- Indicator of Attack (IoA): Focuses on the real-time BEHAVIOR, intent, and tactics used by an adversary regardless of specific malware hashes. Examples include unauthorized PowerShell execution attempting to dump LSASS memory, excessive failed logins followed by service creation, or unusual lateral movement.',
    keyKeywords: ['IoC (Forensic, Reactive, Static Hashes/IPs)', 'IoA (Behavioral, Real-Time, Tactics/Techniques)', 'MITRE ATT&CK Mapping', 'LSASS Memory Dumping'],
    interviewerAdvice: 'Refer to David Bianco "Pyramid of Pain": hash values and IP addresses (IoCs) are easy for attackers to change; Tactics, Techniques, and Procedures (IoAs) are the toughest for attackers to change.',
    pitfallToAvoid: 'Using IoC and IoA interchangeably.',
  },
  {
    id: 'int-8',
    category: 'Web Security',
    difficulty: 'Advanced',
    question: 'Explain how Server-Side Request Forgery (SSRF) can lead to full Cloud Account Compromise, and how IMDSv2 mitigates it.',
    answer:
      'In cloud environments (like AWS EC2), instances communicate with the local Link-Local address `http://169.254.169.254/latest/meta-data/` to obtain dynamic instance configuration. If an application contains an SSRF flaw, an attacker can coerce the server into requesting the instance metadata endpoint.\n\nIn IMDSv1, simple GET requests return IAM temporary role credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`), allowing the attacker to assume the server IAM role outside AWS. IMDSv2 completely mitigates simple SSRF by requiring a session token obtained via an HTTP `PUT` request with a mandatory `X-aws-ec2-metadata-token-ttl-seconds` header; most SSRF vulnerabilities can only execute simple `GET` requests without custom HTTP headers or cannot traverse the hop-limit.',
    keyKeywords: ['169.254.169.254 Link-Local', 'IAM Temporary Credentials', 'IMDSv1 vs IMDSv2', 'HTTP PUT Token Requirement', 'Hop-Limit Enforcement'],
    interviewerAdvice: 'Mention Capital One breach (2019) as the canonical real-world example of SSRF targeting cloud metadata.',
    pitfallToAvoid: 'Assuming SSRF only affects internal websites and forgetting its impact on cloud infrastructure APIs.',
  },
];
