import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────
 * LOADING STATE — pixel-grid loader for long-running work
 *
 * Variants:
 *   Drive  — square cells, chevron wavefront driving right
 *   Dots   — same wavefront, circular cells
 *   Orbit  — a comet lapping the grid perimeter
 * ───────────────────────────────────────────────────────── */

export type LoadingStateVariant = 'Drive' | 'Dots' | 'Orbit';

const chevron = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3);
  const c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, i) => {
  const k = ORBIT_ORDER.indexOf(i);
  return k === -1 ? null : k * 110;
});

const PATTERNS: Record<
  LoadingStateVariant,
  { delays: (number | null)[]; dur: number; round: boolean }
> = {
  Drive: { delays: chevron, dur: 650, round: false },
  Dots: { delays: chevron, dur: 650, round: true },
  Orbit: { delays: orbit, dur: 950, round: false }
};

function useElapsed(active = true) {
  const [ds, setDs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, [active]);
  const total = ds / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  return `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function LoadingState({
  label = 'Analyserar',
  variant = 'Drive',
  className = '',
  size = 'md'
}: {
  label?: string;
  variant?: LoadingStateVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const elapsed = useElapsed(true);
  const reducedMotion = usePrefersReducedMotion();
  const { delays, dur, round } = PATTERNS[variant] ?? PATTERNS.Drive;

  const cell =
    size === 'lg' ? 'size-[6px]' : size === 'sm' ? 'size-[3px]' : 'size-[4px]';
  const gap =
    size === 'lg'
      ? 'grid-cols-[repeat(3,6px)] gap-[2px]'
      : size === 'sm'
        ? 'grid-cols-[repeat(3,3px)] gap-[1px]'
        : 'grid-cols-[repeat(3,4px)] gap-[1.5px]';
  const labelSize =
    size === 'lg' ? 'text-[15px]' : size === 'sm' ? 'text-[12px]' : 'text-[13px]';
  const timerSize =
    size === 'lg' ? 'text-[13px]' : size === 'sm' ? 'text-[11px]' : 'text-[12px]';

  return (
    <div
      className={`flex w-fit items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${label} ${elapsed}`}
    >
      <span aria-hidden className={`grid ${gap}`}>
        {delays.map((d, i) => (
          <span
            key={i}
            className={`${cell} bg-ink ${round ? 'rounded-full' : 'rounded-[1px]'}`}
            style={{
              opacity: d === null || reducedMotion ? 0.12 : 0.18,
              animation:
                d === null || reducedMotion
                  ? 'none'
                  : `pixel-on ${dur}ms ease-in-out ${d}ms infinite`
            }}
          />
        ))}
      </span>
      <span
        className={`${labelSize} font-medium tracking-wide ${
          reducedMotion ? 'text-ink/70' : 'bg-clip-text text-transparent ss-shimmer-label'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-mono ${timerSize} text-ink/45 tabular-nums tracking-tight`}
      >
        {elapsed}
      </span>
    </div>
  );
}
