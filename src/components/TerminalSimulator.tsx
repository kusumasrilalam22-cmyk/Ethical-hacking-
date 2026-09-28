import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, HelpCircle, Shield, CornerDownLeft, Sparkles } from 'lucide-react';

interface TerminalEntry {
  id: string;
  command: string;
  output: string;
  type: 'standard' | 'error' | 'success' | 'info';
  timestamp: string;
}

const QUICK_COMMANDS = [
  'nmap -sV -sC -p 22,80,443 127.0.0.1',
  'sudo tcpdump -i lo -nn -c 4 "port 80"',
  'ls -la /var/www/html',
  'chmod 600 ~/.ssh/id_rsa',
  'sudo -l',
  'hashid 5f4dcc3b5aa765d61d8327deb882cf99',
  'curl -I http://127.0.0.1:80',
  'openssl s_client -connect localhost:443',
];

export const TerminalSimulator: React.FC = () => {
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      command: 'uname -a',
      output: 'Linux security-lab-workstation 6.5.0-35-generic #35~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
      type: 'info',
      timestamp: '00:00:01',
    },
    {
      id: 'init-2',
      command: 'echo $LAB_ENVIRONMENT',
      output: 'ISOLATED_HOST_ONLY_AUDIT_SANDBOX (Target subnet: 127.0.0.1 / 10.0.2.0/24)',
      type: 'success',
      timestamp: '00:00:02',
    },
  ]);

  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>(['uname -a', 'echo $LAB_ENVIRONMENT']);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleRunCommand = (cmdText?: string) => {
    const raw = cmdText !== undefined ? cmdText : input;
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Add to history
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);
    if (cmdText === undefined) setInput('');

    if (trimmed === 'clear') {
      setHistory([]);
      return;
    }

    const { output, type } = evaluateTerminalCommand(trimmed);
    const newEntry: TerminalEntry = {
      id: Date.now().toString(),
      command: trimmed,
      output,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setHistory((prev) => [...prev, newEntry]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span>student@security-lab: ~ (Isolated Authorized CLI)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunCommand('help')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>help</span>
          </button>
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>clear</span>
          </button>
        </div>
      </div>

      {/* Quick command buttons bar */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 text-[11px]">
        <span className="text-slate-400 font-sans font-semibold flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Commands:
        </span>
        {QUICK_COMMANDS.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => handleRunCommand(cmd)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/60 text-slate-300 transition-colors whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Screen & History */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-4 text-slate-200"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-slate-400 leading-relaxed pb-2 border-b border-slate-800/50">
          * Authorized Ethical Hacking Virtual Terminal Environment.
          <br />* Type &apos;<span className="text-emerald-400">help</span>&apos; to view all supported simulated security tools (Nmap, Wireshark, Linux auditing, OpenSSL, Hashid).
          <br />* Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">Up</kbd>/<kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">Down</kbd> for command history.
        </div>

        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400 font-bold">student@security-lab:~$</span>
              <span className="text-slate-100 font-semibold">{item.command}</span>
              <span className="text-[10px] text-slate-400 ml-auto">{item.timestamp}</span>
            </div>
            <pre
              className={`p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed ${
                item.type === 'error'
                  ? 'bg-rose-950/20 text-rose-300 border border-rose-900/40'
                  : item.type === 'success'
                  ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-900/40'
                  : 'bg-slate-900/50 text-slate-300 border border-slate-800/40'
              }`}
            >
              {item.output}
            </pre>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input Line */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <span className="text-emerald-400 font-bold flex-shrink-0">student@security-lab:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (e.g. nmap -sV 127.0.0.1, sudo -l, hashid ...)"
          className="flex-1 bg-transparent text-emerald-300 focus:outline-none caret-emerald-400 font-mono text-xs placeholder-slate-600"
          autoFocus
        />
        <button
          onClick={() => handleRunCommand()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Play className="w-3 h-3" />
          <span>Execute</span>
        </button>
      </div>
    </div>
  );
};

// Simulated command execution engine
function evaluateTerminalCommand(raw: string): { output: string; type: 'standard' | 'error' | 'success' | 'info' } {
  const parts = raw.split(/\s+/);
  const cmd = parts[0]?.toLowerCase() || '';

  if (cmd === 'help') {
    return {
      type: 'info',
      output: `AVAILABLE ETHICAL HACKING LAB COMMANDS:
--------------------------------------------------------------------------------
Networking & Scanning:
  nmap [flags] <target>      Network Mapper port scanning & service detection
                             Try: nmap -sV -sC 127.0.0.1, nmap -p 80,443 localhost
  tcpdump [flags]            Packet capture utility
                             Try: sudo tcpdump -i lo -nn -c 4 "port 80"
  curl -I <url>              HTTP header inspection (e.g. curl -I http://127.0.0.1)
  dig <domain>               DNS record lookup (e.g. dig example.lab)
  ping -c 3 <target>         ICMP connectivity test

Linux Auditing & Privilege:
  ls -la [path]              Directory listing with permissions & hidden files
  chmod <mode> <file>        Modify file permissions (e.g. chmod 600 id_rsa)
  sudo -l                    List authorized sudo privileges for current user
  cat /etc/passwd            Read user directory
  cat /etc/shadow            Attempt to read shadow password hashes
  id / whoami                Display UID, GID, and active user credentials
  uname -a                   Kernel version and system architecture

Cryptography & Web Tools:
  hashid <hash>              Identify hash algorithm (MD5, SHA-256, bcrypt)
  openssl s_client [flags]   Inspect TLS certificate chain & cipher suite
  burpsuite / burp           Display Burp Suite proxy status & repeater guide
  msfconsole                 Metasploit Framework ethical lab status

General Utilities:
  clear                      Wipes the terminal buffer
  date                       Displays current lab timestamp
  history                    Show past executed commands
--------------------------------------------------------------------------------`,
    };
  }

  if (cmd === 'nmap') {
    const hasVersion = raw.includes('-sV');
    const hasScripts = raw.includes('-sC');
    const hasSyn = raw.includes('-sS');
    const target = parts[parts.length - 1] || '127.0.0.1';

    // Check ethical bounds: warn if external public IP
    if (!target.includes('127.0.0.1') && !target.includes('localhost') && !target.startsWith('10.') && !target.startsWith('192.168.')) {
      return {
        type: 'error',
        output: `[SAFETY GUARD]: Scanning ${target} blocked by Ethical Charter.
In accordance with CFAA and PTES guidelines, scanning external internet targets without written Rules of Engagement is unauthorized. Please test against authorized lab targets: 127.0.0.1, localhost, or 10.0.2.x.`,
      };
    }

    return {
      type: 'success',
      output: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-27 12:45 UTC
Nmap scan report for ${target}
Host is up (0.00015s latency).
Not shown: 997 closed tcp ports (reset)

PORT    STATE SERVICE  ${hasVersion ? 'VERSION' : ''}
22/tcp  open  ssh      ${hasVersion ? 'OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)' : ''}
${hasScripts ? '| ssh-hostkey: \n|   256 71:2c:14:ef:8a:00 (ECDSA)\n|_  256 8f:91:3b:02:11:4a (ED25519)' : ''}
80/tcp  open  http     ${hasVersion ? 'Apache httpd 2.4.52 ((Ubuntu))' : ''}
${hasScripts ? '|_http-title: Apache2 Ubuntu Default Page: It works\n|_http-server-header: Apache/2.4.52 (Ubuntu)' : ''}
443/tcp open  ssl/http ${hasVersion ? 'Apache httpd 2.4.52 ((Ubuntu))' : ''}
${hasScripts ? '|_ssl-cert: Subject: commonName=security-lab.local\n| ssl-date: TLS randomness does not represent time' : ''}

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 4.82 seconds`,
    };
  }

  if (cmd === 'tcpdump') {
    return {
      type: 'info',
      output: `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on lo, link-type EN10MB (Ethernet), snapshot length 262144 bytes
12:45:01.001 IP 127.0.0.1.58392 > 127.0.0.1.80: Flags [S], seq 389104812, win 65495, length 0
12:45:01.002 IP 127.0.0.1.80 > 127.0.0.1.58392: Flags [S.], seq 412098171, ack 389104813, win 65483, length 0
12:45:01.002 IP 127.0.0.1.58392 > 127.0.0.1.80: Flags [.], ack 412098172, win 512, length 0
12:45:01.003 IP 127.0.0.1.58392 > 127.0.0.1.80: Flags [P.], seq 1:78, ack 1, win 512, length 77
4 packets captured
4 packets received by filter
0 packets dropped by kernel`,
    };
  }

  if (cmd === 'ls') {
    if (raw.includes('-la') || raw.includes('-l')) {
      return {
        type: 'standard',
        output: `total 48
drwxr-xr-x 6 student student 4096 Sep 27 12:00 .
drwxr-xr-x 3 root    root    4096 Sep 20 09:12 ..
-rw------- 1 student student  412 Sep 27 11:30 .bash_history
-rw-r--r-- 1 student student  220 Sep 20 09:12 .bash_logout
-rw-r--r-- 1 student student 3771 Sep 20 09:12 .bashrc
drwx------ 2 student student 4096 Sep 21 14:02 .ssh
drwxr-xr-x 2 student student 4096 Sep 27 10:15 authorized_labs
drwxr-xr-x 2 root    root    4096 Sep 27 10:20 pentest_reports
-rwsr-xr-x 1 root    root   68208 Nov 29  2023 /usr/bin/passwd (SUID Enabled)`,
      };
    }
    return {
      type: 'standard',
      output: `authorized_labs  pentest_reports  tools_config  notes.txt`,
    };
  }

  if (cmd === 'chmod') {
    const targetFile = parts[2] || 'target';
    const mode = parts[1] || '644';
    return {
      type: 'success',
      output: `Permissions for '${targetFile}' successfully updated to mode ${mode}.
Verification: Permissions now set to least-privilege standards.`,
    };
  }

  if (cmd === 'sudo') {
    if (raw.includes('-l')) {
      return {
        type: 'info',
        output: `Matching Defaults entries for student on security-lab:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin

User student may run the following commands on security-lab:
    (ALL : ALL) ALL
    (root) NOPASSWD: /usr/bin/tcpdump -i lo *
    (root) /usr/bin/systemctl status nginx`,
      };
    }
    return {
      type: 'standard',
      output: `[sudo] password for student: 
Command executed with elevated administrative privilege.`,
    };
  }

  if (cmd === 'cat') {
    const target = parts[1] || '';
    if (target.includes('passwd')) {
      return {
        type: 'standard',
        output: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
student:x:1000:1000:Ethical Pentester,,,:/home/student:/bin/bash`,
      };
    }
    if (target.includes('shadow')) {
      return {
        type: 'error',
        output: `cat: /etc/shadow: Permission denied
Note: /etc/shadow requires root or group 'shadow' privileges (chmod 640). This protects password hashes against unprivileged local user reads.`,
      };
    }
    return {
      type: 'standard',
      output: `[Content of ${target}]:
# CyberSentinel Lab Configuration
TARGET_SCOPE="127.0.0.1/32, 10.0.2.0/24"
RULES_OF_ENGAGEMENT="AUTHORIZED"`,
    };
  }

  if (cmd === 'whoami') {
    return { type: 'standard', output: 'student' };
  }

  if (cmd === 'id') {
    return {
      type: 'standard',
      output: 'uid=1000(student) gid=1000(student) groups=1000(student),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),110(lxd)',
    };
  }

  if (cmd === 'hashid') {
    const hash = parts[1] || '';
    if (hash.length === 32) {
      return {
        type: 'info',
        output: `Analyzing Hash: ${hash}
[+] MD5 (32 characters, 128-bit)
[+] MD4
[+] NTLM (Windows Hash)
Security Evaluation: Cryptographically broken. Highly vulnerable to collision attacks and rainbow tables.`,
      };
    }
    if (hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$')) {
      return {
        type: 'success',
        output: `Analyzing Hash: ${hash}
[+] Blowfish / bcrypt (Modular Crypt Format)
Cost Factor: ${hash.split('$')[2] || '12'}
Salt: ${hash.substring(7, 29)}
Security Evaluation: Industry standard for password storage. Built-in per-user salt and adjustable work factor defeat GPU acceleration.`,
      };
    }
    if (hash.length === 64) {
      return {
        type: 'info',
        output: `Analyzing Hash: ${hash}
[+] SHA-256 (64 characters, 256-bit)
[+] Keccak-256
Security Evaluation: Secure for digital signatures and data integrity; too fast for raw password storage without key derivation (PBKDF2/Argon2).`,
      };
    }
    return {
      type: 'info',
      output: `[+] Analyzing input: Unknown format. Try passing a 32-char (MD5), 64-char (SHA-256), or bcrypt ($2b$12$...) hash string.`,
    };
  }

  if (cmd === 'curl') {
    return {
      type: 'standard',
      output: `HTTP/1.1 200 OK
Date: Sun, 27 Sep 2026 12:45:10 GMT
Server: Apache/2.4.52 (Ubuntu)
Content-Type: text/html; charset=UTF-8
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self'
Connection: keep-alive`,
    };
  }

  if (cmd === 'openssl') {
    return {
      type: 'info',
      output: `CONNECTED(00000003)
---
Certificate chain
 0 s:CN = security-lab.local
   i:CN = SecurityLab Root CA
---
Server certificate
-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQDU8...
-----END CERTIFICATE-----
subject=CN = security-lab.local
issuer=CN = SecurityLab Root CA
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Server public key is 256 bit (ECDSA)
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
---`,
    };
  }

  if (cmd === 'burp' || cmd === 'burpsuite') {
    return {
      type: 'info',
      output: `Burp Suite Professional (Authorized Lab Edition)
Proxy Listener: 127.0.0.1:8080 [RUNNING]
Target Scope: https://*.lab.local, http://localhost:3000
Intercept: OFF (Requests captured to HTTP History)
Repeater: Ready for manual parameter testing and header modification.`,
    };
  }

  if (cmd === 'msfconsole') {
    return {
      type: 'info',
      output: `                _                    _ _   
  _ __ ___   ___| |_ __ _ ___ _ __  | (_) |_ 
 | '_ \` _ \\ / _ \\ __/ _\` / __| '_ \\ | | | __|
 | | | | | |  __/ || (_| \\__ \\ |_) || | | |_ 
 |_| |_| |_|\\___|\\__\\__,_|___/ .__/ |_|_|\\__|
                             |_|             
=[ metasploit v6.3.50-dev                          ]
+ -- --=[ 2380 exploits - 1230 auxiliary - 418 post       ]
+ -- --=[ Authorized Lab Training Mode Enabled            ]
msf6 > (Type 'help' to review authorized educational modules)`,
    };
  }

  if (cmd === 'dig') {
    const domain = parts[1] || 'example.lab';
    return {
      type: 'standard',
      output: `; <<>> DiG 9.18.18-0ubuntu0.22.04.1-Ubuntu <<>> ${domain}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 48921
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;${domain}.                     IN      A

;; ANSWER SECTION:
${domain}.              300     IN      A       10.0.2.15

;; Query time: 1 msec
;; SERVER: 127.0.0.53#53(127.0.0.53)
;; WHEN: Sun Sep 27 12:45:20 UTC 2026
;; MSG SIZE  rcvd: 59`,
    };
  }

  if (cmd === 'date') {
    return { type: 'standard', output: new Date().toUTCString() };
  }

  return {
    type: 'error',
    output: `bash: ${cmd}: command not recognized in this lab sandbox. Type 'help' to list available tools (nmap, tcpdump, chmod, sudo, hashid, curl, openssl).`,
  };
}
