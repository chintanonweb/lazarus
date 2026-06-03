import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onSummon: (username: string, token?: string) => void;
  onDemo: () => void;
  error: string | null;
}

export default function Landing({ onSummon, onDemo, error }: Props) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim()) onSummon(username.trim(), token.trim() || undefined);
  }

  return (
    <section className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6 text-xs uppercase tracking-[0.5em] text-grave-stone"
      >
        Here lie the projects you swore you'd finish
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="font-epitaph text-7xl font-semibold tracking-tight text-grave-moon moonglow sm:text-8xl"
      >
        Lazarus
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-5 max-w-xl font-epitaph text-2xl italic leading-relaxed text-grave-bone/80"
      >
        Every developer keeps a graveyard. Type a GitHub username and walk through
        yours &mdash; read the epitaphs, then raise one from the dead.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        onSubmit={submit}
        className="mt-10 w-full max-w-md"
      >
        <div className="flex items-center gap-2 rounded-lg border border-grave-stone/60 bg-black/40 px-3 py-2 focus-within:border-grave-ghost/70">
          <span className="text-grave-stone">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="github-username"
            aria-label="GitHub username"
            autoFocus
            className="w-full bg-transparent py-1.5 text-grave-moon placeholder:text-grave-stone/70 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="group flex-1 rounded-lg border border-grave-ghost/50 bg-grave-ghost/10 px-5 py-3 font-medium text-grave-ghost ghostglow transition hover:bg-grave-ghost/20"
          >
            Raise the dead &rarr;
          </button>
          <button
            type="button"
            onClick={onDemo}
            className="flex-1 rounded-lg border border-grave-stone/50 px-5 py-3 text-grave-bone/80 transition hover:border-grave-bone/60 hover:text-grave-moon"
          >
            Walk a sample graveyard
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-grave-blood/40 bg-grave-blood/10 px-3 py-2 text-sm text-grave-blood">
            {error}
          </p>
        )}

        <div className="mt-5 text-xs text-grave-stone">
          {showToken ? (
            <div className="flex items-center gap-2">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type="password"
                placeholder="ghp_… (optional, read-only)"
                aria-label="GitHub personal access token (optional)"
                className="w-full rounded border border-grave-stone/50 bg-black/40 px-2 py-1.5 text-grave-bone placeholder:text-grave-stone/60 focus:border-grave-ghost/60 focus:outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowToken(true)}
              className="underline decoration-dotted underline-offset-4 hover:text-grave-bone"
            >
              Hitting GitHub's rate limit? Add a token for private repos &amp; deeper digs.
            </button>
          )}
          <p className="mt-3 text-grave-stone/70">
            No login. Nothing leaves your browser. Your token, if any, stays local.
          </p>
        </div>
      </motion.form>
    </section>
  );
}
