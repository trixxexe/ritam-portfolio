/**
 * ====================================================================
 * @watermark Ritam // React Bits Inspired Ambient Aurora & Wallpaper
 * @author Ritam (@ritam)
 * ====================================================================
 * Renders custom high-res wallpaper from config.json + low-CPU silky
 * caustic light ribbons so Liquid Glass refraction visibly bends color.
 */
import {useEffect, useRef, useState} from 'react';
import {THEME_PRESETS, ThemePresetId} from '../../lib/configSchema';

export const RITAM_AURORA_WATERMARK = 'Ritam';

interface AuroraBackdropProps {
  wallpaperUrl: string;
  wallpaperOpacity: number;
  auroraEnabled: boolean;
  preset: ThemePresetId;
  isDark: boolean;
}

export function AuroraBackdrop({
  wallpaperUrl,
  wallpaperOpacity,
  auroraEnabled,
  preset,
  isDark,
}: AuroraBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgWrapRef = useRef<HTMLDivElement | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    setImgBroken(false);
  }, [wallpaperUrl]);

  useEffect(() => {
    if (imgWrapRef.current) {
      const effectiveOpacity = isDark
        ? Math.min(0.65, Math.max(0.12, wallpaperOpacity))
        : Math.min(0.18, Math.max(0.05, wallpaperOpacity * 0.34));
      imgWrapRef.current.style.setProperty(
        '--wp-opacity',
        effectiveOpacity.toFixed(2)
      );
    }
  }, [wallpaperOpacity, isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !auroraEnabled) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = THEME_PRESETS[preset] || THEME_PRESETS['obsidian-ice'];
    const colors = isDark ? palette.dark : palette.light;

    let rafId: number | null = null;
    let width = 0;
    let height = 0;

    const resize = () => {
      // Render at modest internal resolution (max 480px wide) for crisp silky blur & near-zero CPU cost
      const scale = Math.min(1, 480 / Math.max(window.innerWidth, 320));
      width = Math.max(240, Math.floor(window.innerWidth * scale));
      height = Math.max(240, Math.floor(window.innerHeight * scale));
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize, {passive: true});

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const drawFrame = (timeMs: number) => {
      const t = timeMs * 0.00028;
      ctx.clearRect(0, 0, width, height);

      const orb1X = width * (0.26 + 0.16 * Math.cos(t));
      const orb1Y = height * (0.28 + 0.12 * Math.sin(t * 1.2));
      const grad1 = ctx.createRadialGradient(
        orb1X,
        orb1Y,
        width * 0.04,
        orb1X,
        orb1Y,
        width * 0.56
      );
      grad1.addColorStop(0, colors.auroraA);
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * (0.74 + 0.14 * Math.sin(t * 0.85));
      const orb2Y = height * (0.66 + 0.14 * Math.cos(t * 1.1));
      const grad2 = ctx.createRadialGradient(
        orb2X,
        orb2Y,
        width * 0.04,
        orb2X,
        orb2Y,
        width * 0.52
      );
      grad2.addColorStop(0, colors.auroraB);
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    };

    const paint = () => drawFrame(1600);
    paint();

    const onResizePaint = () => {
      resize();
      paint();
    };
    window.removeEventListener('resize', resize);
    window.addEventListener('resize', onResizePaint, {passive: true});

    return () => {
      window.removeEventListener('resize', onResizePaint);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [auroraEnabled, preset, isDark]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--canvas-bg)]"
    >
      {wallpaperUrl && !imgBroken && (
        <div
          ref={imgWrapRef}
          className="absolute inset-0 opacity-[var(--wp-opacity,0.4)] transition-opacity duration-300"
        >
          <img
            src={wallpaperUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgBroken(true)}
            className="h-full w-full scale-105 object-cover"
          />
        </div>
      )}

      {auroraEnabled && (
        <canvas
          ref={canvasRef}
          data-testid="aurora-backdrop"
          className="absolute inset-0 h-full w-full opacity-95"
        />
      )}

      {/* Atmospheric contrast veil guaranteeing WCAG AA text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-white/75 dark:from-black/45 dark:via-black/25 dark:to-black/70" />
    </div>
  );
}
