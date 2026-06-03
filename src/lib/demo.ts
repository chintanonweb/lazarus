import type { RawRepo, RepoSignals } from "./types";

// A curated, believable graveyard so Lazarus is fully explorable with zero
// network and zero auth — judges and first-time visitors get the full effect.
export const DEMO_USERNAME = "octodev";

const DAY = 86400000;
const isoAgo = (now: number, days: number) => new Date(now - days * DAY).toISOString();

interface Seed {
  name: string;
  description: string | null;
  language: string | null;
  createdAgo: number;
  pushedAgo: number;
  open_issues_count: number;
  stargazers_count: number;
  forks_count: number;
  size: number;
  topics?: string[];
  license?: string | null;
  lastCommitMessage?: string | null;
}

const SEEDS: Seed[] = [
  { name: "todo-app-v3", description: "the todo app to end all todo apps", language: "JavaScript", createdAgo: 1500, pushedAgo: 1100, open_issues_count: 14, stargazers_count: 6, forks_count: 1, size: 3200, lastCommitMessage: "add 4th calendar view" },
  { name: "game-engine-from-scratch", description: "why use unity when you can suffer", language: "C++", createdAgo: 1900, pushedAgo: 1300, open_issues_count: 23, stargazers_count: 18, forks_count: 3, size: 8800, lastCommitMessage: "refactor renderer (again)" },
  { name: "crypto-portfolio-tracker", description: "to the moon (it did not go to the moon)", language: "Python", createdAgo: 980, pushedAgo: 974, open_issues_count: 1, stargazers_count: 2, forks_count: 0, size: 600 },
  { name: "learn-rust-for-real", description: "this is the year i learn rust", language: "Rust", createdAgo: 700, pushedAgo: 695, open_issues_count: 0, stargazers_count: 0, forks_count: 0, size: 220 },
  { name: "recipe-finder", description: null, language: "TypeScript", createdAgo: 600, pushedAgo: 580, open_issues_count: 0, stargazers_count: 1, forks_count: 0, size: 300 },
  { name: "side-hustle-saas", description: "the one that was going to make me rich", language: "TypeScript", createdAgo: 800, pushedAgo: 775, open_issues_count: 2, stargazers_count: 4, forks_count: 0, size: 1500 },
  { name: "discord-mod-bot", description: "moderation bot for my server", language: "JavaScript", createdAgo: 1200, pushedAgo: 500, open_issues_count: 3, stargazers_count: 47, forks_count: 9, size: 900, license: "MIT", topics: ["discord", "bot"] },
  { name: "old-wordpress-blog", description: "my tech blog (3 posts)", language: "PHP", createdAgo: 2600, pushedAgo: 2200, open_issues_count: 0, stargazers_count: 2, forks_count: 0, size: 1400 },
  { name: "ml-experiments", description: "playing with neural nets", language: "Jupyter Notebook", createdAgo: 1100, pushedAgo: 760, open_issues_count: 0, stargazers_count: 3, forks_count: 0, size: 4200, lastCommitMessage: "wip dont judge me, fix later" },
  { name: "weather-cli", description: "weather in your terminal", language: "Go", createdAgo: 300, pushedAgo: 200, open_issues_count: 0, stargazers_count: 3, forks_count: 0, size: 150 },
  { name: "my-portfolio-2021", description: "personal site, very minimal", language: "HTML", createdAgo: 400, pushedAgo: 250, open_issues_count: 0, stargazers_count: 1, forks_count: 0, size: 180 },
  { name: "note-taking-app", description: "obsidian but worse", language: "TypeScript", createdAgo: 950, pushedAgo: 690, open_issues_count: 1, stargazers_count: 0, forks_count: 0, size: 800, lastCommitMessage: "temp commit, todo later" },
  // Still alive — keeps the completion rate honest (and a little sad).
  { name: "dotfiles", description: "my config files", language: "Shell", createdAgo: 1400, pushedAgo: 30, open_issues_count: 0, stargazers_count: 5, forks_count: 1, size: 120, license: "MIT" },
  { name: "work-dashboard", description: "internal tool, actually maintained", language: "TypeScript", createdAgo: 500, pushedAgo: 4, open_issues_count: 2, stargazers_count: 0, forks_count: 0, size: 2400 },
];

export function getDemoRepos(now: number): RawRepo[] {
  return SEEDS.map((s, i) => ({
    id: 1000 + i,
    name: s.name,
    full_name: `${DEMO_USERNAME}/${s.name}`,
    description: s.description,
    language: s.language,
    html_url: `https://github.com/${DEMO_USERNAME}/${s.name}`,
    created_at: isoAgo(now, s.createdAgo),
    pushed_at: isoAgo(now, s.pushedAgo),
    open_issues_count: s.open_issues_count,
    stargazers_count: s.stargazers_count,
    forks_count: s.forks_count,
    size: s.size,
    archived: false,
    fork: false,
    topics: s.topics ?? [],
    license: s.license ?? null,
    lastCommitMessage: s.lastCommitMessage ?? null,
  }));
}

// Plausible health signals so "Resurrect" works fully offline in demo mode.
const SIGNAL_OVERRIDES: Record<string, Partial<RepoSignals>> = {
  "discord-mod-bot": { hasReadme: true, hasLicense: true, hasTests: false, hasCI: true, openIssues: 3 },
  dotfiles: { hasReadme: true, hasLicense: true, openIssues: 0 },
  "work-dashboard": { hasReadme: true, hasTests: true, hasCI: true, hasLicense: true, openIssues: 2 },
};

export function getDemoSignals(repo: RawRepo): RepoSignals {
  const base: RepoSignals = {
    hasReadme: repo.size > 1000, // bigger projects tended to get a README
    hasTests: false,
    hasCI: false,
    hasLicense: repo.license != null,
    openIssues: repo.open_issues_count,
    lastCommitMessage: repo.lastCommitMessage ?? null,
  };
  return { ...base, ...SIGNAL_OVERRIDES[repo.name] };
}
