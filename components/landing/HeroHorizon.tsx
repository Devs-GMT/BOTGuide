/** A single soft horizon at the bottom of the hero: a dark dome with an orange rim and haze above it. */
export default function HeroHorizon() {
  const dome = {
    position: "absolute" as const,
    left: "50%",
    top: "calc(100% - 7vh)",
    width: "170%",
    aspectRatio: "1",
    transform: "translateX(-50%)",
    borderRadius: "50%",
  };
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" style={{ animation: "horizon-breathe 9s ease-in-out infinite" }}>
      {/* haze above the rim */}
      <div
        className="absolute inset-x-0 bottom-0 h-[28%]"
        style={{ background: "radial-gradient(70% 100% at 50% 100%, rgba(255,122,61,0.09), rgba(255,122,61,0.025) 40%, transparent 70%)" }}
      />
      {/* the dome hides the haze below the rim and casts the glow upwards */}
      <div style={{ ...dome, background: "#0a0a0a", boxShadow: "0 -10px 60px -10px rgba(255,122,61,0.20), 0 -1px 14px 0 rgba(255,150,100,0.14)" }} />
      {/* thin bright rim, fading out towards the sides */}
      <div
        style={{
          ...dome,
          border: "1px solid transparent",
          borderTopColor: "rgba(255,170,120,0.38)",
          maskImage: "linear-gradient(90deg, transparent 12%, #000 38%, #000 62%, transparent 88%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 12%, #000 38%, #000 62%, transparent 88%)",
        }}
      />
    </div>
  );
}
