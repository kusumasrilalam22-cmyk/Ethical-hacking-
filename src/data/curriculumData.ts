import { CurriculumTopic } from '../types/cyber';

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  // ==========================================
  // NETWORKING
  // ==========================================
  {
    id: 'tcp-handshake',
    title: 'TCP 3-Way Handshake & Connection States',
    categoryId: 'networking',
    difficulty: 'Beginner',
    summary: 'Master how reliable network connections are established, analyzed in Wireshark, and inspected for anomalous flags.',
    tags: ['TCP', 'Networking', 'Wireshark', 'Handshake', 'OSI Layer 4'],
    simpleExplanation:
      'Imagine two polite people meeting. Alice says "Hello, can you hear me?" (SYN). Bob replies, "Yes, I hear you, can you hear me?" (SYN-ACK). Alice confirms, "Yes, I hear you too!" (ACK). Once this 3-step check succeeds, they can reliably share data. In computing, this prevents data transmission before both machines confirm readiness.',
    keyConcepts: [
      'SYN (Synchronize): Client sends an initial sequence number (ISN) requesting a connection.',
      'SYN-ACK (Synchronize-Acknowledge): Server acknowledges client ISN and sends its own server ISN.',
      'ACK (Acknowledge): Client acknowledges server ISN; the TCP connection state transitions to ESTABLISHED.',
      'Connection Termination: Graceful teardown uses FIN -> ACK -> FIN -> ACK; abrupt termination uses RST (Reset).',
      'Port State Implications: Open port responds with SYN-ACK; closed port responds with RST-ACK; filtered port drops packet silently or returns ICMP unreachable.',
    ],
    safePracticalExample: {
      scenario: 'Authorized Local Port Inspection in a Virtual Machine Lab',
      labEnvironment: 'Local Docker container or local VM (IP: 127.0.0.1 or 10.0.2.15) with an isolated Nginx web server on port 80.',
      walkthrough:
        'Run a local packet capture on the loopback adapter (`lo`), then initiate a legitimate curl request to your local web server. Inspect the exact SYN, SYN-ACK, and ACK sequence in the captured packets.',
    },
    authorizedCommands: [
      {
        command: 'sudo tcpdump -i lo -nn "tcp port 80" -c 4',
        explanation: 'Captures the first 4 TCP packets on the loopback interface on port 80 without resolving hostnames or ports.',
        flagsExplanation: '-i lo: loopback interface; -nn: do not resolve hostnames/ports to preserve numerical speed; -c 4: stop after 4 packets.',
      },
      {
        command: 'curl -I http://127.0.0.1:80',
        explanation: 'Initiates a simple HTTP HEAD request to trigger the TCP handshake on the local machine.',
      },
    ],
    expectedOutput: {
      command: 'sudo tcpdump -i lo -nn "tcp port 80" -c 4',
      rawOutput: `12:00:01.100 IP 127.0.0.1.54320 > 127.0.0.1.80: Flags [S], seq 289104812, win 65495, options [mss 65495,sackOK,TS val 101 ecr 0], length 0
12:00:01.101 IP 127.0.0.1.80 > 127.0.0.1.54320: Flags [S.], seq 412098171, ack 289104813, win 65483, options [mss 65495,sackOK,TS val 101 ecr 101], length 0
12:00:01.101 IP 127.0.0.1.54320 > 127.0.0.1.80: Flags [.], ack 412098172, win 512, length 0
12:00:01.102 IP 127.0.0.1.54320 > 127.0.0.1.80: Flags [P.], seq 1:78, ack 1, win 512, length 77`,
      breakdown:
        'Line 1: Client sends `[S]` (SYN) with initial seq 289104812. Line 2: Server responds with `[S.]` (SYN-ACK), acknowledging client seq + 1 (289104813) and providing its own sequence number. Line 3: Client responds with `[.]` (ACK), completing the 3-way handshake. Line 4: Data transmission begins with `[P.]` (PUSH-ACK) containing the HTTP request header.',
    },
    commonMistakes: [
      {
        mistake: 'Assuming a closed port simply ignores incoming packets.',
        fix: 'A closed port on a live host normally returns an active TCP RST (Reset) packet. A filtered port (firewalled) is what drops packets silently or returns ICMP host unreachable.',
      },
      {
        mistake: 'Confusing sequence numbers with packet byte count.',
        fix: 'Sequence numbers track cumulative bytes sent across the session, initialized to a pseudo-random 32-bit ISN to prevent TCP sequence prediction attacks.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the purpose of the TCP 3-way handshake, and what happens if the server receives a SYN but never receives the final ACK?',
        answer:
          'The 3-way handshake synchronizes sequence numbers, negotiates maximum segment size (MSS), and verifies bidirectional connectivity. If the server receives a SYN and replies with SYN-ACK but receives no ACK, the connection remains in SYN_RECEIVED state in the backlog queue. An attacker flooding unacknowledged SYNs causes a SYN Flood DoS, mitigated via SYN Cookies (RFC 4987).',
      },
      {
        question: 'How does an Nmap SYN Stealth Scan (-sS) differ from a regular TCP Connect Scan (-sT)?',
        answer:
          'A TCP Connect scan (-sT) completes the entire 3-way handshake using the OS `connect()` socket API, which creates a fully established session that is logged by application servers. A SYN Stealth scan (-sS) sends raw SYN packets: if SYN-ACK is received, the scanner sends an RST instead of the final ACK, tearing down the connection before completion, avoiding application-level logging.',
      },
    ],
    practiceExercise: {
      title: 'Analyze Handshake Flags in a Local Capture',
      objective: 'Filter and identify the exact TCP flags (SYN, SYN-ACK, ACK, FIN) of a local curl request.',
      safeLabInstructions:
        'In your local Linux lab terminal or VM, start `tcpdump -i any -nn "port 8080"` in one terminal. In another, run `python3 -m http.server 8080 &` followed by `curl http://localhost:8080`. Note down the flags observed.',
      hint: 'Look for `Flags [S]`, `Flags [S.]`, `Flags [.]`, and `Flags [F.]`.',
      solution:
        'You will see `[S]` from the client, `[S.]` from the Python server, `[.]` acknowledging, then the HTTP GET `[P.]`, response data, and finally `[F.]` (FIN-ACK) to close the ephemeral connection.',
    },
  },

  {
    id: 'port-scanning-theory',
    title: 'Port Scanning Theory & Nmap Mechanics',
    categoryId: 'networking',
    difficulty: 'Beginner',
    summary: 'Understand port states (Open, Closed, Filtered), scan types, timing templates, and service discovery in authorized audits.',
    tags: ['Nmap', 'Port Scanning', 'Reconnaissance', 'Firewalls'],
    simpleExplanation:
      'Port scanning is like an authorized security inspector checking every door in a secure commercial warehouse. Is the front door unlocked (Open)? Is it padlocked with a sign saying "Keep Out" (Closed)? Or is there an armed security perimeter preventing you from even approaching the door (Filtered)?',
    keyConcepts: [
      'Port States: Open (service listening), Closed (port accessible, but no service listening - returns RST), Filtered (firewall/IDS drops probe without reply), Unfiltered (accessible, state indeterminate in ACK scans).',
      'Scan Techniques: -sT (Full TCP Connect), -sS (TCP SYN Half-Open), -sU (UDP Scan - slower due to ICMP rate limiting), -sV (Version Probe), -sC (Default NSE scripts).',
      'Timing Templates: -T0 (Paranoid) to -T5 (Insane); -T4 is recommended for authorized, stable local lab environments.',
      'Legal & Ethical Boundary: Port scanning against any network without explicit written authorization is unauthorized network probing and can violate computer crime statutes.',
    ],
    safePracticalExample: {
      scenario: 'Auditing Services on a Local Authorized Virtual Machine',
      labEnvironment: 'Metasploitable 2 or OWASP BWA VM running on an isolated VirtualBox Host-Only Network (IP: 192.168.56.101).',
      walkthrough:
        'Perform a multi-stage scan: first discover live hosts with an ARP/ping scan, then identify open TCP ports, determine service versions, and test with safe default NSE scripts.',
    },
    authorizedCommands: [
      {
        command: 'nmap -sS -p 22,80,443,3306 -T4 127.0.0.1',
        explanation: 'Performs a fast SYN scan against common ports on localhost.',
        flagsExplanation: '-sS: SYN Stealth; -p: specific ports; -T4: aggressive timing template for fast reliable local testing.',
      },
      {
        command: 'nmap -sV -sC -p 80,443 127.0.0.1',
        explanation: 'Probes open HTTP/HTTPS ports for exact banner versions and runs safe default verification scripts.',
        flagsExplanation: '-sV: Version detection; -sC: runs default, safe NSE scripts.',
      },
    ],
    expectedOutput: {
      command: 'nmap -sV -sC -p 80,443 127.0.0.1',
      rawOutput: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-27 12:30 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).

PORT    STATE SERVICE  VERSION
80/tcp  open  http     Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.52 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.4.52 ((Ubuntu))
|_ssl-cert: Subject: commonName=localhost
| ssl-date: TLS randomness does not represent time

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.42 seconds`,
      breakdown:
        'The output confirms port 80 and 443 are Open. Version detection identifies Apache httpd 2.4.52 running on Ubuntu. The default scripts extracted the web page title and parsed the self-signed SSL certificate subject on port 443.',
    },
    commonMistakes: [
      {
        mistake: 'Scanning the entire 1-65535 port range on UDP blindly with `-sU -p-`.',
        fix: 'UDP scanning without response relies on ICMP Port Unreachable timeouts. Linux kernels rate-limit ICMP responses to 1 per second, making a full UDP scan take over 18 hours unless scoped to top ports (`--top-ports 50`).',
      },
      {
        mistake: 'Confusing a Filtered port with an Open port.',
        fix: 'Filtered means Nmap received no packet back or an ICMP type 3 code (filtered by packet filter). Never assume a service is running on a filtered port without further probe evidence.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the technical difference between an Nmap FIN scan (-sF), Xmas scan (-sX), and Null scan (-sN)?',
        answer:
          'These RFC 793 inverse scans exploit TCP state handling: any TCP segment sent to a closed port without SYN, RST, or ACK must trigger an RST response. An open port simply drops the segment silently. Null scan sets no flags (0). FIN sets only FIN. Xmas sets FIN, PSH, and URG flags (lit up like a Christmas tree). They work against Unix/Linux systems but fail against Windows/Cisco, which send RSTs regardless.',
      },
      {
        question: 'How do you detect if a web service is behind a Web Application Firewall (WAF) using Nmap?',
        answer:
          'Using the Nmap Scripting Engine (NSE) script `http-waf-detect` or `http-waf-fingerprint`: e.g. `nmap -p 80,443 --script http-waf-detect <target>`. These send benign non-standard payloads and analyze response status codes (such as 403, 406, 501) and headers (like CF-RAY, Server: cloudflare, AWSALB) to identify WAF interception.',
      },
    ],
    practiceExercise: {
      title: 'Differentiate Open vs Closed vs Filtered in Local Lab',
      objective: 'Run an Nmap scan against a known open port, a known closed port, and use iptables to simulate a filtered port.',
      safeLabInstructions:
        'On your local Linux VM, start an HTTP server on port 8080 (`python3 -m http.server 8080 &`). Block port 9999 with iptables: `sudo iptables -A INPUT -p tcp --dport 9999 -j DROP`. Run `nmap -p 8080,8888,9999 localhost` and review the states.',
      hint: '8080 should be open, 8888 should be closed, and 9999 should be filtered.',
      solution:
        'Nmap will report 8080/tcp open, 8888/tcp closed (kernel sent RST), and 9999/tcp filtered (iptables DROP caused probe to time out). Clean up with `sudo iptables -D INPUT -p tcp --dport 9999 -j DROP`.',
    },
  },

  // ==========================================
  // LINUX SECURITY
  // ==========================================
  {
    id: 'linux-permissions-suid',
    title: 'Linux Permissions, SUID/SGID & Privilege Auditing',
    categoryId: 'linux',
    difficulty: 'Beginner',
    summary: 'Understand Unix octal & symbolic permissions, SUID/SGID execution bits, and how privilege boundaries are audited.',
    tags: ['Linux', 'Permissions', 'SUID', 'chmod', 'Privilege Escalation'],
    simpleExplanation:
      'Think of files as personal safety deposit boxes. The owner, group members, and the public each have specific keys: Read (peek inside), Write (modify contents), and Execute (run as a program). The SUID (Set User ID) bit is like a temporary master badge: when you run that specific binary, the operating system runs it with the permissions of the file owner (often root) instead of your current account, as needed for utilities like `passwd`.',
    keyConcepts: [
      'Permission Octets: Read = 4, Write = 2, Execute = 1. `chmod 755` = rwxr-xr-x (Owner: read/write/exec; Group: read/exec; Others: read/exec).',
      'Special Bits: SUID (octal 4000, `rws------`) runs with file owner privileges; SGID (octal 2000, `r-xr-s---`) runs with file group privileges; Sticky bit (octal 1000, `rwxrwxrwt`) prevents users from deleting others files in shared folders like `/tmp`.',
      'Privilege Risk: If an executable owned by root has the SUID bit set AND allows shell escaping, arbitrary file reads/writes, or loads untrusted dynamic libraries, an unprivileged user can leverage it to gain root privileges (documented on GTFOBins).',
      'Principle of Least Privilege: Non-essential binaries should NEVER have SUID permissions.',
    ],
    safePracticalExample: {
      scenario: 'Auditing SUID Binaries on an Authorized Lab Machine',
      labEnvironment: 'Debian/Ubuntu Linux virtual machine or container.',
      walkthrough:
        'Search the filesystem for all executables with SUID permissions. Compare them against the standard baseline list of legitimate Linux SUID programs (such as `/usr/bin/passwd`, `/usr/bin/sudo`, `/usr/bin/newgrp`) to detect any anomalous or misconfigured binaries.',
    },
    authorizedCommands: [
      {
        command: 'find / -perm -4000 -type f 2>/dev/null',
        explanation: 'Recursively searches the filesystem from root for files with SUID bit set, suppressing permission denied errors.',
        flagsExplanation: '-perm -4000: files with SUID bit (octal 4000); -type f: regular files only; 2>/dev/null: redirects stderr (errors) to black hole.',
      },
      {
        command: 'ls -l /usr/bin/passwd',
        explanation: 'Inspects the permissions of the standard passwd binary to observe the SUID "s" flag in the user execution field.',
      },
      {
        command: 'sudo -l',
        explanation: 'Lists the allowed (and forbidden) commands for the invoking user on the current host according to `/etc/sudoers`.',
      },
    ],
    expectedOutput: {
      command: 'ls -l /usr/bin/passwd',
      rawOutput: `-rwsr-xr-x 1 root root 68208 Nov 29  2023 /usr/bin/passwd`,
      breakdown:
        'The `s` in `-rwsr-xr-x` indicates SUID is enabled and the file is executable. When user `alice` runs `/usr/bin/passwd`, the process temporarily executes as `root`, which allows updating `/etc/shadow` securely, then relinquishes root privileges.',
    },
    commonMistakes: [
      {
        mistake: 'Setting `chmod 777` on files or directories to "fix" permission issues.',
        fix: '`chmod 777` grants full read, write, and execute permissions to all local accounts and web server daemons, introducing severe security vulnerabilities. Always use minimum required permissions (e.g., `chmod 640` for sensitive configs, `chmod 750` for scripts).',
      },
      {
        mistake: 'Thinking SUID scripts written in Bash work automatically on modern Linux.',
        fix: 'Modern Linux kernels ignore the SUID bit on interpreted scripts (`#!/bin/bash`) to prevent race condition attacks; SUID only applies to compiled ELF binary executables.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the sticky bit, where is it used in Linux by default, and why is it critical for multi-user security?',
        answer:
          'The sticky bit (indicated by `t` in `rwxrwxrwt`, octal 1000) is applied to shared directories like `/tmp` and `/var/tmp`. In a standard world-writable directory (`chmod 777`), any user can delete or rename files belonging to another user. The sticky bit restricts file deletion and renaming strictly to the file owner, directory owner, or root.',
      },
      {
        question: 'If you discover that `/usr/bin/find` has the SUID bit set and is owned by root, why is this a severe security finding?',
        answer:
          '`find` contains built-in execution flags (`-exec`). Because SUID makes the process run as root, an unprivileged user can run: `/usr/bin/find . -exec /bin/sh -p \\; -quit`, immediately spawning an interactive root shell. Any binary documented on GTFOBins with shell escape capabilities must never be given SUID.',
      },
    ],
    practiceExercise: {
      title: 'Audit and Remediate a Misconfigured SUID Lab Binary',
      objective: 'Identify an insecure test binary with SUID and safely remove the SUID bit.',
      safeLabInstructions:
        'In your local test VM: create a test copy: `cp /bin/cp /tmp/cp_test && chmod u+s /tmp/cp_test`. Verify its permissions with `ls -l /tmp/cp_test`. Then remediate it by removing the SUID bit.',
      hint: 'Use `chmod u-s /tmp/cp_test` or `chmod 0755 /tmp/cp_test`.',
      solution:
        'Running `chmod u-s /tmp/cp_test` removes the SUID bit. Verify with `ls -l /tmp/cp_test`; the permission string changes from `-rwsr-xr-x` back to `-rwxr-xr-x`. Then delete the test file with `rm /tmp/cp_test`.',
    },
  },

  // ==========================================
  // WEB APPLICATION SECURITY (OWASP TOP 10)
  // ==========================================
  {
    id: 'sql-injection-fundamentals',
    title: 'SQL Injection (SQLi) & Parameterized Queries',
    categoryId: 'web',
    difficulty: 'Intermediate',
    summary: 'Understand how unvalidated user input corrupts database query logic, Union-based queries, and defensive parameterized statements.',
    tags: ['OWASP', 'SQLi', 'Web Security', 'Database', 'Secure Coding'],
    simpleExplanation:
      'Imagine filling out a bank slip where the teller asks for your account number. Instead of writing just "12345", you write: "12345 OR transfer all money to me". If the teller blindly obeys whatever text you write without separating your data from their instructions, you tricked their system! In SQL injection, attacker input is accidentally executed as database code because dynamic queries concatenate user input directly into SQL strings.',
    keyConcepts: [
      'Root Cause: Mixing user data with SQL code interpreters via string concatenation instead of strongly-typed query parameters.',
      'Types of SQLi: In-band (Union-based, Error-based), Inferential / Blind (Boolean-based, Time-based), and Out-of-Band (DNS/HTTP exfiltration).',
      'UNION-Based Attack Mechanics: Allows an attacker to append results from other tables if the injected query matches the number of columns and compatible data types of the original query.',
      'Primary Remediation: Parameterized Queries (Prepared Statements) and Object Relational Mappers (ORMs) that treat user input strictly as literal values, never executable syntax.',
    ],
    safePracticalExample: {
      scenario: 'Authorized Testing on OWASP Juice Shop or DVWA (Damn Vulnerable Web App)',
      labEnvironment: 'Local Docker container running `bkimminich/juice-shop` or `vulnerables/web-dvwa` on `http://localhost:3000`.',
      walkthrough:
        "In DVWA SQL Injection module (Security Level: Low), observe the vulnerable PHP code querying by user ID. Test with benign inputs, then observe how a single quote breaks syntax, and how ' OR '1'='1 forces the query condition to always evaluate to TRUE.",
    },
    authorizedCommands: [
      {
        command: 'curl -s "http://localhost:8080/vulnerabilities/sqli/?id=1&Submit=Submit" -H "Cookie: PHPSESSID=labcookie; security=low"',
        explanation: 'Sends an authorized baseline HTTP request to a local DVWA instance with ID=1.',
      },
      {
        command: 'curl -s "http://localhost:8080/vulnerabilities/sqli/?id=1%27+OR+%271%27%3D%271&Submit=Submit" -H "Cookie: PHPSESSID=labcookie; security=low"',
        explanation: 'Sends a URL-encoded payload `1\' OR \'1\'=\'1` to observe if all database records are returned.',
      },
    ],
    expectedOutput: {
      command: 'curl -s "http://localhost:8080/vulnerabilities/sqli/?id=1%27+OR+%271%27%3D%271&Submit=Submit"',
      rawOutput: `<div class="vulnerable_code_area">
<pre>ID: 1<br />First name: admin<br />Surname: admin</pre>
<pre>ID: 2<br />First name: Gordon<br />Surname: Brown</pre>
<pre>ID: 3<br />First name: Hack<br />Surname: Me</pre>
<pre>ID: 4<br />First name: Pablo<br />Surname: Picasso</pre>
<pre>ID: 5<br />First name: Bob<br />Surname: Smith</pre>
</div>`,
      breakdown:
        'Because the query was constructed as `SELECT first_name, last_name FROM users WHERE user_id = \'1\' OR \'1\'=\'1\'`, the condition `\'1\'=\'1\'` is always TRUE for every row, leaking all user records in the table.',
    },
    commonMistakes: [
      {
        mistake: 'Relying on client-side regex or input blacklisting (e.g., stripping out quotes or "UNION").',
        fix: 'Blacklists are easily bypassed through character encoding, double quotes, case variations, or alternative SQL syntax. Always use parameterized queries (prepared statements) with bound parameters.',
      },
      {
        mistake: 'Assuming stored procedures are inherently safe from SQL Injection.',
        fix: 'If a stored procedure concatenates strings internally (e.g. `EXECUTE IMMEDIATE \'SELECT ... \' || input`), it remains completely vulnerable to SQLi.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why do Prepared Statements completely prevent SQL Injection at the architectural level?',
        answer:
          'In a Prepared Statement, the database engine compiles the SQL query structure (Abstract Syntax Tree) FIRST with placeholders (`?` or `:name`). When the user values are supplied later, the database engine treats them strictly as literal scalar data parameters. Even if the input string contains quotes, semicolons, or SQL keywords, the database never parses them as SQL syntax instructions.',
      },
      {
        question: 'How does Time-Based Blind SQL Injection work, and when is it employed by security testers?',
        answer:
          'Time-Based Blind SQLi is used when an application provides no visible database output and no database error messages (completely silent responses). The tester injects a conditional payload instructing the database to pause (e.g. `pg_sleep(5)`, `WAITFOR DELAY \'0:0:5\'`, or `SLEEP(5)`) if a specific boolean condition is true. By measuring server response latency, the tester reconstructs data bit by bit.',
      },
    ],
    practiceExercise: {
      title: 'Analyze Vulnerable PHP vs Remediated PDO Code',
      objective: 'Inspect a vulnerable dynamic query and rewrite it using PHP PDO prepared statements.',
      safeLabInstructions:
        'Compare: Vulnerable: `$stmt = $db->query("SELECT * FROM users WHERE email = \'" . $_POST["email"] . "\'");`. Write the secure PDO version using parameter binding.',
      hint: 'Use `$db->prepare()` with a placeholder `:email` and `$stmt->execute([\':email\' => $_POST[\'email\']])`.',
      solution:
        'Secure version:\n```php\n$stmt = $db->prepare("SELECT id, username, email FROM users WHERE email = :email");\n$stmt->execute([":email" => $_POST["email"]]);\n$user = $stmt->fetch();\n```\nThis guarantees safe execution regardless of input characters.',
    },
  },

  {
    id: 'cross-site-scripting-xss',
    title: 'Cross-Site Scripting (XSS) & Content Security Policy',
    categoryId: 'web',
    difficulty: 'Intermediate',
    summary: 'Master Reflected, Stored, and DOM XSS mechanics, cookie security flags (HttpOnly), and Content Security Policy (CSP) headers.',
    tags: ['OWASP', 'XSS', 'Web Security', 'CSP', 'JavaScript'],
    simpleExplanation:
      'Imagine ordering a personalized birthday cake with your name piped in icing. Instead of your name, you submit: "CANCEL ALL ORDERS AND GIVE EVERYONE FREE CAKE". If the baker blindly pipes it onto a remote ordering monitor that interprets it as a command, chaos ensues. XSS happens when a web application takes untrusted user input and renders it directly inside the web browser without HTML encoding, causing the victim browser to execute unauthorized JavaScript.',
    keyConcepts: [
      'Reflected XSS: The payload is part of the immediate HTTP request (e.g., in URL query parameters) and echoed back in the immediate response page.',
      'Stored (Persistent) XSS: The payload is saved in the database (e.g., forum comment, user bio) and executed in every victim browser that views the page.',
      'DOM-Based XSS: The vulnerability exists purely in client-side JavaScript that writes untrusted sources (e.g. `location.hash`) into dangerous execution sinks (e.g. `innerHTML`, `document.write()`, `eval()`).',
      'Defenses: Context-aware output encoding (HTML, JavaScript, Attribute, CSS), modern frameworks with automatic escaping (React/Angular), `HttpOnly` cookie flags (prevents `document.cookie` theft), and strict Content Security Policy (CSP).',
    ],
    safePracticalExample: {
      scenario: 'Testing Reflected XSS in an Authorized Lab Form',
      labEnvironment: 'PortSwigger Web Security Academy lab: "Reflected XSS into HTML context with nothing encoded".',
      walkthrough:
        'In the search box of the lab, enter a benign test probe `<h1>SecurityAudit</h1>`. If the page renders a large header rather than literal text `<h1>`, the application is failing to encode HTML tags. Next test with a safe benign prompt `test" onerror="console.log(1)` on an image tag.',
    },
    authorizedCommands: [
      {
        command: 'curl -s "http://localhost:8080/search?q=%3Cscript%3Econsole.log(%27AuditTest%27)%3C%2Fscript%3E"',
        explanation: 'Sends a safe test string containing a script tag that logs a benign message to the console.',
      },
    ],
    expectedOutput: {
      command: 'curl -s "http://localhost:8080/search?q=%3Cscript%3Econsole.log(%27AuditTest%27)%3C%2Fscript%3E"',
      rawOutput: `<div class="search-results">
  <p>Search results for: <script>console.log('AuditTest')</script></p>
  <p>0 results found.</p>
</div>`,
      breakdown:
        'The response reflects the exact `<script>` tag verbatim into the HTML body without HTML entity encoding (`&lt;script&gt;`). When viewed in a web browser, the JavaScript executes immediately in the context of the user origin.',
    },
    commonMistakes: [
      {
        mistake: 'Believing that setting `HttpOnly` on session cookies completely neutralizes XSS.',
        fix: '`HttpOnly` only stops direct reading of cookies via `document.cookie`. An attacker with XSS can still perform actions on behalf of the victim (CSRF-like actions), read the DOM, steal passwords via fake login overlays, or log keystrokes.',
      },
      {
        mistake: 'Using simple string replacement like `str.replace("<script>", "")`.',
        fix: 'Attackers can bypass this trivially with `<scr<script>ipt>` or alternative event handlers: `<img src=x onerror=alert(1)>`, `<svg onload=alert(1)>`, `<body onload=alert(1)>`. Always encode output contextually.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between DOM XSS and Reflected XSS?',
        answer:
          'In Reflected XSS, the malicious payload is transmitted to the server in an HTTP request and reflected back in the server HTTP response HTML body. In DOM XSS, the payload never necessarily touches the server; the client-side JavaScript code reads data from an unvalidated DOM source (like `location.search` or `window.name`) and unsafely writes it into an execution sink (like `element.innerHTML` or `eval()`).',
      },
      {
        question: 'How does a robust Content Security Policy (CSP) mitigate Cross-Site Scripting?',
        answer:
          'A strong CSP header (e.g. `Content-Security-Policy: default-src \'self\'; script-src \'self\' \'nonce-r@nd0m\'; object-src \'none\';`) restricts the domains from which scripts can be loaded, disables inline script execution (`<script>` tags without matching cryptographic nonces), and blocks dangerous APIs like `eval()`. Even if an attacker injects HTML, the browser refuses to execute untrusted scripts.',
      },
    ],
    practiceExercise: {
      title: 'Remediate a DOM XSS Vulnerable JavaScript Snippet',
      objective: 'Fix an unsafe client-side search display snippet that uses innerHTML.',
      safeLabInstructions:
        'Given: `document.getElementById("output").innerHTML = "Search: " + new URLSearchParams(window.location.search).get("q");`. Rewrite it safely without innerHTML.',
      hint: 'Use `textContent` or `innerText` instead of `innerHTML`.',
      solution:
        'Secure version:\n```javascript\nconst query = new URLSearchParams(window.location.search).get("q") || "";\nconst outputElem = document.getElementById("output");\noutputElem.textContent = "Search: " + query;\n```\n`textContent` treats the string strictly as plain text, preventing any HTML/JS rendering.',
    },
  },

  {
    id: 'idor-broken-access-control',
    title: 'Insecure Direct Object References (IDOR & BOLA)',
    categoryId: 'web',
    difficulty: 'Intermediate',
    summary: 'Analyze OWASP #1 Broken Access Control: horizontal & vertical privilege escalation, identifier tampering, and authorization middleware.',
    tags: ['OWASP', 'IDOR', 'BOLA', 'Access Control', 'API Security'],
    simpleExplanation:
      'Imagine staying at a hotel where your room key has your room number "102" printed on it. You take an elevator to floor 1, walk to door "103", turn your key, and the door unlocks because the lock only checked whether the key had ANY valid hotel shape, without checking if YOU are booked for room 103! IDOR occurs when an application exposes a reference to an internal object (like `/api/invoices/1005`) and fails to verify if the requesting user has permission to access that specific object.',
    keyConcepts: [
      'Horizontal Privilege Escalation: A user accesses data or resources belonging to another peer user with the same privilege tier (e.g., User A viewing User B medical records).',
      'Vertical Privilege Escalation: A standard user accesses administrative or privileged functions (e.g., standard user modifying `/api/admin/users/promote`).',
      'Broken Object Level Authorization (BOLA): The API equivalent of IDOR, listed as #1 on the OWASP API Security Top 10.',
      'Root Cause: Relying solely on authentication (confirming who the user is) without checking authorization (confirming what the user is allowed to access).',
      'Remediation: Enforce server-side authorization checks on every request, scope database queries to the authenticated session context (e.g., `WHERE id = :id AND tenant_id = :current_user_tenant_id`), or use non-enumerable UUIDs/GUIDs alongside access controls.',
    ],
    safePracticalExample: {
      scenario: 'Auditing User Profile Endpoints in an Authorized Test API',
      labEnvironment: 'PortSwigger Web Security Academy lab: "Insecure direct object references" or local Node.js testbed.',
      walkthrough:
        'Log in as test user `wiener`. Download your chat transcript via `GET /download-transcript/2.txt`. Notice the incremental filename or ID. Change the parameter to `1.txt` to verify if the server returns another user transcript without authorization verification.',
    },
    authorizedCommands: [
      {
        command: 'curl -i "http://localhost:8080/api/documents/1042" -H "Authorization: Bearer <user_token_A>"',
        explanation: 'Requests user A authorized document 1042.',
      },
      {
        command: 'curl -i "http://localhost:8080/api/documents/1041" -H "Authorization: Bearer <user_token_A>"',
        explanation: 'Tests whether user A can view document 1041 belonging to User B without 403 Forbidden.',
      },
    ],
    expectedOutput: {
      command: 'curl -i "http://localhost:8080/api/documents/1041" -H "Authorization: Bearer <user_token_A>"',
      rawOutput: `HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 27 Sep 2026 12:45:00 GMT

{
  "documentId": 1041,
  "owner": "bob_internal",
  "confidentialPayroll": "$125,000",
  "status": "APPROVED"
}`,
      breakdown:
        'The server returned HTTP 200 OK and Bob confidential payroll data to User A! This confirms a critical Insecure Direct Object Reference (BOLA) vulnerability because the application failed to verify ownership before returning the record.',
    },
    commonMistakes: [
      {
        mistake: 'Believing that replacing sequential integers (1, 2, 3) with UUIDv4 completely fixes IDOR.',
        fix: 'UUIDs make IDs hard to guess, but they are NOT access control. If a UUID leaks through logs, referrer headers, or another API endpoint, an unauthorized user can still access the object unless server-side authorization is strictly enforced.',
      },
      {
        mistake: 'Performing authorization checks solely in the frontend UI (e.g., hiding the "Edit" button).',
        fix: 'Attackers do not use the UI; they send raw HTTP requests directly to the API endpoint. Every server-side endpoint must independently authorize the request.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the architectural difference between Authentication and Authorization?',
        answer:
          'Authentication (AuthN) is the process of verifying WHO a user or entity is (e.g. via passwords, MFA, biometric tokens, certificates). Authorization (AuthZ) is the process of verifying WHAT permissions or resources that authenticated identity is permitted to access or execute (e.g. role-based access control RBAC, attribute-based access control ABAC, object ownership checks).',
      },
      {
        question: 'How do you design a database repository pattern to prevent IDOR by default?',
        answer:
          'Scope every data retrieval query to the authenticated user or tenant identity. Instead of `SELECT * FROM invoices WHERE id = :invoiceId`, always query: `SELECT * FROM invoices WHERE id = :invoiceId AND user_id = :currentUserId`. If the record does not belong to the user, the database returns 0 rows, naturally throwing a 404 or 403 error.',
      },
    ],
    practiceExercise: {
      title: 'Write an Express.js Authorization Guard for an IDOR Endpoint',
      objective: 'Write an authorization check in Node.js/Express to prevent unauthorized access to an invoice.',
      safeLabInstructions:
        'Given an endpoint `app.get("/invoices/:id", authMiddleware, async (req, res) => ...)`: add the ownership validation check before returning the invoice.',
      hint: 'Fetch invoice, check `if (invoice.ownerId !== req.user.id) return res.status(403).json({ error: "Access denied" });`',
      solution:
        '```javascript\napp.get("/invoices/:id", authMiddleware, async (req, res) => {\n  const invoice = await db.invoices.findById(req.params.id);\n  if (!invoice) return res.status(404).json({ error: "Invoice not found" });\n  \n  // Strict Authorization Check\n  if (invoice.ownerId !== req.user.id && req.user.role !== "ADMIN") {\n    return res.status(403).json({ error: "Forbidden: You do not own this resource" });\n  }\n  \n  return res.json(invoice);\n});\n```',
    },
  },

  // ==========================================
  // CRYPTOGRAPHY & PKI
  // ==========================================
  {
    id: 'crypto-hashing-salting',
    title: 'Cryptographic Hashing, Salting & Password Storage',
    categoryId: 'cryptography',
    difficulty: 'Intermediate',
    summary: 'Distinguish between Hashing, Encryption, and Encoding. Understand collision resistance, rainbow tables, salting, and bcrypt/Argon2.',
    tags: ['Cryptography', 'Hashing', 'Salting', 'bcrypt', 'Passkeys'],
    simpleExplanation:
      'Encryption is like locking a secret note in a safe with a key: with the key, you can lock it and unlock it back to the original text (two-way). Encoding (like Base64) is simply translating words into Morse code so computers can read it—anyone who knows Morse code can instantly translate it (not security). Hashing is like baking a cake from eggs, flour, and sugar: you can never turn the baked cake back into individual eggs (one-way). Salting is adding unique spices to every cake so even cakes made with identical recipes taste unique, preventing attackers from using precomputed cheat sheets (rainbow tables).',
    keyConcepts: [
      'One-Way Property (Pre-image Resistance): Given hash `H(m)`, it must be computationally infeasible to find the original message `m`.',
      'Collision Resistance: It must be computationally infeasible to find any two different messages `m1` and `m2` such that `H(m1) == H(m2)`.',
      'Why Fast Hashes (MD5, SHA-1, SHA-256) Fail for Passwords: Modern GPUs calculate billions of SHA-256 hashes per second, allowing rapid brute-forcing of short passwords.',
      'Slow, Memory-Hard Hashes: Purpose-built algorithms like Argon2id (winner of Password Hashing Competition) and bcrypt introduce adjustable work factors (cost) and memory hardness to defeat GPU/ASIC acceleration.',
      'Cryptographic Salt: A cryptographically secure random value generated per-user and prepended to the password before hashing, guaranteeing that two identical passwords produce completely different hash outputs.',
    ],
    safePracticalExample: {
      scenario: 'Analyzing Password Hash Generation and Verification Locally',
      labEnvironment: 'Local Node.js or Python interactive shell.',
      walkthrough:
        'Using Python `bcrypt` or `hashlib`, generate two SHA-256 hashes of the password "password123". Observe they are identical. Then hash "password123" with bcrypt twice. Observe that bcrypt generates two completely unique hashes due to automatic unique salt generation, yet correctly verifies both.',
    },
    authorizedCommands: [
      {
        command: 'python3 -c "import hashlib; print(hashlib.sha256(b\'password123\').hexdigest())"',
        explanation: 'Generates a standard SHA-256 hash (fast, unsalted - illustrating why fast hashes are unsuitable for passwords).',
      },
      {
        command: 'python3 -c "import bcrypt; pw = b\'password123\'; h1 = bcrypt.hashpw(pw, bcrypt.gensalt(12)); print(h1.decode())"',
        explanation: 'Generates an industry-standard bcrypt hash with work factor 12 (4096 rounds) and automated secure salt.',
      },
    ],
    expectedOutput: {
      command: 'python3 -c "import bcrypt; pw = b\'password123\'; h1 = bcrypt.hashpw(pw, bcrypt.gensalt(12)); print(h1.decode())"',
      rawOutput: `$2b$12$e8Yx9aK01.l2zF9wT48Kae3V8V5XQoF712mJ3W8xI9048Z83m1K6e`,
      breakdown:
        'The bcrypt hash format is parsed as:\n- `$2b$`: bcrypt algorithm identifier.\n- `$12$`: Cost factor (2^12 = 4,096 iterations).\n- `e8Yx9aK01.l2zF9wT48Kae`: The 22-character Base64-encoded 128-bit random salt.\n- `3V8V5XQoF712mJ3W8xI9048Z83m1K6e`: The resulting 31-character ciphertext hash.',
    },
    commonMistakes: [
      {
        mistake: 'Using SHA-256 or MD5 with a single static "hardcoded pepper" to store passwords.',
        fix: 'SHA-256 is designed to be fast for file integrity and digital signatures, not password storage. Attackers with leaked database dumps use hashcat on GPUs to crack billions of SHA-256 hashes per second. Use Argon2id or bcrypt.',
      },
      {
        mistake: 'Reusing the same salt across all users.',
        fix: 'A global salt allows an attacker to generate a single targeted rainbow table for that salt. Salts must be uniquely generated for every single password entry using a cryptographically secure pseudo-random number generator (CSPRNG).',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a Rainbow Table, and why does a unique random cryptographic salt completely defeat it?',
        answer:
          'A rainbow table is a precomputed lookup table of reversed hashes containing millions of common passwords paired with their hash values. An attacker who steals a database of unsalted hashes can instantly look up plaintexts in seconds. A unique random salt ensures that every password has a unique prefix; to use a rainbow table, the attacker would have to compute a separate multimillion-entry table for EVERY individual user salt, making precomputation computationally and storage infeasible.',
      },
      {
        question: 'Explain the difference between Symmetric and Asymmetric encryption, and name standard algorithms for each.',
        answer:
          'Symmetric encryption uses a single shared secret key for both encryption and decryption (e.g. AES-256-GCM, ChaCha20-Poly1305); it is computationally fast and ideal for encrypting bulk data. Asymmetric encryption uses a mathematically linked key pair: a public key for encryption/verification and a private key for decryption/signing (e.g. RSA-4096, ECC/Ed25519); it is slower but solves the key distribution problem (used in TLS key exchanges and SSH).',
      },
    ],
    practiceExercise: {
      title: 'Identify Hash Formats from Hexadecimal Strings',
      objective: 'Given a set of hash strings, identify which algorithm produced them and evaluate their security suitability.',
      safeLabInstructions:
        'Analyze these three hashes:\n1. `5f4dcc3b5aa765d61d8327deb882cf99` (32 hex characters)\n2. `ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f` (64 hex characters)\n3. `$2b$12$...`',
      hint: 'Length: 32 hex = 128-bit; 64 hex = 256-bit; `$2b$` = bcrypt.',
      solution:
        '1. MD5 (128-bit): Cryptographically broken, prone to collision attacks.\n2. SHA-256 (256-bit): Secure for integrity/signatures, but too fast for password storage without slow key derivation.\n3. bcrypt: Purpose-built password hash with tunable work factor and built-in salting.',
    },
  },

  // ==========================================
  // AUTHENTICATION & ACCESS CONTROL
  // ==========================================
  {
    id: 'jwt-security-pitfalls',
    title: 'JSON Web Token (JWT) Security & Signature Verification',
    categoryId: 'auth',
    difficulty: 'Intermediate',
    summary: 'Examine JWT anatomy (Header, Payload, Signature), the "alg: none" flaw, asymmetric vs symmetric signing, and secure token lifecycle.',
    tags: ['JWT', 'Authentication', 'Tokens', 'OAuth', 'Crypto'],
    simpleExplanation:
      'A JWT is like a digital passport stamped with an indelible wax seal. The passport contains your photo and name (Header & Payload in Base64). Anyone can read your name just by looking at it—it is not encrypted! However, immigration officers know the passport is genuine because only the government holds the stamp that created the cryptographic seal (Signature). If someone tampers with your name, the signature calculation will fail.',
    keyConcepts: [
      'JWT Structure: Three parts separated by dots (`.`): Header (algorithm & token type), Payload (claims: `sub`, `exp`, `iat`, `roles`), and Signature.',
      'Base64URL != Encryption: The payload is readable by anyone who intercepts the token. Never store sensitive secrets (passwords, credit cards, PII) in a JWT payload without JWE (JSON Web Encryption).',
      'Signature Verification: `Signature = HMAC-SHA256(base64Url(Header) + "." + base64Url(Payload), secret)`. If a server fails to verify the signature, an attacker can modify claims (e.g. changing `"role": "user"` to `"admin"`).',
      'The "alg: none" Vulnerability: Historic flaw where poorly configured libraries accepted unsigned tokens if the header specified `"alg": "none"`.',
      'Algorithm Confusion (Key Confusion): Forcing an asymmetric RSA verification function to verify using HMAC with the RSA public key treated as the symmetric HMAC secret.',
    ],
    safePracticalExample: {
      scenario: 'Inspecting JWT Claims and Verification in an Authorized Lab',
      labEnvironment: 'PortSwigger Web Security Academy lab: "JWT authentication bypass via unverified signature".',
      walkthrough:
        'Intercept your authentication JWT in Burp Suite. Notice the three parts. Decode the payload in a safe tool. Observe that changing `"sub": "wiener"` to `"sub": "administrator"` without server signature verification grants unauthorized admin dashboard access.',
    },
    authorizedCommands: [
      {
        command: 'python3 -c "import base64, json; h = \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\'; print(json.loads(base64.urlsafe_b64decode(h + \'==\')))"',
        explanation: 'Decodes a sample JWT header safely in terminal without sending data to third-party websites.',
      },
    ],
    expectedOutput: {
      command: 'python3 -c "import base64, json; h = \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\'; print(json.loads(base64.urlsafe_b64decode(h + \'==\')))"',
      rawOutput: `{'alg': 'HS256', 'ty': 'JWT'}`,
      breakdown:
        'The decoded header confirms the token was intended to use HMAC-SHA256 (`HS256`) symmetric signing.',
    },
    commonMistakes: [
      {
        mistake: 'Putting sensitive credentials, API keys, or private medical data into a standard JWT payload.',
        fix: 'A JWT is signed for integrity, NOT encrypted for confidentiality. Anyone with access to the token (or inspecting network requests) can decode Base64 in one second. Use tokens only for identifiers and permissions.',
      },
      {
        mistake: 'Failing to validate the expiration (`exp`) claim or omitting token revocation strategies.',
        fix: 'Always validate `exp`. Because JWTs are stateless, you cannot revoke a leaked token before its expiration unless you maintain a token revocation denylist (e.g. in Redis) or use short-lived access tokens (15 minutes) with refresh token rotation.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the "Algorithm Confusion" attack against JWTs, and how is it remediated?',
        answer:
          'Algorithm confusion occurs when an application configured for asymmetric signing (RS256 with public/private keys) is tricked into using symmetric signing (HS256). The attacker changes the header from `alg: RS256` to `alg: HS256` and signs the token using the server known public key as the HMAC secret key. If the server code blindly trusts the header `alg` without verifying against an allowed algorithm whitelist, it verifies the signature against its own public key and accepts the forged token. Remediate by explicitly hardcoding the expected algorithm in verification options.',
      },
      {
        question: 'Where should JWTs be stored in single-page web applications for maximum security against XSS and CSRF?',
        answer:
          'Storing JWTs in `localStorage` or `sessionStorage` exposes them to complete exfiltration if the application suffers an XSS vulnerability. The industry best practice is storing the token in an `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax`) cookie, preventing JavaScript access while relying on SameSite and anti-CSRF tokens to prevent Cross-Site Request Forgery.',
      },
    ],
    practiceExercise: {
      title: 'Audit a Node.js JWT Verification Implementation',
      objective: 'Identify the critical flaw in a JWT verification code snippet and correct it.',
      safeLabInstructions:
        'Given: `jwt.verify(token, secret, { algorithms: ["HS256", "none"] });`. Identify why `"none"` is a fatal vulnerability and write the secure verification call.',
      hint: 'Never allow `"none"` in the algorithms array.',
      solution:
        'Allowing `"none"` means an attacker can strip the signature, set `"alg": "none"`, and forge arbitrary administrator claims. Fix: `jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });`.',
    },
  },

  // ==========================================
  // SECURITY TOOLS IN AUTHORIZED LABS
  // ==========================================
  {
    id: 'wireshark-packet-analysis',
    title: 'Wireshark Packet Analysis & Protocol Dissection',
    categoryId: 'tools',
    difficulty: 'Beginner',
    summary: 'Inspect live traffic in authorized labs, apply powerful display filters, follow TCP streams, and detect cleartext protocol hazards.',
    tags: ['Wireshark', 'Packet Analysis', 'Network Security', 'PCAP', 'SOC'],
    simpleExplanation:
      'Wireshark is like an X-ray machine for computer networks. While an internet cable looks like a quiet wire from the outside, Wireshark allows you to see every single envelope (packet) traveling across it in real time, inspecting the sender address, destination address, and payload.',
    keyConcepts: [
      'Capture vs Display Filters: Capture filters (`libpcap` syntax like `port 80`) dictate what packets are recorded to disk; Display filters (`wireshark` syntax like `http.request.method == "POST"`) filter what is shown on screen.',
      'Protocol Layers: Frame (physical/link) -> Ethernet II (MAC addresses) -> Internet Protocol (IP addresses) -> Transmission Control Protocol (ports/flags) -> Application Layer (HTTP, DNS, TLS).',
      'Follow TCP Stream: Reconstructs the entire bidirectional conversational data payload of an established TCP session into an easy-to-read text transcript.',
      'Cleartext Hazards: Unencrypted protocols (HTTP, Telnet, FTP, unencrypted LDAP) transmit credentials and session cookies in plain text, visible to anyone capturing packets on the local collision domain.',
    ],
    safePracticalExample: {
      scenario: 'Analyzing an Authorized Sample PCAP File of Cleartext Traffic',
      labEnvironment: 'Wireshark on your local workstation inspecting a sample authorized PCAP capture file from Wireshark Sample Captures repository.',
      walkthrough:
        'Open the sample capture `http.cap`. Apply the display filter `http`. Select an HTTP POST request, right-click, and choose "Follow -> TCP Stream" to observe the cleartext transmission of HTTP headers and form parameters.',
    },
    authorizedCommands: [
      {
        command: 'tshark -r sample.pcap -Y "http.request" -T fields -e ip.src -e ip.dst -e http.host -e http.request.uri',
        explanation: 'Uses the command-line version of Wireshark (TShark) to extract all HTTP request destinations from a saved lab capture file.',
        flagsExplanation: '-r: read capture file; -Y: display filter; -T fields: output specific fields; -e: field names.',
      },
    ],
    expectedOutput: {
      command: 'tshark -r sample.pcap -Y "http.request" -T fields -e ip.src -e ip.dst -e http.host -e http.request.uri',
      rawOutput: `192.168.1.50   192.168.1.10   lab.local   /login.php
192.168.1.50   192.168.1.10   lab.local   /dashboard.php
192.168.1.50   192.168.1.10   lab.local   /api/v1/status`,
      breakdown:
        'TShark extracted the source IP (192.168.1.50), destination web server (192.168.1.10), host header, and URI paths requested during the captured session without opening the GUI.',
    },
    commonMistakes: [
      {
        mistake: 'Confusing Capture Filter syntax with Display Filter syntax.',
        fix: 'Capture filter syntax uses BPF (Berkeley Packet Filter), e.g. `tcp port 80 and host 10.0.0.1`. Display filter syntax uses protocol dissection dots, e.g. `tcp.port == 80 && ip.addr == 10.0.0.1`. Entering display filters in the capture filter box causes a syntax error.',
      },
      {
        mistake: 'Attempting to decrypt TLS 1.3 traffic without the client SSLKEYLOGFILE.',
        fix: 'TLS 1.3 uses Diffie-Hellman ephemeral key exchanges (PFS); even having the server private certificate key is insufficient to decrypt past traffic. You must capture the ephemeral pre-master secrets exported via `SSLKEYLOGFILE`.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What display filter would you use in Wireshark to locate DNS queries for suspicious external domains or high volumes of TXT records (indicating DNS tunneling)?',
        answer:
          'To filter DNS queries: `dns.flags.response == 0`. To identify TXT records specifically: `dns.qry.type == 16`. In incident response, looking for unusually large DNS queries or base64-encoded subdomains (`dns.qry.name`) is a standard methodology for detecting DNS exfiltration or command-and-control (C2) beaconing.',
      },
      {
        question: 'Explain the difference between TCP Keep-Alive and TCP Retransmission in a Wireshark capture.',
        answer:
          'A TCP Keep-Alive is an empty (or 1-byte dummy) probe segment sent after a period of channel silence to verify the peer host is still active and prevent NAT/firewall state table timeout. A TCP Retransmission occurs when a sender has transmitted a segment with data, but the retransmission timer expires before receiving an ACK from the receiver, indicating packet loss or network congestion.',
      },
    ],
    practiceExercise: {
      title: 'Craft Display Filters for an Incident Investigation',
      objective: 'Write three precise Wireshark display filters for common security investigations.',
      safeLabInstructions:
        'Write display filters for:\n1. All HTTP responses with status code 404 (Not Found).\n2. All TCP traffic with the RST flag set.\n3. All traffic between hosts 10.0.0.5 and 10.0.0.20 excluding SSH (port 22).',
      hint: 'Use `http.response.code`, `tcp.flags.reset`, and logical operators `&&`, `!=`.',
      solution:
        '1. `http.response.code == 404`\n2. `tcp.flags.reset == 1`\n3. `(ip.addr == 10.0.0.5 && ip.addr == 10.0.0.20) && tcp.port != 22`',
    },
  },

  {
    id: 'burp-suite-workflows',
    title: 'Burp Suite HTTP Interception & Repeater Workflows',
    categoryId: 'tools',
    difficulty: 'Intermediate',
    summary: 'Configure browser proxying, inspect HTTP/S headers, test rate limits and input validation in Repeater, and configure strict target scope.',
    tags: ['Burp Suite', 'Web Proxy', 'Repeater', 'PortSwigger', 'Web Testing'],
    simpleExplanation:
      'Normally when you browse a website, your browser talks directly to the server like sending letters straight into a mailbox. Burp Suite acts like a personal intercepting postal clerk standing right between your browser and the web server. When you submit a form, the postal clerk pauses the letter in mid-air, hands you a pencil to edit the letter if you want, and only sends it to the server when you click "Forward". This lets security researchers observe raw HTTP headers and test how the server responds to modified inputs.',
    keyConcepts: [
      'Proxy Intercept: Pauses HTTP/HTTPS requests in flight, allowing manual modification of headers, query parameters, cookies, and POST bodies before transmission.',
      'Target Scope: Explicitly defining what hosts are in scope (e.g. `https://*.lab.internal`) and checking "Drop requests not in scope" to ensure you NEVER accidentally send unauthorized test requests to external sites.',
      'Repeater: The primary manual testing tool; allows sending the same HTTP request repeatedly with different parameters while analyzing differences in response headers, status codes, and latency.',
      'Intruder: Automated testing tool for fuzzing and parameter cycling (Community edition includes intentional rate throttling to promote learning and discourage abuse).',
    ],
    safePracticalExample: {
      scenario: 'Analyzing and Modifying an Authorized Lab Profile Request',
      labEnvironment: 'PortSwigger Web Security Academy or local OWASP Juice Shop instance (`http://localhost:3000`).',
      walkthrough:
        'Configure your lab browser proxy to `127.0.0.1:8080`. Add the lab URL to the Burp Target Scope. In Proxy History, find a request to `/rest/user/login`. Right-click and choose "Send to Repeater" (Ctrl+R). In Repeater, modify the parameters to test input validation, and click "Send" to inspect the raw server response.',
    },
    authorizedCommands: [
      {
        command: 'curl -x http://127.0.0.1:8080 -k https://localhost:3000/api/v1/health',
        explanation: 'Routes a curl test request directly through the local Burp Suite proxy listener on port 8080.',
        flagsExplanation: '-x: proxy address; -k: allow insecure/self-signed SSL certificate issued by PortSwigger CA.',
      },
    ],
    expectedOutput: {
      command: 'curl -x http://127.0.0.1:8080 -k https://localhost:3000/api/v1/health',
      rawOutput: `HTTP/1.1 200 OK
Server: Lab-Workstation/1.0
Content-Type: application/json
Content-Length: 18

{"status":"alive"}`,
      breakdown:
        'The request was intercepted and forwarded by Burp Suite proxy. In Burp Suite Proxy History tab, the request and full response headers appear instantly for inspection.',
    },
    commonMistakes: [
      {
        mistake: 'Leaving Proxy "Intercept is ON" and forgetting why web pages in the browser stop loading.',
        fix: 'When Intercept is ON, every single browser background request (CSS, icons, analytics) pauses until manually forwarded. Keep Intercept OFF during normal navigation and inspect requests in the HTTP History tab, sending only targeted requests to Repeater.',
      },
      {
        mistake: 'Failing to import the Burp CA certificate into the browser trust store.',
        fix: 'When testing HTTPS sites, Burp terminates TLS and re-encrypts using its own root CA. Without importing `cacert.der` into the browser Certificate Authorities, the browser will block all traffic with `SEC_ERROR_UNKNOWN_ISSUER`.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is defining and enforcing a Target Scope the very first step in any professional web application security test?',
        answer:
          'Enforcing Target Scope prevents accidental, unauthorized testing of out-of-scope third-party services (such as third-party analytics, payment gateways, CDN providers, or external links) which could lead to service disruption, violation of legal agreements, or unlawful access under CFAA. It also keeps the project file clean and ensures scan logs reflect only authorized client assets.',
      },
      {
        question: 'How do you test for race conditions in modern web applications using Burp Suite Repeater?',
        answer:
          'Using Burp Suite "Send group in parallel (last-byte sync)" feature in Repeater. You group multiple HTTP requests (for example, applying a single-use coupon discount multiple times or withdrawing funds), queue them simultaneously, and Burp sends the initial headers but holds back the final byte of each request until all sockets are ready, releasing them concurrently in the exact same millisecond to test if the server handles concurrent transactions safely.',
      },
    ],
    practiceExercise: {
      title: 'Analyze HTTP Request Headers in Repeater',
      objective: 'Identify which security headers are present or missing in a web application response.',
      safeLabInstructions:
        'Using Burp Repeater or curl against your local test site: verify the presence of `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options`.',
      hint: 'Missing `X-Frame-Options` or `frame-ancestors` makes a site vulnerable to Clickjacking.',
      solution:
        'A hardened web server will return:\n```http\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nContent-Security-Policy: default-src \'self\'\n```\nDocumenting missing headers is a standard finding in web application penetration tests.',
    },
  },
];
