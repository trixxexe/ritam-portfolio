/**
 * ====================================================================
 * @watermark Ritam // Minimalist Guns.lol iOS Liquid Glass Portfolio
 * @author Ritam (@ritam)
 * ====================================================================
 * Centered, peak aesthetic profile card with embedded LastWave audio,
 * guns.lol social links, clean projects, tactile haptics, and zero-code
 * runtime customization via public/config.json.
 */
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Copy,
  Disc3,
  ExternalLink,
  Eye,
  FolderGit2,
  Github,
  Globe,
  Instagram,
  Link2,
  Mail,
  MessageSquare,
  Moon,
  Send,
  SlidersHorizontal,
  Star,
  Sun,
  Twitter,
  Youtube,
} from 'lucide-react';
import {
  computeThemeCssVariables,
  DEFAULT_PORTFOLIO_CONFIG,
  mergePortfolioConfig,
  PortfolioConfig,
  ProjectItem,
  resolveEffectiveDark,
  sanitizeThemeSettings,
  SocialItem,
  ThemeSettings,
} from './lib/configSchema';
import {
  AssetOverrides,
  CloudSyncClient,
  sanitizeSyncKey,
  SyncSnapshot,
} from './lib/syncEngine';
import {resolveAssetUrl} from './lib/clientAssets';
import {haptics} from './lib/haptics';
import {
  LiquidGlassDefs,
  LiquidGlassSurface,
  ResilientMedia,
} from './components/glass/LiquidGlass';
import {AuroraBackdrop} from './components/reactbits/AuroraBackdrop';
import {ClickSparkLayer} from './components/reactbits/ClickSparkLayer';
import {LastWavePlayer} from './components/LastWavePlayer';
import {ThemeStudioDrawer} from './components/ThemeStudioDrawer';

export const RITAM_APP_WATERMARK = 'Ritam';

function renderSocialIcon(icon: string) {
  const cls = 'h-4 w-4 text-[var(--text-primary)]';
  switch (icon) {
    case 'github':
      return <Github aria-hidden="true" className={cls} />;
    case 'discord':
      return <MessageSquare aria-hidden="true" className={cls} />;
    case 'instagram':
      return <Instagram aria-hidden="true" className={cls} />;
    case 'twitter':
    case 'x':
      return <Twitter aria-hidden="true" className={cls} />;
    case 'music':
    case 'spotify':
      return <Disc3 aria-hidden="true" className={cls} />;
    case 'youtube':
      return <Youtube aria-hidden="true" className={cls} />;
    case 'mail':
    case 'email':
      return <Mail aria-hidden="true" className={cls} />;
    case 'telegram':
      return <Send aria-hidden="true" className={cls} />;
    default:
      return <Globe aria-hidden="true" className={cls} />;
  }
}

export default function App() {
  const [config, setConfig] = useState<PortfolioConfig>(
    DEFAULT_PORTFOLIO_CONFIG
  );
  const [theme, setTheme] = useState<ThemeSettings>(
    DEFAULT_PORTFOLIO_CONFIG.theme
  );
  const [assetOverrides, setAssetOverrides] = useState<AssetOverrides>({});
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<'links' | 'projects'>('links');
  const [syncKey, setSyncKey] = useState<string>(
    DEFAULT_PORTFOLIO_CONFIG.cloudSync.syncKey
  );
  const [viewsCount, setViewsCount] = useState<number>(1420);
  const [channelClicks, setChannelClicks] = useState<Record<string, number>>(
    {}
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncStatusText, setSyncStatusText] = useState<string>('Synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [studioOpen, setStudioOpen] = useState<boolean>(false);

  const syncClientRef = useRef<CloudSyncClient | null>(null);
  const syncRevisionRef = useRef<number>(0);

  const isDark = useMemo(
    () => resolveEffectiveDark(theme.mode, systemDark),
    [theme.mode, systemDark]
  );

  // Auto dark mode listener
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (ev: MediaQueryListEvent) => setSystemDark(ev.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Update theme CSS variables & Dark class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);

    const vars = computeThemeCssVariables(theme, isDark);
    for (const [prop, val] of Object.entries(vars)) {
      root.style.setProperty(prop, val);
    }
    haptics.setEnabled(theme.hapticsEnabled);
  }, [theme, isDark]);

  const applySnapshot = useCallback(
    (snap: SyncSnapshot, baseTheme: ThemeSettings) => {
      syncRevisionRef.current = snap.revision || 0;
      if (snap.updatedAt) setLastSyncedAt(snap.updatedAt);
      if (snap.themeOverrides && Object.keys(snap.themeOverrides).length > 0) {
        setTheme(sanitizeThemeSettings(snap.themeOverrides, baseTheme));
      }
      if (snap.assetOverrides) {
        setAssetOverrides(snap.assetOverrides);
      }
      if (snap.metrics) {
        if (typeof snap.metrics.views === 'number') {
          setViewsCount(snap.metrics.views);
        }
        if (snap.metrics.channelClicks) {
          setChannelClicks(snap.metrics.channelClicks);
        }
      }
    },
    []
  );

  // Load public/config.json at runtime + initial Cloud Sync pull
  useEffect(() => {
    let cancelled = false;
    const client = new CloudSyncClient((incoming) => {
      if (!cancelled) {
        applySnapshot(incoming, DEFAULT_PORTFOLIO_CONFIG.theme);
        setSyncStatusText('Synced across tabs');
      }
    });
    syncClientRef.current = client;

    async function bootstrap() {
      let loadedConfig = DEFAULT_PORTFOLIO_CONFIG;
      try {
        const base = import.meta.env.BASE_URL || './';
        const cfgUrl = base.endsWith('/')
          ? `${base}config.json`
          : `${base}/config.json`;
        const res = await fetch(cfgUrl, {
          headers: {Accept: 'application/json'},
        });
        if (res.ok) {
          const rawJson = await res.json();
          loadedConfig = mergePortfolioConfig(rawJson);
        }
      } catch {
        // Fallback cleanly to bundled defaults
      }

      if (cancelled) return;
      setConfig(loadedConfig);
      setTheme(loadedConfig.theme);
      document.title = loadedConfig.meta.siteTitle;

      const initialKey = sanitizeSyncKey(loadedConfig.cloudSync.syncKey);
      setSyncKey(initialKey);

      if (loadedConfig.cloudSync.enabled) {
        setIsSyncing(true);
        const {snapshot, source} = await client.pull(
          initialKey,
          loadedConfig.cloudSync.provider,
          {
            customEndpointUrl: loadedConfig.cloudSync.customEndpointUrl,
            gistId: loadedConfig.cloudSync.gistId,
          }
        );
        if (!cancelled) {
          applySnapshot(snapshot, loadedConfig.theme);
          setSyncStatusText(source === 'cloud' ? 'Cloud synced' : 'Local ready');
          setIsSyncing(false);
        }

        const incremented = await client.incrementMetric(initialKey, 'view');
        if (!cancelled && incremented?.metrics?.views) {
          setViewsCount(incremented.metrics.views);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
      client.dispose();
      syncClientRef.current = null;
    };
  }, [applySnapshot]);

  // Dynamically hydrate public repositories from GitHub for trixxexe
  useEffect(() => {
    let active = true;
    async function fetchGitHubRepos() {
      try {
        const res = await fetch('https://api.github.com/users/trixxexe/repos?sort=updated&per_page=30');
        if (!res.ok) return;
        const repos = (await res.json()) as Array<{
          id: number;
          name: string;
          description: string | null;
          html_url: string;
          stargazers_count: number;
          language: string | null;
          topics?: string[];
          fork: boolean;
        }>;

        if (!active || !Array.isArray(repos) || repos.length === 0) return;

        const presets = ['preset:project-audio', 'preset:project-prism', 'preset:project-kinetix'];
        const liveRepos: ProjectItem[] = repos
          .filter((r) => !r.fork)
          .map((r, idx) => {
            const tags = [r.language, ...(r.topics || [])].filter(Boolean) as string[];
            return {
              id: `gh-${r.name}`,
              title: r.name,
              description: r.description || 'Public open source project by Ritam (@trixxexe).',
              url: r.html_url,
              tags: tags.length > 0 ? tags.slice(0, 4) : ['OpenSource'],
              imageUrl: presets[idx % presets.length],
              stars: r.stargazers_count,
            };
          })
          .sort((a, b) => (b.stars || 0) - (a.stars || 0));

        if (liveRepos.length > 0) {
          setConfig((prev) => ({
            ...prev,
            projects: liveRepos,
          }));
        }
      } catch {
        // Keeps pre-seeded config.json projects on network fallback
      }
    }

    void fetchGitHubRepos();
    return () => {
      active = false;
    };
  }, []);

  const persistToCloud = useCallback(
    async (
      nextTheme: ThemeSettings,
      nextAssets: AssetOverrides,
      targetKey: string
    ) => {
      const client = syncClientRef.current;
      if (!client) return;
      const cleanKey = sanitizeSyncKey(targetKey);
      setIsSyncing(true);
      setSyncStatusText('Syncing...');

      const snapshot: SyncSnapshot = {
        syncKey: cleanKey,
        updatedAt: Date.now(),
        revision: syncRevisionRef.current,
        themeOverrides: nextTheme,
        assetOverrides: nextAssets,
        metrics: {
          views: viewsCount,
          channelClicks,
        },
      };

      const {snapshot: saved, syncedToCloud} = await client.push(
        snapshot,
        config.cloudSync.provider,
        {customEndpointUrl: config.cloudSync.customEndpointUrl}
      );
      syncRevisionRef.current = saved.revision;
      setLastSyncedAt(saved.updatedAt);
      setSyncStatusText(syncedToCloud ? 'Cloud synced' : 'Saved locally');
      setIsSyncing(false);
    },
    [
      channelClicks,
      config.cloudSync.customEndpointUrl,
      config.cloudSync.provider,
      viewsCount,
    ]
  );

  const handleUpdateTheme = (patch: Partial<ThemeSettings>) => {
    setTheme((prev) => {
      const updated = sanitizeThemeSettings({...prev, ...patch}, prev);
      void persistToCloud(updated, assetOverrides, syncKey);
      return updated;
    });
  };

  const handleUpdateAssets = (nextAssets: AssetOverrides) => {
    setAssetOverrides(nextAssets);
    void persistToCloud(theme, nextAssets, syncKey);
  };

  const handleManualSync = async (requestedKey: string) => {
    const cleanKey = sanitizeSyncKey(requestedKey);
    setSyncKey(cleanKey);
    await persistToCloud(theme, assetOverrides, cleanKey);
  };

  const handlePullCloud = async (requestedKey: string) => {
    const client = syncClientRef.current;
    if (!client) return;
    const cleanKey = sanitizeSyncKey(requestedKey);
    setSyncKey(cleanKey);
    setIsSyncing(true);
    setSyncStatusText('Pulling...');
    const {snapshot, source} = await client.pull(
      cleanKey,
      config.cloudSync.provider,
      {
        customEndpointUrl: config.cloudSync.customEndpointUrl,
        gistId: config.cloudSync.gistId,
      }
    );
    applySnapshot(snapshot, config.theme);
    setSyncStatusText(source === 'cloud' ? 'Pulled from cloud' : 'Loaded local');
    setIsSyncing(false);
  };

  const handleResetDefaults = () => {
    setTheme(config.theme);
    setAssetOverrides({});
    void persistToCloud(config.theme, {}, syncKey);
  };

  const handleSocialClick = async (social: SocialItem) => {
    if (social.action === 'copy') {
      haptics.trigger('success');
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(social.url || social.handle);
        }
      } catch {}
      setCopiedId(social.id);
      window.setTimeout(() => setCopiedId((c) => (c === social.id ? null : c)), 2000);
    } else {
      haptics.trigger('light');
    }

    const client = syncClientRef.current;
    if (client) {
      const updated = await client.incrementMetric(syncKey, 'channel', social.id);
      if (updated?.metrics?.channelClicks) {
        setChannelClicks({...updated.metrics.channelClicks});
      }
    }
  };

  const bannerSrc = resolveAssetUrl(
    assetOverrides.bannerUrl || config.profile.bannerUrl
  );
  const avatarSrc = resolveAssetUrl(
    assetOverrides.avatarUrl || config.profile.avatarUrl
  );
  const logoSrc = resolveAssetUrl(
    assetOverrides.logoUrl || config.profile.logoUrl
  );
  const wallpaperSrc = resolveAssetUrl(
    assetOverrides.wallpaperDarkUrl || 'preset:wallpaper'
  );

  return (
    <div
      data-watermark={RITAM_APP_WATERMARK}
      className="relative flex min-h-dvh w-full flex-col items-center justify-between p-3 sm:p-6 md:p-10 safe-shell pt-safe-top pb-safe-bottom"
    >
      {/* Liquid Glass Optical Filters & Ambient Backdrop */}
      <LiquidGlassDefs refractionScale={theme.glassRefractionScale} />
      <AuroraBackdrop
        wallpaperUrl={wallpaperSrc}
        wallpaperOpacity={0.4}
        auroraEnabled={true}
        preset={theme.preset}
        isDark={isDark}
      />
      <ClickSparkLayer enabled={theme.clickSparkEnabled} />

      {/* Floating Top Bar (guns.lol Style Minimalist Utility Strip) */}
      <header className="relative z-20 flex w-full max-w-xl items-center justify-between gap-3 px-1 py-2">
        {/* Synced Views Counter */}
        <div className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono-tabular text-xs text-[var(--text-secondary)]">
          <Eye aria-hidden="true" className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span>{viewsCount.toLocaleString()} views</span>
        </div>

        {/* Quick Actions (Appearance + Studio) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('selection');
              handleUpdateTheme({mode: isDark ? 'light' : 'dark'});
            }}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="ios-pressable liquid-glass flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            {isDark ? (
              <Sun aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Moon aria-hidden="true" className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.trigger('medium');
              setStudioOpen(true);
            }}
            aria-label="Customize profile & theme"
            className="ios-pressable liquid-glass flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Core Guns.lol Minimalist Liquid Glass Profile Card */}
      <main className="relative z-10 my-auto w-full max-w-xl py-4">
        <LiquidGlassSurface
          tiltEnabled={theme.cardTiltEnabled}
          className="shadow-2xl"
          contentClassName="flex flex-col"
        >
          {/* 1. Header Banner */}
          <div className="relative h-36 w-full sm:h-44 overflow-hidden bg-black flex items-center justify-center">
            <ResilientMedia
              src={bannerSrc}
              alt={`${config.profile.name} banner`}
              fallbackLabel="Profile Banner"
              className="h-full w-full bg-black"
              imgClassName="h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
            />

            {/* Custom Logo Badge on Banner */}
            {logoSrc && (
              <div className="absolute right-3.5 top-3.5 h-8 w-8 overflow-hidden rounded-xl border border-white/20 bg-black/40 p-1 backdrop-blur-md">
                <img
                  src={logoSrc}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>

          {/* 2. Avatar & Identity Lockup */}
          <div className="px-5 pb-5 sm:px-7">
            <div className="flex items-end justify-between">
              {/* Profile Avatar */}
              <div className="relative -mt-10 sm:-mt-12 h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 border-white/80 shadow-xl dark:border-white/20">
                <ResilientMedia
                  src={avatarSrc}
                  alt={config.profile.name}
                  fallbackLabel={config.profile.name}
                  className="h-full w-full"
                />
              </div>

              {/* Status Indicator */}
              {config.profile.status && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-black/[0.04] px-3 py-1 text-xs text-[var(--text-secondary)] dark:bg-white/[0.05]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">{config.profile.status}</span>
                </div>
              )}
            </div>

            {/* Name, Handle, Badge & Location */}
            <div className="mt-3.5">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  {config.profile.name}
                </h1>
                <BadgeCheck
                  aria-label="Verified creator"
                  className="h-5 w-5 text-[var(--accent)]"
                />
                {config.profile.badge && (
                  <span className="rounded-md border border-[var(--glass-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {config.profile.badge}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                <span>{config.profile.handle}</span>
                {config.profile.location && (
                  <>
                    <span aria-hidden="true">{' · '}</span>
                    <span>{config.profile.location}</span>
                  </>
                )}
              </p>

              {config.profile.bio && (
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {config.profile.bio}
                </p>
              )}
            </div>

            {/* 3. Embedded LastWave Audio Deck */}
            {config.audio?.enabled && (
              <div className="mt-5">
                <LastWavePlayer audio={config.audio} />
              </div>
            )}

            {/* 4. Segmented Tabs: [ Links ] [ Projects ] */}
            <div className="mt-6 flex border-b border-[var(--glass-hairline)] pb-3">
              <div
                role="tablist"
                aria-label="Profile tabs"
                className="liquid-glass inline-flex w-full rounded-xl p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'links'}
                  onClick={() => {
                    haptics.trigger('selection');
                    setActiveTab('links');
                  }}
                  className={`ios-pressable flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'links'
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Links</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'projects'}
                  onClick={() => {
                    haptics.trigger('selection');
                    setActiveTab('projects');
                  }}
                  className={`ios-pressable flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'projects'
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FolderGit2 aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Projects</span>
                </button>
              </div>
            </div>

            {/* 5. Tab Content: Links List or Projects Showcase */}
            <div className="mt-4">
              {activeTab === 'links' ? (
                <div className="space-y-2.5">
                  {config.socials.map((social) => {
                    const isCopied = copiedId === social.id;
                    const clicks = channelClicks[social.id] || 0;

                    const row = (
                      <div className="group flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-black/[0.02] px-4 py-2.5 transition-colors hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-black/[0.03] dark:bg-white/[0.05]">
                            {renderSocialIcon(social.icon)}
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="block truncate font-display text-xs font-semibold text-[var(--text-primary)]">
                              {social.label}
                            </span>
                            <span className="block truncate font-mono-tabular text-[11px] text-[var(--text-muted)]">
                              {isCopied ? 'Copied to clipboard' : social.handle}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {clicks > 0 && (
                            <span className="font-mono-tabular text-[10px] text-[var(--text-muted)]">
                              {clicks}
                            </span>
                          )}
                          {social.action === 'copy' ? (
                            isCopied ? (
                              <Check
                                aria-hidden="true"
                                className="h-4 w-4 text-[var(--accent)]"
                              />
                            ) : (
                              <Copy
                                aria-hidden="true"
                                className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)]"
                              />
                            )
                          ) : (
                            <ArrowUpRight
                              aria-hidden="true"
                              className="h-4 w-4 text-[var(--text-muted)] transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                            />
                          )}
                        </div>
                      </div>
                    );

                    return social.action === 'copy' ? (
                      <button
                        key={social.id}
                        type="button"
                        onClick={() => handleSocialClick(social)}
                        aria-label={`Copy ${social.label} handle`}
                        className="ios-pressable block w-full focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                      >
                        {row}
                      </button>
                    ) : (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleSocialClick(social)}
                        aria-label={`Open ${social.label}`}
                        className="ios-pressable block w-full focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                      >
                        {row}
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {config.projects.map((project: ProjectItem) => {
                    const imgSrc = resolveAssetUrl(project.imageUrl);
                    return (
                      <a
                        key={project.id}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => haptics.trigger('light')}
                        className="ios-pressable group flex min-h-[72px] items-center gap-3.5 rounded-xl border border-[var(--glass-border)] bg-black/[0.02] p-3 text-left transition-colors hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                      >
                        {imgSrc && (
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--glass-border)]">
                            <ResilientMedia
                              src={imgSrc}
                              alt={project.title}
                              fallbackLabel={project.title}
                              className="h-full w-full"
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate font-display text-xs font-semibold text-[var(--text-primary)]">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {typeof project.stars === 'number' && project.stars > 0 && (
                                <span className="flex items-center gap-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 font-mono-tabular text-[10px] font-medium text-amber-400">
                                  <Star aria-hidden="true" className="h-2.5 w-2.5 fill-amber-400" />
                                  <span>{project.stars}</span>
                                </span>
                              )}
                              <ExternalLink
                                aria-hidden="true"
                                className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)]"
                              />
                            </div>
                          </div>

                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                            {project.description}
                          </p>

                          {project.tags && project.tags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {project.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="font-mono-tabular text-[10px] text-[var(--text-muted)]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Polished Card Bottom Line */}
            <div className="mt-6 flex items-center justify-between border-t border-[var(--glass-hairline)] pt-3 text-[11px] text-[var(--text-muted)]">
              <span className="font-display font-medium tracking-wide text-[var(--text-secondary)]">{config.profile.name}</span>
              <span className="font-mono-tabular text-[10px] text-[var(--text-muted)] opacity-80">{config.profile.location || 'India'}</span>
            </div>
          </div>
        </LiquidGlassSurface>
      </main>

      {/* Subtle Polished Footer */}
      <footer className="relative z-20 py-3 text-center text-[11px] text-[var(--text-muted)]">
        <span>© {new Date().getFullYear()} {config.profile.name}</span>
      </footer>

      {/* Theme & Cloud Sync Studio Drawer */}
      <ThemeStudioDrawer
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        config={config}
        theme={theme}
        assetOverrides={assetOverrides}
        syncKey={syncKey}
        syncStatusText={syncStatusText}
        lastSyncedAt={lastSyncedAt}
        isSyncing={isSyncing}
        onUpdateTheme={handleUpdateTheme}
        onUpdateAssets={handleUpdateAssets}
        onSyncNow={handleManualSync}
        onPullCloud={handlePullCloud}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
