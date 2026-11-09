/**
 * ====================================================================
 * @watermark Ritam // iOS Liquid Glass Theme & Cloud Sync Studio
 * @author Ritam (@ritam)
 * ====================================================================
 * Live personalization drawer for Auto/Dark/Light mode, glass optics,
 * custom media URLs, cross-device Cloud Sync, and config.json export.
 */
import React, {useEffect, useState} from 'react';
import {
  Check,
  Cloud,
  Download,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  isValidHexColor,
  PortfolioConfig,
  serializeConfigForExport,
  THEME_PRESETS,
  ThemeMode,
  ThemePresetId,
  ThemeSettings,
} from '../lib/configSchema';
import {AssetOverrides} from '../lib/syncEngine';
import {haptics} from '../lib/haptics';

export const RITAM_STUDIO_WATERMARK = 'Ritam';

interface ThemeStudioDrawerProps {
  open: boolean;
  onClose: () => void;
  config: PortfolioConfig;
  theme: ThemeSettings;
  assetOverrides: AssetOverrides;
  syncKey: string;
  syncStatusText: string;
  lastSyncedAt: number;
  isSyncing: boolean;
  onUpdateTheme: (patch: Partial<ThemeSettings>) => void;
  onUpdateAssets: (patch: AssetOverrides) => void;
  onSyncNow: (nextKey: string) => Promise<void>;
  onPullCloud: (nextKey: string) => Promise<void>;
  onResetDefaults: () => void;
}

export function ThemeStudioDrawer({
  open,
  onClose,
  config,
  theme,
  assetOverrides,
  syncKey,
  syncStatusText,
  lastSyncedAt,
  isSyncing,
  onUpdateTheme,
  onUpdateAssets,
  onSyncNow,
  onPullCloud,
  onResetDefaults,
}: ThemeStudioDrawerProps) {
  const [keyDraft, setKeyDraft] = useState(syncKey);
  const [keyError, setKeyError] = useState('');
  const [hexDraft, setHexDraft] = useState(theme.customAccent || '');
  const [exportedNotice, setExportedNotice] = useState(false);

  useEffect(() => {
    setKeyDraft(syncKey);
  }, [syncKey]);

  useEffect(() => {
    setHexDraft(theme.customAccent || '');
  }, [theme.customAccent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyDraft.trim();
    if (!trimmed || trimmed.length < 3) {
      setKeyError('Enter a sync key of at least 3 characters.');
      haptics.trigger('heavy');
      return;
    }
    setKeyError('');
    haptics.trigger('medium');
    await onSyncNow(trimmed);
  };

  const handlePullClick = async () => {
    const trimmed = keyDraft.trim();
    if (!trimmed || trimmed.length < 3) {
      setKeyError('Enter a sync key of at least 3 characters.');
      haptics.trigger('heavy');
      return;
    }
    setKeyError('');
    haptics.trigger('light');
    await onPullCloud(trimmed);
  };

  const handleExportJson = () => {
    haptics.trigger('success');
    const mergedForDownload: PortfolioConfig = {
      ...config,
      profile: {
        ...config.profile,
        bannerUrl: assetOverrides.bannerUrl || config.profile.bannerUrl,
        avatarUrl: assetOverrides.avatarUrl || config.profile.avatarUrl,
        logoUrl: assetOverrides.logoUrl || config.profile.logoUrl,
      },
      theme,
      cloudSync: {
        ...config.cloudSync,
        syncKey: keyDraft.trim() || syncKey,
      },
    };

    const jsonText = serializeConfigForExport(mergedForDownload);
    const blob = new Blob([jsonText], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'config.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setExportedNotice(true);
    window.setTimeout(() => setExportedNotice(false), 2400);
  };

  const modes: {id: ThemeMode; label: string}[] = [
    {id: 'auto', label: 'Auto'},
    {id: 'dark', label: 'Dark'},
    {id: 'light', label: 'Light'},
  ];

  const presetList = Object.values(THEME_PRESETS);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        aria-hidden="true"
        onClick={() => {
          haptics.trigger('light');
          onClose();
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="liquid-glass-elevated pt-safe-top pb-safe-bottom relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--glass-border)] px-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--glass-hairline)] pb-4 pt-2">
          <div>
            <h2
              id="studio-drawer-title"
              className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)]"
            >
              Glass &amp; Sync Studio
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Personalize optics, sync across devices, or export config.json
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              onClose();
            }}
            aria-label="Close customization studio"
            className="ios-pressable flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-7 py-6">
          {/* 1. Appearance Mode */}
          <div>
            <span className="block text-xs font-semibold text-[var(--text-primary)]">
              Appearance Mode
            </span>
            <div
              role="group"
              aria-label="Select appearance mode"
              className="mt-2.5 grid grid-cols-3 gap-1 rounded-2xl border border-[var(--glass-border)] bg-black/[0.03] p-1 dark:bg-white/[0.04]"
            >
              {modes.map((m) => {
                const active = theme.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      haptics.trigger('selection');
                      onUpdateTheme({mode: m.id});
                    }}
                    className={`ios-pressable min-h-[40px] rounded-xl text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Curated iOS Presets */}
          <div>
            <span className="block text-xs font-semibold text-[var(--text-primary)]">
              Theme Material Preset
            </span>
            <div className="mt-2.5 grid grid-cols-1 gap-2">
              {presetList.map((preset) => {
                const selected = theme.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      haptics.trigger('selection');
                      onUpdateTheme({
                        preset: preset.id as ThemePresetId,
                        customAccent: '',
                      });
                    }}
                    aria-pressed={selected}
                    className={`ios-pressable flex min-h-[48px] items-center justify-between rounded-2xl border px-4 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                      selected
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[var(--glass-border)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        {preset.label}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {preset.description}
                      </p>
                    </div>
                    {selected && (
                      <Check
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-[var(--accent)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Hex Accent */}
            <div className="mt-3">
              <label
                htmlFor="custom-accent-input"
                className="block text-xs text-[var(--text-secondary)]"
              >
                Custom Accent Hex (optional, e.g. #38BDF8)
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="custom-accent-input"
                  type="text"
                  placeholder="#38BDF8"
                  value={hexDraft}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHexDraft(val);
                    if (val === '' || isValidHexColor(val)) {
                      onUpdateTheme({customAccent: val});
                    }
                  }}
                  className="font-mono-tabular min-h-[44px] flex-1 rounded-xl border border-[var(--glass-border)] bg-transparent px-3.5 text-xs text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
                {hexDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.trigger('light');
                      setHexDraft('');
                      onUpdateTheme({customAccent: ''});
                    }}
                    className="ios-pressable min-h-[44px] rounded-xl border border-[var(--glass-border)] px-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Liquid Glass Optical Sliders */}
          <div className="space-y-4 border-t border-[var(--glass-hairline)] pt-5">
            <span className="block text-xs font-semibold text-[var(--text-primary)]">
              Liquid Glass Optical Physics
            </span>

            <div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <label htmlFor="blur-slider">Frosted Diffusion Blur</label>
                <span className="font-mono-tabular">{theme.glassBlurPx}px</span>
              </div>
              <input
                id="blur-slider"
                type="range"
                min={8}
                max={40}
                step={1}
                value={theme.glassBlurPx}
                onChange={(e) =>
                  onUpdateTheme({glassBlurPx: Number(e.target.value)})
                }
                className="liquid-slider mt-1 h-6 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <label htmlFor="refraction-slider">
                  Lens Edge Refraction Scale
                </label>
                <span className="font-mono-tabular">
                  {theme.glassRefractionScale}
                </span>
              </div>
              <input
                id="refraction-slider"
                type="range"
                min={0}
                max={36}
                step={1}
                value={theme.glassRefractionScale}
                onChange={(e) =>
                  onUpdateTheme({
                    glassRefractionScale: Number(e.target.value),
                  })
                }
                className="liquid-slider mt-1 h-6 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <label htmlFor="specular-slider">Specular Rim Highlight</label>
                <span className="font-mono-tabular">
                  {Math.round(theme.glassSpecular * 100)}%
                </span>
              </div>
              <input
                id="specular-slider"
                type="range"
                min={10}
                max={80}
                step={2}
                value={Math.round(theme.glassSpecular * 100)}
                onChange={(e) =>
                  onUpdateTheme({glassSpecular: Number(e.target.value) / 100})
                }
                className="liquid-slider mt-1 h-6 w-full"
              />
            </div>
          </div>

          {/* 4. Tactile & Motion Toggles */}
          <div className="space-y-2.5 border-t border-[var(--glass-hairline)] pt-5">
            <span className="block text-xs font-semibold text-[var(--text-primary)]">
              Tactile &amp; Interactive Feel
            </span>

            {[
              {
                key: 'hapticsEnabled' as const,
                label: 'Haptic Button Feedback',
                enabled: theme.hapticsEnabled,
              },
              {
                key: 'clickSparkEnabled' as const,
                label: 'Tactile Click Sparks',
                enabled: theme.clickSparkEnabled,
              },
              {
                key: 'cardTiltEnabled' as const,
                label: '3D Perspective Card Tilt',
                enabled: theme.cardTiltEnabled,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex min-h-[44px] items-center justify-between"
              >
                <span className="text-xs text-[var(--text-secondary)]">
                  {item.label}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.enabled}
                  aria-label={item.label}
                  onClick={() => {
                    const nextVal = !item.enabled;
                    if (item.key === 'hapticsEnabled') {
                      haptics.setEnabled(nextVal);
                    }
                    haptics.trigger('selection');
                    onUpdateTheme({[item.key]: nextVal});
                  }}
                  className={`ios-pressable flex h-7 w-12 items-center rounded-full p-1 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                    item.enabled
                      ? 'justify-end bg-[var(--accent)]'
                      : 'justify-start bg-slate-400/35'
                  }`}
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            ))}
          </div>

          {/* 5. Custom Media URL Overrides */}
          <div className="space-y-3 border-t border-[var(--glass-hairline)] pt-5">
            <span className="block text-xs font-semibold text-[var(--text-primary)]">
              Custom Media Placeholders
            </span>
            <p className="text-[11px] text-[var(--text-muted)]">
              Preview custom URLs or ./assets/ files live before exporting
              config.json.
            </p>

            <div>
              <label
                htmlFor="override-banner-url"
                className="block text-xs text-[var(--text-secondary)]"
              >
                Profile Banner URL
              </label>
              <input
                id="override-banner-url"
                type="text"
                placeholder="./assets/banner.jpg or preset:banner"
                value={assetOverrides.bannerUrl ?? ''}
                onChange={(e) =>
                  onUpdateAssets({
                    ...assetOverrides,
                    bannerUrl: e.target.value,
                  })
                }
                className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-xl border border-[var(--glass-border)] bg-transparent px-3 text-xs text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="override-wallpaper-url"
                className="block text-xs text-[var(--text-secondary)]"
              >
                Background Wallpaper URL
              </label>
              <input
                id="override-wallpaper-url"
                type="text"
                placeholder="./assets/wallpaper.jpg or preset:wallpaper"
                value={assetOverrides.wallpaperDarkUrl ?? ''}
                onChange={(e) =>
                  onUpdateAssets({
                    ...assetOverrides,
                    wallpaperDarkUrl: e.target.value,
                  })
                }
                className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-xl border border-[var(--glass-border)] bg-transparent px-3 text-xs text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
            </div>
          </div>

          {/* 6. Cross-Device Cloud Synchronization */}
          <form
            onSubmit={handleSyncSubmit}
            className="space-y-3 border-t border-[var(--glass-hairline)] pt-5"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                <Cloud aria-hidden="true" className="h-4 w-4 text-[var(--accent)]" />
                <span>Cloud Data Sync</span>
              </span>
              <span className="font-mono-tabular text-[11px] text-[var(--text-muted)]">
                {syncStatusText}
              </span>
            </div>

            <div>
              <label
                htmlFor="cloud-sync-key"
                className="block text-xs text-[var(--text-secondary)]"
              >
                Workspace Sync Key
              </label>
              <input
                id="cloud-sync-key"
                type="text"
                value={keyDraft}
                onChange={(e) => {
                  setKeyDraft(e.target.value);
                  if (keyError) setKeyError('');
                }}
                placeholder="ritam-primary-space"
                className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-xl border border-[var(--glass-border)] bg-transparent px-3 text-xs text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
              {keyError && (
                <p role="alert" className="mt-1.5 text-xs text-rose-500">
                  {keyError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                disabled={isSyncing}
                className="ios-pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)] disabled:opacity-60"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handlePullClick}
                className="ios-pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span>Pull Cloud</span>
              </button>
            </div>

            {lastSyncedAt > 0 && (
              <p className="font-mono-tabular text-[11px] text-[var(--text-muted)]">
                Last synced:{' '}
                {new Date(lastSyncedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            )}
          </form>

          {/* 7. Export config.json & Reset */}
          <div className="space-y-2.5 border-t border-[var(--glass-hairline)] pt-5">
            <button
              type="button"
              onClick={handleExportJson}
              className="ios-pressable flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] bg-black/[0.04] px-4 text-xs font-semibold text-[var(--text-primary)] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12]"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              <span>
                {exportedNotice
                  ? 'Downloaded config.json'
                  : 'Export config.json for GitHub'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.trigger('medium');
                onResetDefaults();
              }}
              className="ios-pressable flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Reset to config.json Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
