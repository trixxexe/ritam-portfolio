/**
 * ====================================================================
 * @watermark Ritam // LastWave Hybrid Lossless & Ambient Synth Engine
 * @author Ritam (@ritam)
 * ====================================================================
 * Plays user MP3/FLAC/OGG files when `audioUrl` is configured in
 * `public/config.json`, or synthesizes warm studio ambient chords via
 * Web Audio API out of the box with zero external broken links.
 */
import {AudioConfig} from './configSchema';
import {resolveAssetUrl} from './clientAssets';

export const RITAM_AUDIO_WATERMARK = 'Ritam';

export interface PlaybackState {
  isPlaying: boolean;
  currentTimeSec: number;
  durationSec: number;
  volume: number;
  levels: number[];
}

export class HybridAmbientPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscNodes: OscillatorNode[] = [];
  private lfoNode: OscillatorNode | null = null;
  private audioEl: HTMLAudioElement | null = null;

  private track: AudioConfig | null = null;
  private isPlaying = false;
  private volume = 0.72;
  private synthElapsedSec = 0;
  private lastTickMs = 0;
  private rafId: number | null = null;
  private onUpdate: (state: PlaybackState) => void;

  constructor(onUpdate: (state: PlaybackState) => void) {
    this.onUpdate = onUpdate;
  }

  public loadTrack(track: AudioConfig, autoPlay = false): void {
    const wasPlaying = this.isPlaying || autoPlay;
    this.stopInternal();
    this.track = track;
    this.synthElapsedSec = 0;

    const resolvedUrl = resolveAssetUrl(track.audioUrl);
    if (resolvedUrl && typeof window !== 'undefined') {
      this.audioEl = new Audio(resolvedUrl);
      this.audioEl.loop = true;
      this.audioEl.volume = this.volume;
      this.audioEl.crossOrigin = 'anonymous';
    } else {
      this.audioEl = null;
    }

    if (wasPlaying) {
      this.play();
    } else {
      this.emitState();
    }
  }

  public play(): void {
    if (!this.track || typeof window === 'undefined') return;
    this.isPlaying = true;
    this.lastTickMs = performance.now();

    if (this.audioEl) {
      this.audioEl.volume = this.volume;
      this.audioEl.play().catch(() => {
        // Fallback to procedural ambient synth if custom URL fails to load
        this.audioEl = null;
        this.startSynth(this.track!.synthChordRootHz || 220);
      });
    } else {
      this.startSynth(this.track.synthChordRootHz || 220);
    }

    this.startLoop();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.stopSynthNodes();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emitState();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(timeSec: number): void {
    if (!this.track) return;
    const duration = this.getDuration();
    const clamped = Math.max(0, Math.min(duration, timeSec));
    if (this.audioEl && Number.isFinite(this.audioEl.duration)) {
      this.audioEl.currentTime = clamped;
    } else {
      this.synthElapsedSec = clamped;
    }
    this.emitState();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.volume * 0.16,
        this.ctx.currentTime,
        0.05
      );
    }
    this.emitState();
  }

  private getDuration(): number {
    if (
      this.audioEl &&
      Number.isFinite(this.audioEl.duration) &&
      this.audioEl.duration > 0
    ) {
      return this.audioEl.duration;
    }
    return this.track?.durationSec || 48;
  }

  private getCurrentTime(): number {
    if (this.audioEl && !this.audioEl.paused) {
      return this.audioEl.currentTime;
    }
    return this.synthElapsedSec;
  }

  private startSynth(rootHz: number): void {
    try {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as {webkitAudioContext?: typeof AudioContext})
          .webkitAudioContext;
      if (!AudioCtor) return;

      if (!this.ctx) {
        this.ctx = new AudioCtor();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.stopSynthNodes();

      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(this.volume * 0.16, now + 0.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, now);
      filter.Q.setValueAtTime(1.2, now);

      // Gentle breathing LFO modulating filter cutoff
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.14, now);
      lfoGain.gain.setValueAtTime(340, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);
      this.lfoNode = lfo;

      // Lush 9th ambient glass chord ratios (Root, Perfect 5th, Major 7th, 9th)
      const ratios = [0.5, 1, 1.498, 1.887, 2.245];
      ratios.forEach((ratio, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(rootHz * ratio, now);
        osc.detune.setValueAtTime((idx - 2) * 4.5, now);
        voiceGain.gain.setValueAtTime(idx === 0 ? 0.32 : 0.17, now);
        osc.connect(voiceGain);
        voiceGain.connect(filter);
        osc.start(now);
        this.oscNodes.push(osc);
      });

      filter.connect(master);
      master.connect(this.ctx.destination);
      this.masterGain = master;
    } catch {
      // Headless browser without audio device still advances timer cleanly
    }
  }

  private stopSynthNodes(): void {
    this.oscNodes.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscNodes = [];
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      } catch {}
      this.lfoNode = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }

  private startLoop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    let lastEmit = 0;
    const step = (nowMs: number) => {
      if (!this.isPlaying) return;
      const dt = Math.max(0, (nowMs - this.lastTickMs) / 1000);
      this.lastTickMs = nowMs;

      if (!this.audioEl) {
        const dur = this.getDuration();
        this.synthElapsedSec = (this.synthElapsedSec + dt) % dur;
      }

      // Throttle state emissions to ~12Hz so React never re-renders at 60Hz
      if (nowMs - lastEmit >= 85) {
        lastEmit = nowMs;
        this.emitState();
      }
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  private emitState(): void {
    const t = this.getCurrentTime();
    const levels = this.isPlaying
      ? Array.from({length: 12}, (_, i) => {
          const wave =
            0.35 +
            0.35 * Math.sin(t * 3.4 + i * 0.75) +
            0.22 * Math.cos(t * 5.1 - i * 0.4);
          return Math.max(0.16, Math.min(1, wave * (0.45 + this.volume * 0.55)));
        })
      : Array.from({length: 12}, (_, i) => 0.18 + (i % 3) * 0.06);

    this.onUpdate({
      isPlaying: this.isPlaying,
      currentTimeSec: t,
      durationSec: this.getDuration(),
      volume: this.volume,
      levels,
    });
  }

  private stopInternal(): void {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
      this.audioEl = null;
    }
    this.stopSynthNodes();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public dispose(): void {
    this.stopInternal();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
