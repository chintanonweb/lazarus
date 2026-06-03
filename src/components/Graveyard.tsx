import { motion } from "framer-motion";
import type { Grave, WrappedStats } from "../lib/types";
import Tombstone from "./Tombstone";

interface Props {
  username: string;
  isDemo: boolean;
  graves: Grave[];
  wrapped: WrappedStats;
  onSelect: (grave: Grave) => void;
  onShowWrapped: () => void;
  onReset: () => void;
}

export default function Graveyard({
  username,
  isDemo,
  graves,
  wrapped,
  onSelect,
  onShowWrapped,
  onReset,
}: Props) {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-28 pt-12">
      <header className="mb-12 text-center">
        <button
          onClick={onReset}
          className="mb-6 text-xs uppercase tracking-[0.4em] text-grave-stone transition hover:text-grave-bone"
        >
          &larr; another graveyard
        </button>
        <h1 className="font-epitaph text-5xl font-semibold text-grave-moon moonglow sm:text-6xl">
          {username}'s graveyard
        </h1>
        <p className="mt-4 font-epitaph text-xl italic text-grave-bone/70">
          {graves.length > 0 ? (
            <>
              {wrapped.graves} projects buried here. {wrapped.alive} still breathing.
              <br />
              You finished {Math.round(wrapped.completionRate * 100)}% of what you started.
            </>
          ) : (
            <>Not a single grave. Either you finish everything, or you delete the evidence.</>
          )}
        </p>

        {isDemo && (
          <p className="mt-4 inline-block rounded-full border border-grave-stone/40 px-3 py-1 text-xs text-grave-stone">
            sample graveyard · try your own username for the real horror
          </p>
        )}

        {graves.length > 0 && (
          <div className="mt-7">
            <button
              onClick={onShowWrapped}
              className="rounded-lg border border-grave-ghost/50 bg-grave-ghost/10 px-5 py-2.5 text-sm font-medium text-grave-ghost ghostglow transition hover:bg-grave-ghost/20"
            >
              See your Abandoned Projects Wrapped &rarr;
            </button>
          </div>
        )}
      </header>

      {graves.length > 0 && (
        <motion.div
          className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          animate="show"
        >
          {graves.map((g, i) => (
            <Tombstone key={g.repo.id} grave={g} index={i} onSelect={onSelect} />
          ))}
        </motion.div>
      )}

      <p className="mt-20 text-center font-epitaph text-lg italic text-grave-stone">
        Click a stone to read its fate &mdash; and its way back.
      </p>
    </section>
  );
}
