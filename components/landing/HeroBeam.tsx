/** A faint cone of warm light from the top centre, like a dim stage lamp over the headline. */
export default function HeroBeam() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* the blur sits on the outer box and the cone is clipped inside it, so the edges stay soft */}
      <div
        className="absolute left-1/2 top-0 h-[78%] w-[min(1100px,90vw)] -translate-x-1/2"
        style={{ filter: "blur(22px)", animation: "beam-sway 11s ease-in-out infinite" }}
      >
        <div
          className="h-full w-full"
          style={{
            clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(180deg, rgba(255,214,190,0.16) 0%, rgba(255,140,90,0.07) 45%, transparent 85%)",
          }}
        />
      </div>
      {/* the lamp itself: a small warm point where the beam starts */}
      <div
        className="absolute left-1/2 top-0 h-px w-[min(380px,50vw)] -translate-x-1/2"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,190,150,0.55), transparent)" }}
      />
    </div>
  );
}
