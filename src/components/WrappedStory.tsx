import { useRef } from "react";
import { motion } from "framer-motion";
import type { WrappedStats } from "../lib/types";
import { CAUSE_LABEL } from "../lib/epitaph";
import ShareBar from "./ShareBar";

interface Props {
  wrapped: WrappedStats;
  onBack: () => void;
}

function Stat({
  value,
  label,
  delay,
  accent,
}: {
  value: string;
  label: string;
  delay: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <div
        className={`font-epitaph text-5xl font-semibold leading-none sm:text-6xl ${
          accent ? "text-grave-blood" : "text-grave-moon moonglow"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-grave-stone">{label}</div>
    </motion.div>
  );
}

export default function WrappedStory({ wrapped, onBack }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const pct = Math.round(wrapped.completionRate * 100);
  const cause = wrapped.topCause ? CAUSE_LABEL[wrapped.topCause] : "neglect";
  const years = (wrapped.longestColdDays / 365).toFixed(1);

  const shareText =
    `🪦 My Abandoned Projects Wrapped:\n` +
    `${wrapped.graves} repos buried · ${wrapped.alive} still alive · ${pct}% finished.\n` +
    `Oldest grave "${wrapped.oldestGraveName ?? "—"}" has been cold ${years} years.\n` +
    `Leading cause of death: ${cause}.\n` +
    `What's rotting in your GitHub? Raise yours with Lazarus.`;

  return (
    <section className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-16">
      <button
        onClick={onBack}
        className="mb-8 text-xs uppercase tracking-[0.4em] text-grave-stone transition hover:text-grave-bone"
      >
        &larr; back to the graveyard
      </button>

      {/* The shareable card */}
      <div
        ref={cardRef}
        className="w-full max-w-md rounded-3xl border border-grave-stone/40 bg-gradient-to-b from-grave-fog/40 to-grave-night px-8 py-10"
      >
        <p className="text-center text-[11px] uppercase tracking-[0.45em] text-grave-stone">
          Abandoned Projects Wrapped
        </p>
        <h2 className="mt-1 text-center font-epitaph text-4xl font-semibold text-grave-moon moonglow">
          @{wrapped.username}
        </h2>

        <div className="my-8 grid grid-cols-2 gap-y-8">
          <Stat value={String(wrapped.graves)} label="repos buried" delay={0.1} accent />
          <Stat value={String(wrapped.alive)} label="still breathing" delay={0.2} />
          <Stat value={`${pct}%`} label="actually finished" delay={0.3} />
          <Stat value={`${years}y`} label="longest cold streak" delay={0.4} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="space-y-3 border-t border-grave-stone/30 pt-6 text-center"
        >
          <p className="font-epitaph text-xl italic text-grave-bone/85">
            Leading cause of death:
            <br />
            <span className="text-grave-moss">“{cause}”</span>
          </p>
          {wrapped.oldestGraveName && (
            <p className="text-xs text-grave-stone">
              oldest grave · <span className="text-grave-bone/80">{wrapped.oldestGraveName}</span> ·{" "}
              {wrapped.deadWeightKB.toLocaleString()} KB of dead weight
            </p>
          )}
        </motion.div>

        <p className="mt-8 text-center font-epitaph text-sm italic tracking-wide text-grave-stone">
          🪦 Lazarus — raise your dead repos
        </p>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="my-7 max-w-md text-center font-epitaph text-2xl italic text-grave-bone/80"
      >
        What's rotting in <span className="text-grave-ghost ghostglow">your</span> GitHub?
      </motion.p>

      <ShareBar cardRef={cardRef} shareText={shareText} filename={`${wrapped.username}-graveyard.png`} />
    </section>
  );
}
