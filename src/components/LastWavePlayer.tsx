/**
 * ====================================================================
 * @watermark Ritam // LastWave Compact Translucent Audio Player
 * @author Ritam (@ritam)
 * ====================================================================
 * Sleek guns.lol embedded music player with real-time waveform,
 * play/pause transport, scrubbable progress bar, and WebAudio ambient synth.
 */
import {useEffect, useRef, useState} from 'react';
import {Pause, Play, Volume2, VolumeX} from 'lucide-react';
import {AudioConfig} from '../lib/configSchema';
import {resolveAssetUrl} from '../lib/clientAssets';
import {formatSeconds} from '../lib/syncEngine';
import {HybridAmbientPlayer, PlaybackState} from '../lib/ambientAudio';
import {haptics} from '../lib/haptics';
import {ResilientMedia} from './glass/LiquidGlass';

export const RITAM_PLAYER_WATERMARK = 'Ritam';

const BAR_HEIGHT_CLASSES = [
  'h-1.5',
  'h-2',
  'h-3',
  'h-3.5',
  'h-4',
  'h-5',
  'h-6',
];

function levelToHeightClass(level: number): string {
  const idx = Math.min(
    BAR_HEIGHT_CLASSES.length - 1,
    Math.max(0, Math.round(level * (BAR_HEIGHT_CLASSES.length - 1)))
  );
  return BAR_HEIGHT_CLASSES[idx];
}

interface LastWavePlayerProps {
  audio: AudioConfig;
}

export function LastWavePlayer({audio}: LastWavePlayerProps) {
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentTimeSec: 0,
    durationSec: audio.durationSec || 48,
    volume: 0.72,
    levels: Array.from({length: 8}, () => 0.2),
  });
  const [muted, setMuted] = useState(false);
  const playerRef = useRef<HybridAmbientPlayer | null>(null);

  useEffect(() => {
    const player = new HybridAmbientPlayer((next) => {
      setPlayback(next);
    });
    playerRef.current = player;
    player.loadTrack(audio, false);

    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, [audio.audioUrl, audio.title]);

  const handleTogglePlay = () => {
    haptics.trigger('medium');
    playerRef.current?.toggle();
  };

  const handleToggleMute = () => {
    haptics.trigger('selection');
    const nextMuted = !muted;
    setMuted(nextMuted);
    playerRef.current?.setVolume(nextMuted ? 0 : 0.72);
  };

  const coverSrc = resolveAssetUrl(audio.coverUrl);

  if (!audio.enabled) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-black/[0.03] p-3.5 backdrop-blur-md dark:bg-white/[0.04]">
      {/* Background album cover diffused halo */}
      {coverSrc && (
        <img
          src={coverSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full object-cover opacity-15 blur-2xl dark:opacity-25"
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Album Cover & Track Info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--glass-border)] shadow-sm">
            <ResilientMedia
              src={coverSrc}
              alt={audio.title}
              fallbackLabel={audio.title}
              className="h-full w-full"
            />
          </div>

          <div className="min-w-0 text-left">
            <h4 className="truncate font-display text-sm font-semibold text-[var(--text-primary)]">
              {audio.title}
            </h4>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {audio.artist}
            </p>
          </div>
        </div>

        {/* Play/Pause & Sound Wave Spectrum */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Animated 6-bar Spectrum */}
          <div
            aria-hidden="true"
            className="hidden items-end gap-0.5 px-1 sm:flex h-6"
          >
            {playback.levels.slice(0, 6).map((lvl, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full bg-[var(--accent)] transition-all duration-150 ${levelToHeightClass(lvl)} ${
                  playback.isPlaying ? 'opacity-90' : 'opacity-30'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={playback.isPlaying ? 'Pause track' : 'Play track'}
            className="ios-pressable flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            {playback.isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 translate-x-0.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="ios-pressable flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Scrubbable Progress Line */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="font-mono-tabular text-[10px] text-[var(--text-muted)]">
          {formatSeconds(playback.currentTimeSec)}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(1, Math.floor(playback.durationSec))}
          step={1}
          value={Math.floor(playback.currentTimeSec)}
          aria-label="Seek track"
          onChange={(e) => {
            playerRef.current?.seek(Number(e.target.value));
          }}
          className="liquid-slider h-4 flex-1"
        />
        <span className="font-mono-tabular text-[10px] text-[var(--text-muted)]">
          {formatSeconds(playback.durationSec)}
        </span>
      </div>
    </div>
  );
}
