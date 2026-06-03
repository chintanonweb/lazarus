import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Atmosphere from "./components/Atmosphere";
import Landing from "./components/Landing";
import Graveyard from "./components/Graveyard";
import GraveDetail from "./components/GraveDetail";
import WrappedStory from "./components/WrappedStory";
import type { Grave, RawRepo, WrappedStats } from "./lib/types";
import { scoreRepo } from "./lib/scoring";
import { computeWrapped } from "./lib/wrapped";
import { fetchUserRepos, GitHubError } from "./lib/github";
import { getDemoRepos, DEMO_USERNAME } from "./lib/demo";

type Phase = "landing" | "loading" | "graveyard" | "wrapped";

interface Session {
  username: string;
  isDemo: boolean;
  token?: string;
  graves: Grave[];
  wrapped: WrappedStats;
}

function buildSession(
  username: string,
  repos: RawRepo[],
  now: number,
  isDemo: boolean,
  token?: string
): Session {
  const graves = repos
    .map((r) => scoreRepo(r, now))
    .filter((g) => g.isGrave)
    .sort((a, b) => b.abandonmentScore - a.abandonmentScore || b.daysCold - a.daysCold);
  return { username, isDemo, token, graves, wrapped: computeWrapped(repos, now, username) };
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selected, setSelected] = useState<Grave | null>(null);

  async function summon(username: string, token?: string) {
    setError(null);
    setPhase("loading");
    try {
      const repos = await fetchUserRepos(username, token);
      const now = Date.now();
      setSession(buildSession(username, repos, now, false, token));
      setPhase("graveyard");
    } catch (err) {
      const msg =
        err instanceof GitHubError ? err.message : "Something went wrong summoning the dead.";
      setError(msg);
      setPhase("landing");
    }
  }

  function summonDemo() {
    setError(null);
    const now = Date.now();
    setSession(buildSession(DEMO_USERNAME, getDemoRepos(now), now, true));
    setPhase("graveyard");
  }

  function reset() {
    setSession(null);
    setSelected(null);
    setError(null);
    setPhase("landing");
  }

  return (
    <main className="grain relative min-h-screen">
      <Atmosphere />

      {phase === "landing" && (
        <Landing onSummon={summon} onDemo={summonDemo} error={error} />
      )}

      {phase === "loading" && (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <div className="font-epitaph text-3xl italic text-grave-bone/80 animate-flicker">
            disturbing the grounds…
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-grave-stone">
            counting the headstones
          </div>
        </div>
      )}

      {phase === "graveyard" && session && (
        <Graveyard
          username={session.username}
          isDemo={session.isDemo}
          graves={session.graves}
          wrapped={session.wrapped}
          onSelect={setSelected}
          onShowWrapped={() => setPhase("wrapped")}
          onReset={reset}
        />
      )}

      {phase === "wrapped" && session && (
        <WrappedStory wrapped={session.wrapped} onBack={() => setPhase("graveyard")} />
      )}

      <AnimatePresence>
        {selected && session && (
          <GraveDetail
            grave={selected}
            isDemo={session.isDemo}
            token={session.token}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      <footer className="relative z-10 pb-8 text-center text-[11px] tracking-wider text-grave-stone/60">
        Lazarus · built for the GitHub Finish-Up-A-Thon · no data leaves your browser
      </footer>
    </main>
  );
}
