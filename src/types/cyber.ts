export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type CategoryId =
  | 'networking'
  | 'linux'
  | 'web'
  | 'cryptography'
  | 'auth'
  | 'tools';

export interface CommandItem {
  command: string;
  explanation: string;
  flagsExplanation?: string;
}

export interface ExpectedOutput {
  command: string;
  rawOutput: string;
  breakdown: string;
}

export interface CommonMistake {
  mistake: string;
  fix: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  keyKeywords: string[];
  difficulty: Difficulty;
  category: CategoryId;
}

export interface PracticeExercise {
  title: string;
  objective: string;
  safeLabInstructions: string;
  hint: string;
  solution: string;
}

export interface CurriculumTopic {
  id: string;
  title: string;
  categoryId: CategoryId;
  difficulty: Difficulty;
  summary: string;
  tags: string[];

  // The 8 user-mandated sections
  simpleExplanation: string;
  keyConcepts: string[];
  safePracticalExample: {
    scenario: string;
    labEnvironment: string;
    walkthrough: string;
  };
  authorizedCommands: CommandItem[];
  expectedOutput: ExpectedOutput;
  commonMistakes: CommonMistake[];
  interviewQuestions: {
    question: string;
    answer: string;
  }[];
  practiceExercise: PracticeExercise;
}

export interface VulnerabilityDemo {
  id: string;
  title: string;
  category: string;
  owaspRank: string;
  cwe: string;
  overview: string;
  vulnerableCode: {
    language: string;
    code: string;
    explanation: string;
  };
  remediatedCode: {
    language: string;
    code: string;
    explanation: string;
  };
  interactiveTester: {
    prompt: string;
    samplePayloads: { label: string; payload: string }[];
    simulateBehavior: (payload: string) => {
      vulnerableOutcome: {
        status: 'breached' | 'safe';
        output: string;
        details: string;
      };
      remediatedOutcome: {
        status: 'breached' | 'safe';
        output: string;
        details: string;
      };
    };
  };
  remediationChecklist: string[];
}

export interface CvssMetrics {
  attackVector: 'N' | 'A' | 'L' | 'P'; // Network, Adjacent, Local, Physical
  attackComplexity: 'L' | 'H'; // Low, High
  privilegesRequired: 'N' | 'L' | 'H'; // None, Low, High
  userInteraction: 'N' | 'R'; // None, Required
  scope: 'U' | 'C'; // Unchanged, Changed
  confidentiality: 'H' | 'L' | 'N'; // High, Low, None
  integrity: 'H' | 'L' | 'N'; // High, Low, None
  availability: 'H' | 'L' | 'N'; // High, Low, None
}

export interface Finding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  cvssScore: number;
  cvssVector: string;
  affectedAsset: string;
  cwe: string;
  description: string;
  reproductionSteps: string;
  businessImpact: string;
  remediation: string;
}

export interface PentestReport {
  clientName: string;
  assessmentType: string;
  assessorName: string;
  date: string;
  executiveSummary: string;
  scope: string[];
  rulesOfEngagement: string;
  findings: Finding[];
}
