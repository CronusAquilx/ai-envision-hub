export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V4l16 16V4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" className="text-primary" />
      <circle cx="20" cy="20" r="2" className="fill-accent" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 font-display text-sm font-semibold tracking-[0.14em] ${className}`}>
      <Logo />
      NEXUS<span className="text-primary">AI</span>
    </span>
  );
}
