/**
 * ====================================================================
 * @watermark Ritam // iOS & Cross-Platform Tactile Haptics Engine
 * @author Ritam (@ritam)
 * ====================================================================
 * Combines Web Vibration API patterns with an ultra-subtle 4ms acoustic
 * tactile micro-pulse on unlocked WebAudio contexts so desktop & iOS
 * interactions feel crisp and physical.
 */

export const RITAM_HAPTICS_WATERMARK = 'Ritam';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success';

const VIBRATION_PATTERNS: Record<HapticStyle, number | number[]> = {
  selection: 5,
  light: 9,
  medium: 15,
  heavy: 24,
  success: [8, 28, 12],
};

class TactileHapticsEngine {
  private audioCtx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public trigger(style: HapticStyle = 'light'): void {
    if (!this.enabled || typeof window === 'undefined') return;

    // 1. Native haptic actuator (Android / supported mobile browsers)
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(VIBRATION_PATTERNS[style]);
      }
    } catch {
      // Ignore if blocked prior to user gesture
    }

    // 2. Subtle iOS-like physical membrane transient (4ms low-pass pulse)
    try {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as {webkitAudioContext?: typeof AudioContext})
          .webkitAudioContext;
      if (!AudioCtor) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtor();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      if (this.audioCtx.state !== 'running') return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freqMap: Record<HapticStyle, number> = {
        selection: 155,
        light: 135,
        medium: 112,
        heavy: 88,
        success: 175,
      };

      const peakGainMap: Record<HapticStyle, number> = {
        selection: 0.018,
        light: 0.024,
        medium: 0.032,
        heavy: 0.042,
        success: 0.028,
      };

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqMap[style], now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.014);

      gain.gain.setValueAtTime(peakGainMap[style], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.018);
    } catch {
      // Fail silently on restricted environments
    }
  }
}

export const haptics = new TactileHapticsEngine();
