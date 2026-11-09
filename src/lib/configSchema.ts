/**
 * ====================================================================
 * @watermark Ritam // Minimalist Guns.lol Portfolio Config Schema
 * @author Ritam (@ritam)
 * ====================================================================
 * Pure TypeScript module (zero DOM/image imports) so unit tests run
 * deterministically via `npx --yes tsx --test`.
 */

export const RITAM_SCHEMA_WATERMARK = 'Ritam';

export type ThemeMode = 'auto' | 'dark' | 'light';

export type ThemePresetId =
  | 'obsidian-ice'
  | 'titanium-amber'
  | 'midnight-cobalt'
  | 'pearl-quartz'
  | 'graphite-emerald';

export interface LyricLine {
  timeSec: number;
  line: string;
}

export interface SocialItem {
  id: string;
  label: string;
  handle: string;
  url: string;
  icon: 'github' | 'discord' | 'twitter' | 'music' | 'youtube' | 'mail' | 'telegram' | 'globe' | 'instagram' | string;
  action?: 'external' | 'copy';
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  url: string;
  tags?: string[];
  imageUrl?: string;
  category?: string;
  year?: string;
  stars?: number;
}

export interface AudioConfig {
  enabled: boolean;
  title: string;
  artist: string;
  album?: string;
  audioUrl?: string;
  coverUrl?: string;
  durationSec?: number;
  synthChordRootHz?: number;
}

export interface ThemeSettings {
  mode: ThemeMode;
  preset: ThemePresetId;
  customAccent: string;
  glassBlurPx: number;
  glassRefractionScale: number;
  glassSpecular: number;
  hapticsEnabled: boolean;
  clickSparkEnabled: boolean;
  cardTiltEnabled: boolean;
}

export interface CloudSyncConfig {
  enabled: boolean;
  syncKey: string;
  provider: 'built-in' | 'custom-endpoint' | 'github-gist';
  customEndpointUrl?: string;
  gistId?: string;
}

export interface PortfolioConfig {
  _watermark: string;
  meta: {
    siteTitle: string;
    siteDescription: string;
  };
  profile: {
    name: string;
    handle: string;
    badge: string;
    status: string;
    bio: string;
    location: string;
    avatarUrl: string;
    bannerUrl: string;
    logoUrl?: string;
  };
  audio: AudioConfig;
  socials: SocialItem[];
  projects: ProjectItem[];
  theme: ThemeSettings;
  cloudSync: CloudSyncConfig;
}

export interface PresetPalette {
  id: ThemePresetId;
  label: string;
  description: string;
  dark: {
    canvasBg: string;
    canvasSecondary: string;
    glassBg: string;
    glassElevated: string;
    accent: string;
    accentContrast: string;
    auroraA: string;
    auroraB: string;
  };
  light: {
    canvasBg: string;
    canvasSecondary: string;
    glassBg: string;
    glassElevated: string;
    accent: string;
    accentContrast: string;
    auroraA: string;
    auroraB: string;
  };
}

export const THEME_PRESETS: Record<ThemePresetId, PresetPalette> = {
  'obsidian-ice': {
    id: 'obsidian-ice',
    label: 'Obsidian Ice',
    description: 'Obsidian glass with glacial sky accent',
    dark: {
      canvasBg: '#07090e',
      canvasSecondary: '#0d131f',
      glassBg: 'rgba(15, 21, 34, 0.65)',
      glassElevated: 'rgba(18, 25, 40, 0.90)',
      accent: '#38bdf8',
      accentContrast: '#04111d',
      auroraA: 'rgba(56, 189, 248, 0.16)',
      auroraB: 'rgba(148, 163, 184, 0.12)',
    },
    light: {
      canvasBg: '#f3f5fa',
      canvasSecondary: '#e6ebf5',
      glassBg: 'rgba(255, 255, 255, 0.78)',
      glassElevated: 'rgba(255, 255, 255, 0.94)',
      accent: '#0284c7',
      accentContrast: '#ffffff',
      auroraA: 'rgba(2, 132, 199, 0.12)',
      auroraB: 'rgba(100, 116, 139, 0.10)',
    },
  },
  'titanium-amber': {
    id: 'titanium-amber',
    label: 'Titanium Amber',
    description: 'Brushed titanium with warm amber accent',
    dark: {
      canvasBg: '#0a0908',
      canvasSecondary: '#151210',
      glassBg: 'rgba(24, 21, 18, 0.65)',
      glassElevated: 'rgba(28, 24, 21, 0.90)',
      accent: '#f59e0b',
      accentContrast: '#190f02',
      auroraA: 'rgba(245, 158, 11, 0.16)',
      auroraB: 'rgba(168, 162, 158, 0.12)',
    },
    light: {
      canvasBg: '#f7f5f2',
      canvasSecondary: '#ece8e1',
      glassBg: 'rgba(255, 253, 250, 0.80)',
      glassElevated: 'rgba(255, 254, 252, 0.94)',
      accent: '#b45309',
      accentContrast: '#ffffff',
      auroraA: 'rgba(217, 119, 6, 0.11)',
      auroraB: 'rgba(120, 113, 108, 0.09)',
    },
  },
  'midnight-cobalt': {
    id: 'midnight-cobalt',
    label: 'Midnight Cobalt',
    description: 'Deep midnight with electric cobalt',
    dark: {
      canvasBg: '#050814',
      canvasSecondary: '#0c1328',
      glassBg: 'rgba(13, 20, 42, 0.65)',
      glassElevated: 'rgba(15, 23, 48, 0.90)',
      accent: '#60a5fa',
      accentContrast: '#050e21',
      auroraA: 'rgba(59, 130, 246, 0.18)',
      auroraB: 'rgba(99, 102, 241, 0.12)',
    },
    light: {
      canvasBg: '#f2f5fc',
      canvasSecondary: '#e5eaf8',
      glassBg: 'rgba(255, 255, 255, 0.78)',
      glassElevated: 'rgba(255, 255, 255, 0.94)',
      accent: '#2563eb',
      accentContrast: '#ffffff',
      auroraA: 'rgba(37, 99, 235, 0.12)',
      auroraB: 'rgba(71, 85, 105, 0.09)',
    },
  },
  'pearl-quartz': {
    id: 'pearl-quartz',
    label: 'Pearl Quartz',
    description: 'Alabaster glass with rose quartz accent',
    dark: {
      canvasBg: '#0b080b',
      canvasSecondary: '#171117',
      glassBg: 'rgba(26, 18, 26, 0.65)',
      glassElevated: 'rgba(31, 21, 31, 0.90)',
      accent: '#fb7185',
      accentContrast: '#1f050a',
      auroraA: 'rgba(244, 63, 94, 0.16)',
      auroraB: 'rgba(148, 163, 184, 0.11)',
    },
    light: {
      canvasBg: '#f9f6f7',
      canvasSecondary: '#f0eaec',
      glassBg: 'rgba(255, 255, 255, 0.80)',
      glassElevated: 'rgba(255, 255, 255, 0.94)',
      accent: '#e11d48',
      accentContrast: '#ffffff',
      auroraA: 'rgba(225, 29, 72, 0.10)',
      auroraB: 'rgba(100, 116, 139, 0.08)',
    },
  },
  'graphite-emerald': {
    id: 'graphite-emerald',
    label: 'Graphite Emerald',
    description: 'Graphite glass with crisp emerald accent',
    dark: {
      canvasBg: '#060a09',
      canvasSecondary: '#0d1715',
      glassBg: 'rgba(14, 24, 22, 0.65)',
      glassElevated: 'rgba(17, 29, 27, 0.90)',
      accent: '#2dd4bf',
      accentContrast: '#031714',
      auroraA: 'rgba(45, 212, 191, 0.16)',
      auroraB: 'rgba(148, 163, 184, 0.11)',
    },
    light: {
      canvasBg: '#f3f7f6',
      canvasSecondary: '#e4eeec',
      glassBg: 'rgba(255, 255, 255, 0.78)',
      glassElevated: 'rgba(255, 255, 255, 0.94)',
      accent: '#0f766e',
      accentContrast: '#ffffff',
      auroraA: 'rgba(13, 148, 136, 0.11)',
      auroraB: 'rgba(100, 116, 139, 0.09)',
    },
  },
};

export const DEFAULT_PORTFOLIO_CONFIG: PortfolioConfig = {
  _watermark:
    'Ritam // Signature iOS Liquid Glass Portfolio — Edit this config.json directly to customize your site without touching code.',
  meta: {
    siteTitle: 'Ritam',
    siteDescription: 'Minimalist guns.lol style bio & portfolio by Ritam',
  },
  profile: {
    name: 'Ritam',
    handle: '@trixxexe',
    badge: 'Developer',
    status: 'Available for projects',
    bio: 'Building sleek web tools, interfaces & open source.',
    location: 'India',
    avatarUrl: './assets/ritam-avatar.svg',
    bannerUrl: './assets/ritam-banner.png',
    logoUrl: './assets/custom-logo.svg',
  },
  audio: {
    enabled: true,
    title: 'Velvet Refraction',
    artist: 'Ritam',
    album: 'Studio Tape',
    audioUrl: '',
    coverUrl: 'preset:project-audio',
    durationSec: 48,
    synthChordRootHz: 220,
  },
  socials: [
    {
      id: 'github',
      label: 'GitHub',
      handle: '@trixxexe',
      url: 'https://github.com/trixxexe',
      icon: 'github',
      action: 'external',
    },
    {
      id: 'discord-1',
      label: 'Discord',
      handle: 'ritam.007',
      url: 'ritam.007',
      icon: 'discord',
      action: 'copy',
    },
    {
      id: 'discord-2',
      label: 'Discord',
      handle: 'witheredcry',
      url: 'witheredcry',
      icon: 'discord',
      action: 'copy',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@ritam.zip',
      url: 'https://instagram.com/ritam.zip',
      icon: 'instagram',
      action: 'external',
    },
    {
      id: 'email',
      label: 'Email',
      handle: 'jyotirmoyghosh904@gmail.com',
      url: 'jyotirmoyghosh904@gmail.com',
      icon: 'mail',
      action: 'copy',
    },
  ],
  projects: [
    {
      id: 'project-1',
      title: 'Project Alpha',
      description: 'Minimalist web app with real-time audio visualization.',
      url: 'https://github.com',
      tags: ['React', 'TypeScript'],
      imageUrl: 'preset:project-audio',
    },
    {
      id: 'project-2',
      title: 'Liquid Glass UI',
      description: 'iOS-inspired liquid glass components and refraction shaders.',
      url: 'https://github.com',
      tags: ['Tailwind', 'CSS'],
      imageUrl: 'preset:project-prism',
    },
    {
      id: 'project-3',
      title: 'Tactile Dial',
      description: 'Precision rotary controller configuration interface.',
      url: 'https://github.com',
      tags: ['Hardware', 'WebHID'],
      imageUrl: 'preset:project-kinetix',
    },
  ],
  theme: {
    mode: 'auto',
    preset: 'obsidian-ice',
    customAccent: '',
    glassBlurPx: 22,
    glassRefractionScale: 16,
    glassSpecular: 0.36,
    hapticsEnabled: true,
    clickSparkEnabled: true,
    cardTiltEnabled: true,
  },
  cloudSync: {
    enabled: true,
    syncKey: 'ritam-profile',
    provider: 'built-in',
    customEndpointUrl: '',
    gistId: '',
  },
};

export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function isValidHexColor(hex: unknown): hex is string {
  if (typeof hex !== 'string') return false;
  return /^#([0-9a-fA-F]{6})$/.test(hex.trim());
}

export function sanitizeThemeSettings(
  partial: Partial<ThemeSettings> | undefined,
  base: ThemeSettings = DEFAULT_PORTFOLIO_CONFIG.theme
): ThemeSettings {
  if (!partial || typeof partial !== 'object') {
    return {...base};
  }

  const mode: ThemeMode =
    partial.mode === 'dark' ||
    partial.mode === 'light' ||
    partial.mode === 'auto'
      ? partial.mode
      : base.mode;

  const preset: ThemePresetId =
    partial.preset && partial.preset in THEME_PRESETS
      ? partial.preset
      : base.preset;

  const customAccent = isValidHexColor(partial.customAccent)
    ? partial.customAccent.trim()
    : partial.customAccent === ''
      ? ''
      : base.customAccent;

  return {
    mode,
    preset,
    customAccent,
    glassBlurPx: clampNumber(partial.glassBlurPx, 6, 44, base.glassBlurPx),
    glassRefractionScale: clampNumber(
      partial.glassRefractionScale,
      0,
      40,
      base.glassRefractionScale
    ),
    glassSpecular: clampNumber(
      partial.glassSpecular,
      0.08,
      0.85,
      base.glassSpecular
    ),
    hapticsEnabled:
      typeof partial.hapticsEnabled === 'boolean'
        ? partial.hapticsEnabled
        : base.hapticsEnabled,
    clickSparkEnabled:
      typeof partial.clickSparkEnabled === 'boolean'
        ? partial.clickSparkEnabled
        : base.clickSparkEnabled,
    cardTiltEnabled:
      typeof partial.cardTiltEnabled === 'boolean'
        ? partial.cardTiltEnabled
        : base.cardTiltEnabled,
  };
}

export function mergePortfolioConfig(raw: unknown): PortfolioConfig {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(DEFAULT_PORTFOLIO_CONFIG);
  }
  const src = raw as Record<string, any>;
  const def = DEFAULT_PORTFOLIO_CONFIG;

  // Handle both `socials` and legacy `channels`
  let resolvedSocials: SocialItem[] = def.socials;
  if (Array.isArray(src.socials) && src.socials.length > 0) {
    resolvedSocials = src.socials.map((s: any) => ({
      id: String(s.id || 'social'),
      label: String(s.label || 'Link'),
      handle: String(s.handle || ''),
      url: String(s.url || ''),
      icon: s.icon || 'globe',
      action: s.action === 'copy' ? 'copy' : 'external',
    }));
  } else if (Array.isArray(src.channels) && src.channels.length > 0) {
    resolvedSocials = src.channels.map((c: any) => ({
      id: String(c.id || 'channel'),
      label: String(c.label || 'Link'),
      handle: String(c.handle || ''),
      url: String(c.url || ''),
      icon: c.icon || 'globe',
      action: c.actionType === 'copy' ? 'copy' : 'external',
    }));
  }

  // Handle both `projects` (clean) and legacy projects
  let resolvedProjects: ProjectItem[] = def.projects;
  if (Array.isArray(src.projects) && src.projects.length > 0) {
    resolvedProjects = src.projects.map((p: any, idx: number) => ({
      id: String(p.id || `project-${idx + 1}`),
      title: String(p.title || `Project ${idx + 1}`),
      description: String(p.description || p.summary || ''),
      url: String(p.url || p.liveUrl || p.repoUrl || '#'),
      tags: Array.isArray(p.tags)
        ? p.tags.map(String)
        : p.techLine
          ? String(p.techLine).split('·').map((t: string) => t.trim())
          : [],
      imageUrl: p.imageUrl || p.image || def.projects[idx % def.projects.length].imageUrl,
      category: p.category || '',
      year: p.year || '',
    }));
  }

  // Handle both `audio` (clean) and legacy `media.audioTracks`
  let resolvedAudio: AudioConfig = def.audio;
  if (src.audio && typeof src.audio === 'object') {
    resolvedAudio = {
      enabled: src.audio.enabled !== false,
      title: src.audio.title || def.audio.title,
      artist: src.audio.artist || def.audio.artist,
      album: src.audio.album || def.audio.album,
      audioUrl: src.audio.audioUrl ?? def.audio.audioUrl,
      coverUrl: src.audio.coverUrl ?? def.audio.coverUrl,
      durationSec: typeof src.audio.durationSec === 'number' ? src.audio.durationSec : def.audio.durationSec,
      synthChordRootHz: typeof src.audio.synthChordRootHz === 'number' ? src.audio.synthChordRootHz : def.audio.synthChordRootHz,
    };
  } else if (Array.isArray(src.media?.audioTracks) && src.media.audioTracks[0]) {
    const t = src.media.audioTracks[0];
    resolvedAudio = {
      enabled: true,
      title: t.title || def.audio.title,
      artist: t.artist || def.audio.artist,
      album: t.album || def.audio.album,
      audioUrl: t.audioUrl ?? def.audio.audioUrl,
      coverUrl: t.coverUrl ?? def.audio.coverUrl,
      durationSec: t.durationSec || def.audio.durationSec,
      synthChordRootHz: t.synthChordRootHz || def.audio.synthChordRootHz,
    };
  }

  return {
    _watermark:
      typeof src._watermark === 'string' && src._watermark.trim()
        ? src._watermark
        : def._watermark,
    meta: {
      siteTitle: src.meta?.siteTitle || src.meta?.title || def.meta.siteTitle,
      siteDescription: src.meta?.siteDescription || src.meta?.description || def.meta.siteDescription,
    },
    profile: {
      name: src.profile?.name || def.profile.name,
      handle: src.profile?.handle || def.profile.handle,
      badge: src.profile?.badge || def.profile.badge,
      status: src.profile?.status || def.profile.status,
      bio: src.profile?.bio || def.profile.bio,
      location: src.profile?.location || def.profile.location,
      avatarUrl: src.profile?.avatarUrl ?? def.profile.avatarUrl,
      bannerUrl: src.profile?.bannerUrl ?? def.profile.bannerUrl,
      logoUrl: src.profile?.logoUrl ?? def.profile.logoUrl,
    },
    audio: resolvedAudio,
    socials: resolvedSocials,
    projects: resolvedProjects,
    theme: sanitizeThemeSettings(src.theme, def.theme),
    cloudSync: {
      enabled:
        typeof src.cloudSync?.enabled === 'boolean'
          ? src.cloudSync.enabled
          : def.cloudSync.enabled,
      syncKey:
        typeof src.cloudSync?.syncKey === 'string' &&
        src.cloudSync.syncKey.trim()
          ? src.cloudSync.syncKey.trim()
          : def.cloudSync.syncKey,
      provider:
        src.cloudSync?.provider === 'custom-endpoint' ||
        src.cloudSync?.provider === 'github-gist' ||
        src.cloudSync?.provider === 'built-in'
          ? src.cloudSync.provider
          : def.cloudSync.provider,
      customEndpointUrl:
        typeof src.cloudSync?.customEndpointUrl === 'string'
          ? src.cloudSync.customEndpointUrl.trim()
          : '',
      gistId:
        typeof src.cloudSync?.gistId === 'string'
          ? src.cloudSync.gistId.trim()
          : '',
    },
  };
}

export function resolveEffectiveDark(
  mode: ThemeMode,
  systemPrefersDark: boolean
): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return systemPrefersDark;
}

export function computeThemeCssVariables(
  theme: ThemeSettings,
  isDark: boolean
): Record<string, string> {
  const palette = THEME_PRESETS[theme.preset] || THEME_PRESETS['obsidian-ice'];
  const surface = isDark ? palette.dark : palette.light;
  const accent = isValidHexColor(theme.customAccent)
    ? theme.customAccent
    : surface.accent;

  const specularAlpha = isDark
    ? theme.glassSpecular.toFixed(2)
    : Math.min(0.96, theme.glassSpecular + 0.45).toFixed(2);

  return {
    '--canvas-bg': surface.canvasBg,
    '--canvas-secondary': surface.canvasSecondary,
    '--glass-bg': surface.glassBg,
    '--glass-bg-elevated': surface.glassElevated,
    '--accent': accent,
    '--accent-soft': isDark ? `${accent}26` : `${accent}1c`,
    '--accent-contrast': surface.accentContrast,
    '--glass-blur': `${Math.round(theme.glassBlurPx)}px`,
    '--glass-specular-top': `rgba(255, 255, 255, ${specularAlpha})`,
  };
}

export function serializeConfigForExport(config: PortfolioConfig): string {
  const cleanCopy: PortfolioConfig = {
    ...config,
    _watermark:
      config._watermark ||
      'Ritam // Signature iOS Liquid Glass Portfolio — Edit this config.json directly to customize your site without touching code.',
  };
  return JSON.stringify(cleanCopy, null, 2);
}
