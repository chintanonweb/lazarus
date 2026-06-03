import type { CauseOfDeath, Grave } from "./types";
import { hashString, seededRandom, pick } from "./hash";

export interface Epitaph {
  headstone: string; // repo name
  dates: string; // "2021 – 2022"
  cause: string; // human-readable cause label
  verse: string; // 1-2 line witty epitaph
}

export const CAUSE_LABEL: Record<CauseOfDeath, string> = {
  "scope-creep": "scope creep",
  "lost-interest": "lost interest",
  "shiny-new-thing": "a shinier idea came along",
  "good-enough": "good enough — shipped & forgot",
  "honest-wip": "an honest // TODO",
  ghosted: "ghosted",
  "ran-out-of-weekend": "ran out of weekend",
};

const VERSES: Record<CauseOfDeath, readonly string[]> = {
  "scope-creep": [
    "It was going to do everything. It did nothing.",
    "Started as an app. Became a religion. Then a graveyard.",
    "The roadmap grew faster than the code ever could.",
    "Too many features, not enough Fridays.",
  ],
  "lost-interest": [
    "Loved for {ageDays} days. Forgotten for {daysCold} more.",
    "The spark was real. The follow-through was not.",
    "A brief, beautiful burst of motivation. Then silence.",
    "Here lies a weekend's worth of enthusiasm.",
  ],
  "shiny-new-thing": [
    "Abandoned the moment a newer repo was born.",
    "Out-shined before it ever shipped.",
    "A victim of the next great idea.",
    "Born {ageDays} days before its replacement.",
  ],
  "good-enough": [
    "It worked. That was the problem.",
    "Shipped once, loved never again.",
    "Done is the enemy of maintained.",
    "{stars} stars couldn't keep it warm.",
  ],
  "honest-wip": [
    "The last commit said it all: 'fix later'.",
    "A monument to the words 'I'll come back to this'.",
    "WIP forever. Emphasis on the W.",
    "Half-built and proud of it.",
  ],
  ghosted: [
    "{daysCold} days of silence and counting.",
    "No commit, no closure.",
    "Last seen {diedYear}. Presumed gone.",
    "It didn't die. It just stopped being visited.",
  ],
  "ran-out-of-weekend": [
    "Monday came before the README did.",
    "A casualty of the working week.",
    "So close. So Sunday-night.",
    "The deadline that was only ever self-imposed.",
  ],
};

function fill(t: string, g: Grave): string {
  return t
    .replaceAll("{ageDays}", String(g.ageDays))
    .replaceAll("{daysCold}", g.daysCold.toLocaleString("en-US"))
    .replaceAll("{diedYear}", String(g.diedYear))
    .replaceAll("{stars}", String(g.repo.stargazers_count));
}

/** Produce a deterministic-but-varied epitaph for a grave. */
export function epitaphFor(grave: Grave): Epitaph {
  const seed = hashString(`${grave.repo.id}:${grave.repo.name}:${grave.causeOfDeath}`);
  const rnd = seededRandom(seed);
  const verse = fill(pick(VERSES[grave.causeOfDeath], rnd), grave);
  const dates =
    grave.bornYear === grave.diedYear
      ? `${grave.bornYear}`
      : `${grave.bornYear} – ${grave.diedYear}`;
  return {
    headstone: grave.repo.name,
    dates,
    cause: CAUSE_LABEL[grave.causeOfDeath],
    verse,
  };
}
