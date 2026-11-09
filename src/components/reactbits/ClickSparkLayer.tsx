/**
 * ====================================================================
 * @watermark Ritam // React Bits ClickSpark Tactile Burst Overlay
 * @author Ritam (@ritam)
 * ====================================================================
 * Lightweight radial micro-spark feedback on interactive taps.
 */
import {useEffect, useRef} from 'react';

export const RITAM_SPARK_WATERMARK = 'Ritam';

interface Spark {
  x: number;
  y: number;
  angle: number;
  bornMs: number;
}

interface ClickSparkLayerProps {
  enabled: boolean;
}

export function ClickSparkLayer({enabled}: ClickSparkLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, {passive: true});

    const durationMs = 240;

    const render = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent')
          .trim() || '#38bdf8';

      sparksRef.current = sparksRef.current.filter(
        (s) => now - s.bornMs < durationMs
      );

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';

      for (const s of sparksRef.current) {
        const p = (now - s.bornMs) / durationMs;
        const eased = 1 - Math.pow(1 - p, 3);
        const rInner = 4 + eased * 14;
        const rOuter = rInner + (1 - p) * 7;

        ctx.globalAlpha = Math.max(0, 1 - p);
        ctx.beginPath();
        ctx.moveTo(
          s.x + Math.cos(s.angle) * rInner,
          s.y + Math.sin(s.angle) * rInner
        );
        ctx.lineTo(
          s.x + Math.cos(s.angle) * rOuter,
          s.y + Math.sin(s.angle) * rOuter
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const reduced =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      const count = 8;
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          angle: (Math.PI * 2 * i) / count,
          bornMs: now,
        });
      }
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    window.addEventListener('pointerdown', onPointerDown, {passive: true});

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointerDown);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
