/**
 * ====================================================================
 * @watermark Ritam // iOS 26 & LastWave Liquid Glass Primitives
 * @author Ritam (@ritam)
 * ====================================================================
 * Optical SVG refraction filter + pointer-tracked specular rim +
 * 3D perspective micro-tilt + resilient zero-broken-image media.
 */
import React, {useEffect, useRef, useState} from 'react';
import {ImageOff} from 'lucide-react';

export const RITAM_GLASS_WATERMARK = 'Ritam';

interface LiquidGlassDefsProps {
  refractionScale: number;
}

export function LiquidGlassDefs({refractionScale}: LiquidGlassDefsProps) {
  const safeScale = Math.max(0, Math.min(40, Math.round(refractionScale)));

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden opacity-0"
    >
      <defs>
        <filter
          id="ritam-liquid-refraction"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.016"
            numOctaves={2}
            seed={14}
            result="liquidNoise"
          />
          <feGaussianBlur
            in="liquidNoise"
            stdDeviation="4"
            result="smoothLiquidMap"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothLiquidMap"
            scale={safeScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

interface LiquidGlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  tiltEnabled?: boolean;
  refractive?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function LiquidGlassSurface({
  children,
  className = '',
  contentClassName = 'h-full',
  tiltEnabled = false,
  refractive = true,
  as: Tag = 'div',
}: LiquidGlassSurfaceProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handlePointerEnter = () => {
    if (tiltEnabled) setIsHovering(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--spot-x', `${x.toFixed(0)}px`);
    el.style.setProperty('--spot-y', `${y.toFixed(0)}px`);

    if (tiltEnabled && rect.width > 0 && rect.height > 0) {
      const nx = (x / rect.width - 0.5) * 2;
      const ny = (y / rect.height - 0.5) * 2;
      el.style.setProperty('--tilt-rx', `${(-ny * 2.2).toFixed(2)}deg`);
      el.style.setProperty('--tilt-ry', `${(nx * 2.2).toFixed(2)}deg`);
    }
  };

  const handlePointerLeave = () => {
    setIsHovering(false);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-rx', '0deg');
    el.style.setProperty('--tilt-ry', '0deg');
  };

  const baseGlass = refractive
    ? 'liquid-glass liquid-glass-refractive'
    : 'liquid-glass';

  const activeTiltClass =
    tiltEnabled && isHovering
      ? '[transform:perspective(1100px)_rotateX(var(--tilt-rx,0deg))_rotateY(var(--tilt-ry,0deg))]'
      : '';

  return (
    <Tag
      ref={ref as React.RefObject<any>}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`group/glass overflow-hidden rounded-3xl transition-transform duration-200 ease-out ${baseGlass} ${activeTiltClass} ${className}`}
    >
      {/* Pointer-Tracked Specular Refraction Sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover/glass:opacity-100 [background:radial-gradient(420px_circle_at_var(--spot-x,50%)_var(--spot-y,0%),var(--spotlight-glow),transparent_70%)]"
      />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </Tag>
  );
}

interface ResilientMediaProps {
  src: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  imgClassName?: string;
}

export function ResilientMedia({
  src,
  alt,
  fallbackLabel,
  className = '',
  imgClassName = 'h-full w-full object-cover',
}: ResilientMediaProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 p-4 text-center dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 ${className}`}
      >
        <ImageOff
          aria-hidden="true"
          className="h-5 w-5 text-slate-500 dark:text-slate-400"
        />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className={imgClassName}
      />
    </div>
  );
}
