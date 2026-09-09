/**
 * NEXUS EDU — Core Type Definitions
 *
 * These types form the backbone of the entire platform.
 * All core engine modules import from this single file.
 * ZERO UI/React dependencies — pure data shapes only.
 */

// ─────────────────────────────────────────────
// 1. PROBLEM GENERATION TYPES
// ─────────────────────────────────────────────

/** Defines how a variable is generated during problem creation */
export interface VariableDefinition {
  /** Variable name (used in template substitution as {{name}}) */
  name: string;
  /** How the variable value is produced */
  type: 'integer' | 'choice' | 'computed';
  /** Min value (inclusive) for integer type */
  min?: number;
  /** Max value (inclusive) for integer type */
  max?: number;
  /** Step for integer generation (default: 1) */
  step?: number;
  /** Values to exclude from generation */
  exclude?: number[];
  /** Options array for 'choice' type */
  options?: (string | number)[];
  /** JS expression string for 'computed' type, evaluated with prior variables in scope */
  formula?: string;
}

/**
 * A parametric problem template — the "DNA" from which infinite problems are generated.
 *
 * Templates use backward (solution-first) generation:
 * 1. Generate answer/solution parameters first
 * 2. Build the question around those parameters
 * 3. Guarantees clean, pedagogically sound problems
 */
export interface ProblemTemplate {
  /** Unique identifier */
  id: string;
  /** The skill this template tests */
  skillId: string;
  /** Human-readable title */
  title: string;
  /** Difficulty on Elo scale (calibrated through usage) */
  difficulty: number;
  /** Difficulty tier for filtering (0.0 to 1.0) */
  difficultyTier: number;
  /** Variable definitions — order matters (earlier vars available to later computed vars) */
  variables: VariableDefinition[];
  /** JS boolean expressions that must ALL be true for valid generation */
  constraints: string[];
  /** Question template with {{var}} placeholders, supports LaTeX */
  questionTemplate: string;
  /** LaTeX template or expression for the correct answer */
  answerFormula: string;
  /** Answer type for evaluation */
  answerType: 'number' | 'expression' | 'fraction' | 'multiple-choice' | 'set';
  /** For multiple-choice: formulas to generate wrong but plausible distractors */
  distractorFormulas?: string[];
  /** Step-by-step explanation template with {{var}} placeholders and LaTeX */
  explanationTemplate: string;
  /** Progressive hints (ordered from gentle nudge to near-answer) */
  hintTemplates: string[];
  /** Tags for categorization */
  tags?: string[];
}

/** A fully generated problem instance ready to serve to a student */
export interface GeneratedProblem {
  /** The template ID this was generated from */
  templateId: string;
  /** The skill being tested */
  skillId: string;
  /** Rendered question string (with LaTeX) */
  question: string;
  /** The correct answer (evaluated) */
  answer: number | string;
  /** Rendered step-by-step explanation */
  explanation: string;
  /** Rendered hints */
  hints: string[];
  /** The generated parameter values (for novelty tracking) */
  parameters: Record<string, number | string>;
  /** Hash of parameters (for deduplication) */
  parameterHash: string;
  /** Difficulty on Elo scale */
  difficulty: number;
  /** Multiple-choice options (if applicable) */
  choices?: { label: string; value: string; isCorrect: boolean }[];
}

// ─────────────────────────────────────────────
// 2. STUDENT & PROFILE TYPES
// ─────────────────────────────────────────────

/** Complete student profile — the "Student DNA" */
export interface StudentProfile {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Role */
  role: 'student' | 'teacher';
  /** When the profile was created */
  createdAt: string;
  /** Last activity timestamp */
  lastActiveAt: string;
  /** Overall Elo ability rating */
  overallAbility: number;
  /** Per-skill ability ratings */
  skillAbilities: Record<string, number>;
  /** Per-skill mastery levels (0.0 to 1.0) */
  skillMastery: Record<string, number>;
  /** Streak data */
  streak: StreakData;
  /** Cumulative statistics */
  stats: StudentStats;
  /** Set of parameter hashes already seen (for novelty guarantee) */
  seenProblemHashes: string[];
  /** Active curriculum board */
  curriculumId: string;
}

/** Daily engagement streak tracking */
export interface StreakData {
  /** Current consecutive days */
  current: number;
  /** All-time best streak */
  best: number;
  /** Last date a problem was solved (ISO date string YYYY-MM-DD) */
  lastActiveDate: string;
  /** Total active days ever */
  totalActiveDays: number;
}

/** Cumulative student statistics */
export interface StudentStats {
  /** Total problems attempted */
  totalProblems: number;
  /** Total correct answers */
  totalCorrect: number;
  /** Total time spent learning (seconds) */
  totalTimeSeconds: number;
  /** Total sessions completed */
  totalSessions: number;
  /** Problems solved today */
  problemsToday: number;
  /** Date of today's count (ISO date string YYYY-MM-DD) */
  todayDate: string;
}

// ─────────────────────────────────────────────
// 3. INTERACTION & ASSESSMENT TYPES
// ─────────────────────────────────────────────

/** Record of a single problem interaction */
export interface ProblemInteraction {
  /** Auto-generated ID */
  id?: number;
  /** Student who attempted this */
  studentId: string;
  /** Skill being tested */
  skillId: string;
  /** Template used */
  templateId: string;
  /** Problem difficulty (Elo) */
  difficulty: number;
  /** Whether the student answered correctly */
  isCorrect: boolean;
  /** Student's raw answer */
  studentAnswer: string;
  /** Correct answer */
  correctAnswer: string;
  /** Time taken to answer (milliseconds) */
  responseTimeMs: number;
  /** Number of hints used (0 = no hints) */
  hintsUsed: number;
  /** Whether scratchpad was used */
  usedScratchpad: boolean;
  /** Parameter hash (for analytics) */
  parameterHash: string;
  /** Timestamp */
  timestamp: string;
  /** Student ability BEFORE this interaction */
  abilityBefore: number;
  /** Student ability AFTER this interaction */
  abilityAfter: number;
  /** Detected misconception (if any) */
  misconception?: string;
}

/** A learning session summary */
export interface SessionSummary {
  /** Auto-generated ID */
  id?: number;
  /** Student ID */
  studentId: string;
  /** Session start time */
  startedAt: string;
  /** Session end time */
  endedAt: string;
  /** Duration in seconds */
  durationSeconds: number;
  /** Number of problems attempted */
  problemsAttempted: number;
  /** Number correct */
  problemsCorrect: number;
  /** Accuracy percentage (0-100) */
  accuracy: number;
  /** Skills touched during session */
  skillsTouched: string[];
  /** Ability change during session */
  abilityDelta: number;
  /** Whether this was a review session */
  isReviewSession: boolean;
}

// ─────────────────────────────────────────────
// 4. CURRICULUM & KNOWLEDGE GRAPH TYPES
// ─────────────────────────────────────────────

/** A skill node in the curriculum knowledge graph */
export interface SkillNode {
  /** Unique skill identifier (e.g., 'linear-eq-one-step') */
  id: string;
  /** Human-readable title */
  title: string;
  /** Longer description of what this skill covers */
  description: string;
  /** Parent skill cluster (for grouping in UI) */
  cluster: string;
  /** IDs of prerequisite skills (in-edges) */
  prerequisites: string[];
  /** IDs of dependent skills (out-edges, computed at runtime) */
  dependents: string[];
  /** Base difficulty on Elo scale */
  baseDifficulty: number;
  /** Estimated time to learn (minutes) */
  estimatedMinutes: number;
  /** Icon or emoji for visual display */
  icon: string;
  /** Order within cluster for display */
  order: number;
}

/** A curriculum definition (e.g., "Grade 8 Algebra - CBSE") */
export interface CurriculumDefinition {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Subject */
  subject: string;
  /** Grade level */
  grade: number;
  /** Board/standard (e.g., 'CBSE', 'Common Core') */
  board: string;
  /** All skill nodes */
  skills: SkillNode[];
  /** All problem templates */
  templates: ProblemTemplate[];
}

// ─────────────────────────────────────────────
// 5. ADAPTIVE LEARNING TYPES
// ─────────────────────────────────────────────

/** Result of a ZPD ability update */
export interface AbilityUpdate {
  /** Skill that was updated */
  skillId: string;
  /** Ability before the interaction */
  oldAbility: number;
  /** Ability after the interaction */
  newAbility: number;
  /** Change amount */
  delta: number;
  /** Predicted success probability before the interaction */
  predictedProbability: number;
  /** Actual outcome */
  actualOutcome: boolean;
}

/** What the session orchestrator decides to serve next */
export interface NextAction {
  /** What type of action */
  type: 'new-problem' | 'review-problem' | 'remediation' | 'synthesis' | 'session-complete';
  /** The skill to work on */
  skillId?: string;
  /** The generated problem (for problem types) */
  problem?: GeneratedProblem;
  /** Reason for this action (for debugging/logging) */
  reason: string;
  /** For synthesis: prompt for student to explain */
  synthesisPrompt?: string;
  /** For remediation: the path of skills to remediate */
  remediationPath?: string[];
}

/** Mastery level thresholds */
export enum MasteryLevel {
  /** < 0.2 — Not started or very weak */
  NotStarted = 'not-started',
  /** 0.2 - 0.5 — Developing understanding */
  Developing = 'developing',
  /** 0.5 - 0.75 — Approaching mastery */
  Approaching = 'approaching',
  /** 0.75 - 0.9 — Proficient */
  Proficient = 'proficient',
  /** > 0.9 — Mastered */
  Mastered = 'mastered',
}

/**
 * Returns the mastery level enum for a given mastery score (0.0 to 1.0)
 */
export function getMasteryLevel(score: number): MasteryLevel {
  if (score < 0.2) return MasteryLevel.NotStarted;
  if (score < 0.5) return MasteryLevel.Developing;
  if (score < 0.75) return MasteryLevel.Approaching;
  if (score < 0.9) return MasteryLevel.Proficient;
  return MasteryLevel.Mastered;
}

/**
 * Returns a color for the mastery level (for UI rendering)
 */
export function getMasteryColor(level: MasteryLevel): string {
  switch (level) {
    case MasteryLevel.NotStarted: return '#6b7280';  // gray
    case MasteryLevel.Developing: return '#ef4444';   // red
    case MasteryLevel.Approaching: return '#f59e0b';  // amber
    case MasteryLevel.Proficient: return '#3b82f6';   // blue
    case MasteryLevel.Mastered: return '#10b981';     // green
  }
}
