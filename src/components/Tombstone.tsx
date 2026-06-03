import { motion } from "framer-motion";
import type { Grave } from "../lib/types";
import { epitaphFor } from "../lib/epitaph";

interface Props {
  grave: Grave;
  index: number;
  onSelect: (grave: Grave) => void;
}

function coldLabel(days: number): string {
  if (days >= 365) {
    const y = (days / 365).toFixed(1);
    return `${y} yrs cold`;
  }
  return `${days}d cold`;
}

export default function Tombstone({ grave, index, onSelect }: Props) {
  const e = epitaphFor(grave);
  // The more abandoned, the more it leans, like a neglected grave.
  const tilt = ((grave.repo.id % 5) - 2) * 0.7;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(grave)}
      aria-label={`${e.headstone}, ${e.dates}, cause of death ${e.cause}. ${e.verse} Open revival plan.`}
      initial={{ y: 80, opacity: 0, rotateX: -25 }}
      animate={{ y: 0, opacity: 1, rotateX: 0 }}
      transition={{
        delay: Math.min(index * 0.05, 1.4),
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -10, rotate: 0 }}
      style={{ rotate: `${tilt}deg` }}
      className="group relative flex w-full flex-col items-center focus:outline-none"
    >
      {/* the stone */}
      <div className="headstone relative flex h-64 w-full max-w-[15rem] flex-col items-center px-5 pt-9 text-center ring-1 ring-black/40 transition group-hover:ring-grave-ghost/30 group-focus-visible:ring-2 group-focus-visible:ring-grave-ghost">
        <span className="font-epitaph text-lg tracking-[0.3em] engraved">R.I.P.</span>
        <span className="mt-2 line-clamp-2 break-words font-epitaph text-2xl font-semibold leading-tight engraved">
          {e.headstone}
        </span>
        <span className="mt-1 text-[11px] tracking-widest text-grave-stone">{e.dates}</span>

        <span className="mt-3 text-[11px] italic text-grave-moss">“{e.cause}”</span>

        {/* epitaph verse — revealed on hover/focus */}
        <span className="mt-3 max-h-0 overflow-hidden px-1 font-epitaph text-sm italic leading-snug text-grave-bone/0 transition-all duration-500 group-hover:max-h-24 group-hover:text-grave-bone/80 group-focus-visible:max-h-24 group-focus-visible:text-grave-bone/80">
          {e.verse}
        </span>

        {/* footer metric in the dev voice */}
        <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-wider text-grave-stone">
          {coldLabel(grave.daysCold)} · {grave.repo.language ?? "—"}
        </span>
      </div>

      {/* mound + grass */}
      <div className="-mt-2 h-4 w-[88%] rounded-[50%] bg-black/50 blur-[2px]" />
      <div className="h-1 w-[70%] rounded-[50%] bg-grave-moss/30 blur-[1px]" />
    </motion.button>
  );
}
