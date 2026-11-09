/**
 * ====================================================================
 * @watermark Ritam // React Bits Text Animations (BlurText & DecryptedText)
 * @author Ritam (@ritam)
 * ====================================================================
 * High-speed optical focus headline and cipher-rotating discipline line
 * engineered to settle within <= 180ms per unit using compositor transforms.
 */
import {useEffect, useRef, useState} from 'react';

export const RITAM_TEXTFX_WATERMARK = 'Ritam';

interface BlurTextProps {
  text: string;
  className?: string;
}

export function BlurText({text, className = ''}: BlurTextProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const spans = el.querySelectorAll<HTMLSpanElement>('[data-blur-word]');
    spans.forEach((span, idx) => {
      span.style.setProperty('--word-delay', `${Math.min(idx * 24, 180)}ms`);
    });
  }, [text]);

  return (
    <h1 ref={containerRef} className={`font-display text-balance ${className}`}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          data-blur-word=""
          className="animate-blur-word inline-block"
        >
          {word}
          {idx < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </h1>
  );
}

const CIPHER_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·';

interface DecryptedTextProps {
  items: string[];
  intervalMs?: number;
  className?: string;
}

export function DecryptedText({
  items,
  intervalMs = 4200,
  className = '',
}: DecryptedTextProps) {
  const safeItems = items.length > 0 ? items : ['Systems & Interface Engineer'];
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(safeItems[0]);

  useEffect(() => {
    setDisplay(safeItems[0]);
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const cycleTimer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeItems.length);
    }, intervalMs);
    return () => window.clearInterval(cycleTimer);
  }, [safeItems.length, intervalMs]);

  useEffect(() => {
    const target = safeItems[index] || safeItems[0];
    let iteration = 0;
    const stepMs = 22;
    const totalSteps = 8;

    const scrambleTimer = window.setInterval(() => {
      iteration += 1;
      const revealedCount = Math.floor((iteration / totalSteps) * target.length);
      const nextText = target
        .split('')
        .map((ch, i) => {
          if (ch === ' ' || i < revealedCount) return ch;
          return CIPHER_GLYPHS[(i + iteration * 3) % CIPHER_GLYPHS.length];
        })
        .join('');

      setDisplay(iteration >= totalSteps ? target : nextText);
      if (iteration >= totalSteps) {
        window.clearInterval(scrambleTimer);
      }
    }, stepMs);

    return () => window.clearInterval(scrambleTimer);
  }, [index, safeItems]);

  return (
    <span className={`inline-block font-medium ${className}`}>{display}</span>
  );
}
