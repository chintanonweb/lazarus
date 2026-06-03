<div align="center">

# 🪦 Lazarus

### Raise your dead GitHub repos.

Type a GitHub username and walk through the graveyard of your abandoned projects.
Read their epitaphs. See your *Abandoned Projects Wrapped*. Then raise one from the
dead with a **GitHub Copilot–ready revival plan**.

**[ Live demo → ](#)** &nbsp;·&nbsp; built for the [GitHub Finish-Up-A-Thon Challenge](https://dev.to/challenges/github-2026-05-21)

</div>

---

## What it does

Lazarus is a zero-login web app. Give it a GitHub username and it:

1. **Digs up the graveyard** — scores every repo for abandonment (how long it's been
   cold, how incomplete it is, how many issues hang open) and renders the dead ones as
   tilting, engraved tombstones under a cold moon.
2. **Writes the epitaphs** — each grave gets a witty *cause of death*
   (scope creep, lost interest, a shinier idea came along, an honest `// TODO`…) and a
   one-line verse. Deterministic, no AI key required.
3. **Wraps it up** — an *Abandoned Projects Wrapped* card you can download and share:
   repos buried, % actually finished, longest cold streak, leading cause of death.
4. **Raises the dead** — pick a grave and Lazarus generates a **revival plan**: an
   autopsy of what's missing (README, tests, CI, license), a prioritized checklist, a
   downloadable `copilot-instructions.md` tailored to the repo, and copy-paste **GitHub
   Copilot prompts** that pick up exactly where you gave up.

No login. No backend. Nothing leaves your browser.

## Why it exists

It's a finish-up tool, built for a finish-up challenge. I had a folder full of dead
side projects — so I finished the one project that helps me finish all the others.

## Tech

- **Vite + React 18 + TypeScript**, **Tailwind CSS**, **framer-motion**
- **GitHub REST API** (by username, unauthenticated; optional read-only PAT for private
  repos + higher rate limits)
- **html-to-image** for the shareable card
- Pure scoring / epitaph / wrapped / revival engines, **unit-tested with Vitest**

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # run the engine tests
npm run build      # production build
```

## How it's structured

```
src/lib/      scoring · epitaph · wrapped · revival · github · demo   (pure, tested)
src/components/  Landing · Graveyard · Tombstone · GraveDetail · WrappedStory · ShareBar
graveyard.js  the original 2am hackathon hack this project grew out of (kept on purpose)
```

The graveyard's logic is deliberately separated from its bones (the UI), so every score,
epitaph, and revival prompt is a pure function with tests.

## License

[MIT](./LICENSE) — do whatever you like. Just maybe finish it.
