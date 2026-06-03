import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Grave, RepoSignals, RevivalPlan } from "../lib/types";
import { buildRevivalPlan } from "../lib/revival";
import { epitaphFor } from "../lib/epitaph";
import { fetchRepoSignals } from "../lib/github";
import { getDemoSignals } from "../lib/demo";
import { copyText, downloadText } from "../lib/clipboard";

interface Props {
  grave: Grave;
  isDemo: boolean;
  token?: string;
  onClose: () => void;
}

const DIFFICULTY: Record<RevivalPlan["difficulty"], { label: string; tone: string }> = {
  "shallow-grave": { label: "Shallow grave", tone: "text-grave-ghost border-grave-ghost/40" },
  "six-feet-under": { label: "Six feet under", tone: "text-amber-300 border-amber-300/40" },
  "ancient-burial": { label: "Ancient burial", tone: "text-grave-blood border-grave-blood/50" },
};

export default function GraveDetail({ grave, isDemo, token, onClose }: Props) {
  const [plan, setPlan] = useState<RevivalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<number | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const e = epitaphFor(grave);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      let signals: RepoSignals;
      if (isDemo) {
        signals = getDemoSignals(grave.repo);
      } else {
        const [owner, name] = grave.repo.full_name.split("/");
        signals = await fetchRepoSignals(owner, name, grave.repo.open_issues_count, token);
      }
      if (!cancelled) {
        setPlan(buildRevivalPlan(grave, signals));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [grave, isDemo, token]);

  // Escape to close
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyPrompt(text: string, i: number) {
    if (await copyText(text)) {
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
    }
  }

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Revival plan for ${grave.repo.name}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(ev) => ev.stopPropagation()}
        className="relative my-8 w-full max-w-2xl rounded-2xl border border-grave-stone/40 bg-grave-night/95 p-7 shadow-2xl sm:p-9"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-grave-stone transition hover:text-grave-moon"
        >
          ✕
        </button>

        {/* epitaph header */}
        <p className="text-xs uppercase tracking-[0.4em] text-grave-stone">Exhuming</p>
        <h2 className="mt-1 font-epitaph text-4xl font-semibold text-grave-moon">{e.headstone}</h2>
        <p className="mt-1 font-epitaph text-lg italic text-grave-bone/70">
          {e.dates} · died of {e.cause} · {grave.daysCold.toLocaleString()} days cold
        </p>
        <p className="mt-3 font-epitaph text-xl italic text-grave-bone/90">“{e.verse}”</p>

        {loading || !plan ? (
          <p className="mt-8 animate-flicker text-center text-grave-stone">opening the casket…</p>
        ) : (
          <div className="mt-7 space-y-7">
            {/* difficulty */}
            <div className="flex items-center gap-3 text-sm">
              <span className={`rounded-full border px-3 py-1 ${DIFFICULTY[plan.difficulty].tone}`}>
                {DIFFICULTY[plan.difficulty].label}
              </span>
              <span className="text-grave-stone">
                ~{plan.estimatedSessions} focused session{plan.estimatedSessions === 1 ? "" : "s"} to revive
              </span>
            </div>

            {/* diagnosis */}
            <div>
              <h3 className="mb-2 text-xs uppercase tracking-[0.3em] text-grave-stone">Autopsy</h3>
              <ul className="space-y-1.5 text-sm text-grave-bone/85">
                {plan.diagnosis.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-grave-blood">†</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* checklist */}
            <div>
              <h3 className="mb-2 text-xs uppercase tracking-[0.3em] text-grave-stone">
                The path back
              </h3>
              <ul className="space-y-2">
                {plan.checklist.map((c, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={checked.has(i)}
                        onChange={() => toggle(i)}
                        className="h-4 w-4 accent-grave-ghost"
                      />
                      <span className={checked.has(i) ? "text-grave-stone line-through" : "text-grave-bone/90"}>
                        {c.task}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* copilot prompts */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-grave-stone">
                Copilot resurrection prompts
              </h3>
              <p className="mb-3 text-xs text-grave-stone/80">
                Paste these into GitHub Copilot Chat, in order. They pick up exactly where you gave up.
              </p>
              <ul className="space-y-2">
                {plan.prompts.map((p, i) => (
                  <li
                    key={i}
                    className="group flex items-start gap-3 rounded-lg border border-grave-stone/30 bg-black/30 p-3 text-sm"
                  >
                    <span className="select-none pt-0.5 text-grave-ghost">{i + 1}.</span>
                    <span className="flex-1 text-grave-bone/85">{p}</span>
                    <button
                      onClick={() => copyPrompt(p, i)}
                      className="shrink-0 rounded border border-grave-stone/40 px-2 py-1 text-xs text-grave-stone transition hover:border-grave-ghost/50 hover:text-grave-ghost"
                    >
                      {copied === i ? "copied ✓" : "copy"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* actions */}
            <div className="flex flex-col gap-3 border-t border-grave-stone/20 pt-5 sm:flex-row">
              <button
                onClick={() =>
                  downloadText(`copilot-instructions-${grave.repo.name}.md`, plan.copilotInstructions)
                }
                className="flex-1 rounded-lg border border-grave-ghost/50 bg-grave-ghost/10 px-4 py-2.5 text-sm font-medium text-grave-ghost ghostglow transition hover:bg-grave-ghost/20"
              >
                ↓ Download copilot-instructions.md
              </button>
              <a
                href={grave.repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-lg border border-grave-stone/50 px-4 py-2.5 text-center text-sm text-grave-bone/80 transition hover:border-grave-bone/60 hover:text-grave-moon"
              >
                Visit the grave on GitHub ↗
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
