// Domain types shared across the Lazarus engines.

export type CauseOfDeath =
  | "scope-creep"
  | "lost-interest"
  | "shiny-new-thing"
  | "good-enough"
  | "honest-wip"
  | "ghosted"
  | "ran-out-of-weekend";

/** A repository as we care about it (subset of the GitHub REST shape). */
export interface RawRepo {
  id: number;
  name: string;
  full_name: string; // "owner/name"
  description: string | null;
  language: string | null;
  html_url: string;
  created_at: string; // ISO
  pushed_at: string; // ISO
  open_issues_count: number;
  stargazers_count: number;
  forks_count: number;
  size: number; // KB
  archived: boolean;
  fork: boolean;
  topics: string[];
  license: string | null; // license key/name, or null
  /** Optional, filled lazily for the selected repo only. */
  lastCommitMessage?: string | null;
}

/** A scored repository — the unit rendered as a tombstone. */
export interface Grave {
  repo: RawRepo;
  isGrave: boolean;
  daysCold: number; // since last push
  ageDays: number; // created -> last push (lifespan)
  bornYear: number;
  diedYear: number;
  abandonmentScore: number; // 0-100
  causeOfDeath: CauseOfDeath;
}

export interface WrappedStats {
  username: string;
  totalRepos: number; // non-fork repos considered
  graves: number;
  alive: number;
  completionRate: number; // alive / totalRepos, 0-1
  oldestGraveName: string | null;
  longestColdDays: number;
  topCause: CauseOfDeath | null;
  topBuriedLanguage: string | null;
  deadWeightKB: number;
}

/** Health signals fetched lazily for the selected repo. */
export interface RepoSignals {
  hasReadme: boolean;
  hasTests: boolean;
  hasCI: boolean;
  hasLicense: boolean;
  openIssues: number;
  lastCommitMessage: string | null;
}

export type RevivalDifficulty = "shallow-grave" | "six-feet-under" | "ancient-burial";

export interface ChecklistItem {
  task: string;
  priority: number; // lower = do first
}

export interface RevivalPlan {
  repoName: string;
  diagnosis: string[];
  checklist: ChecklistItem[];
  difficulty: RevivalDifficulty;
  estimatedSessions: number;
  copilotInstructions: string; // markdown body of .github/copilot-instructions.md
  prompts: string[]; // copy-paste GitHub Copilot prompts
}
