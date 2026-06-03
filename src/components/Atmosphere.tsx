// Fixed, behind-everything graveyard atmosphere: moon, stars, drifting fog,
// and a silhouetted horizon. Purely decorative (aria-hidden).

const STARS = Array.from({ length: 40 }, (_, i) => {
  // deterministic pseudo-random positions (no Math.random at render)
  const x = (i * 97) % 100;
  const y = (i * 53) % 60;
  const size = (i % 3) + 1;
  const delay = (i % 7) * 0.7;
  return { x, y, size, delay };
});

export default function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* moon */}
      <div className="absolute right-[12%] top-[8%] h-40 w-40 rounded-full bg-grave-moon/90 blur-[2px] animate-flicker">
        <div className="absolute inset-0 rounded-full shadow-[0_0_120px_60px_rgba(232,230,221,0.18)]" />
        <div className="absolute left-8 top-7 h-5 w-5 rounded-full bg-black/5" />
        <div className="absolute left-20 top-16 h-7 w-7 rounded-full bg-black/5" />
        <div className="absolute left-12 top-24 h-4 w-4 rounded-full bg-black/5" />
      </div>

      {/* stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-grave-moon animate-flicker"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.5,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* drifting fog bands */}
      <div className="absolute bottom-0 left-1/2 h-[55vh] w-[160vw] -translate-x-1/2 animate-drift rounded-[50%] bg-grave-fog/40 blur-3xl" />
      <div className="absolute bottom-[-10vh] left-1/2 h-[40vh] w-[180vw] -translate-x-1/2 animate-drift rounded-[50%] bg-grave-fog/30 blur-3xl [animation-delay:-8s]" />

      {/* horizon silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
