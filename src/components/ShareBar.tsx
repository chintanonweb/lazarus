import { useState } from "react";
import { toPng } from "html-to-image";
import { copyText } from "../lib/clipboard";

interface Props {
  cardRef: React.RefObject<HTMLElement>;
  shareText: string;
  filename: string;
}

export default function ShareBar({ cardRef, shareText, filename }: Props) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function savePng() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0e14",
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (await copyText(shareText)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <button
        onClick={savePng}
        disabled={busy}
        className="rounded-lg border border-grave-ghost/50 bg-grave-ghost/10 px-5 py-2.5 text-sm font-medium text-grave-ghost ghostglow transition hover:bg-grave-ghost/20 disabled:opacity-60"
      >
        {busy ? "summoning…" : "↓ Save share card"}
      </button>
      <button
        onClick={copy}
        className="rounded-lg border border-grave-stone/50 px-5 py-2.5 text-sm text-grave-bone/80 transition hover:border-grave-bone/60 hover:text-grave-moon"
      >
        {copied ? "copied ✓" : "Copy the confession"}
      </button>
      <a
        href={tweet}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-grave-stone/50 px-5 py-2.5 text-sm text-grave-bone/80 transition hover:border-grave-bone/60 hover:text-grave-moon"
      >
        Post it ↗
      </a>
    </div>
  );
}
