/** One slanted stroke of light across the hero. A faint line is always there; a bright point runs along it now and then. */
export default function HeroStreak() {
  const line = {
    position: "absolute" as const,
    left: "-20%",
    top: "58%",
    width: "140%",
    transform: "rotate(-22deg)",
    transformOrigin: "50% 50%",
    backgroundImage:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 44%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 56%, transparent 100%), linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.14) 50%, transparent 92%)",
    backgroundSize: "300% 100%, 100% 100%",
    backgroundRepeat: "no-repeat",
    animation: "streak-run 9s cubic-bezier(0.4, 0, 0.2, 1) 1.2s infinite",
  };
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* glow under the stroke */}
      <div style={{ ...line, height: 14, marginTop: -6, filter: "blur(9px)", opacity: 0.7 }} />
      {/* the stroke */}
      <div style={{ ...line, height: 2 }} />
    </div>
  );
}
