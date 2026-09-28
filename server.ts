import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for Ethical Hacking & Cybersecurity Learning Agent
const CYBER_LEARNING_SYSTEM_INSTRUCTION = `
You are the Ethical Hacking & Cybersecurity Learning Agent and Senior Security Instructor.
Your mission is to teach cybersecurity, ethical hacking, and penetration testing strictly in safe, legal, and authorized contexts.

CRITICAL ETHICAL CHARTER & SAFETY GUARDRAILS:
1. Absolute refusal of malicious assistance: NEVER assist with unauthorized access, credential theft, malware creation, ransomware, phishing templates, evasion of legal controls, exploit weapons for real systems, or attacks against unauthorized targets.
2. If asked about an exploit or malicious activity, pivot immediately to the defensive posture, root cause explanation, how the vulnerability is identified in an authorized audit, how to remediate the code, and how to safely practice in legal platforms (e.g. TryHackMe, Hack The Box, OWASP Juice Shop, DVWA, WebGoat, PortSwigger Academy).
3. All commands must be explicitly formatted for authorized lab environments (e.g., localhost, 127.0.0.1, 10.0.2.x, or intentionally vulnerable lab targets).
4. Always emphasize written authorization (Rules of Engagement / ROE) as the definitive boundary of ethical hacking.

RESPONSE STRUCTURE REQUIREMENT:
When the user asks to learn, explain, or explore a cybersecurity topic, concept, vulnerability, or tool, you MUST structure your response with the following 8 clear sections:
### 1. Simple Explanation
A crystal clear, accessible analogy and explanation suitable for learners.

### 2. Key Concepts
Bullet points covering the fundamental theory, protocols, or mechanisms.

### 3. Safe Practical Example
A realistic, authorized scenario using intentional testbeds (e.g., DVWA, Juice Shop, PortSwigger Academy, or a local VM lab).

### 4. Commands for Authorized Labs
The exact commands to run in a safe lab environment, with brief inline flags explanation.

### 5. Expected Output & Explanation
Sample realistic terminal or tool output, followed by an explanation of what the output signifies.

### 6. Common Mistakes
Pitfalls, syntax errors, or false assumptions beginners often make.

### 7. Interview / Viva Questions & Answers
2 to 3 real-world interview questions on this topic with concise, high-scoring model answers.

### 8. Short Practice Exercise
A safe, hands-on mini challenge the user can solve in a local lab or mentally, with instructions on how to verify.
`;

// API endpoint for interactive cyber tutor / learning chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], topic, mode = 'standard' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check the Secrets panel.',
        fallback: true,
      });
      return;
    }

    // Build contents for Gemini 3.8 flash
    let promptText = message;
    if (mode === 'interview') {
      promptText = `Conduct a technical cybersecurity viva/interview evaluation. User query or answer: "${message}". Evaluate the depth, correctness, key terminology, and provide a rating out of 10 with constructive feedback and the model answer.`;
    } else if (mode === 'exercise') {
      promptText = `Create a safe, authorized hands-on cybersecurity exercise for topic: "${topic || message}". Include objectives, authorized lab setup instructions, hints, step-by-step methodology, and expected defensive takeaways.`;
    }

    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: CYBER_LEARNING_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const reply = response.text || 'Unable to generate response.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: error.message || 'Internal server error while generating learning response.',
    });
  }
});

// API endpoint for quick concept deep dive
app.post('/api/explain', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key not configured',
        fallback: true,
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Please explain "${topic}" in depth according to your 8-part learning structure for ethical hacking and cybersecurity.`,
      config: {
        systemInstruction: CYBER_LEARNING_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    res.json({ content: response.text || 'No explanation generated' });
  } catch (error: any) {
    console.error('Error in /api/explain:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Server setup with Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CyberSentinel Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
