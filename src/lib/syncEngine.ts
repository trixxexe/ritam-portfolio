/**
 * ====================================================================
 * @watermark Ritam // Cloud Data Synchronization & Lyric Timing Engine
 * @author Ritam (@ritam)
 * ====================================================================
 * Supports cross-device synchronization via:
 *  1. Built-in Cloud Sync API (/api/sync/:syncKey)
 *  2. Custom REST JSON Endpoint (JSONBin / Cloudflare KV / Worker)
 *  3. Public GitHub Gist JSON sync (ideal for static GitHub Pages)
 *  4. Automatic localStorage + BroadcastChannel cross-tab fallback
 */

import {
  LyricLine,
  sanitizeThemeSettings,
  ThemeSettings,
} from './configSchema';

export const RITAM_SYNC_WATERMARK = 'Ritam';

export interface AssetOverrides {
  wallpaperDarkUrl?: string;
  wallpaperLightUrl?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  logoUrl?: string;
}

export interface SyncSnapshot {
  syncKey: string;
  updatedAt: number;
  revision: number;
  themeOverrides?: Partial<ThemeSettings>;
  assetOverrides?: AssetOverrides;
  metrics: {
    views: number;
    channelClicks: Record<string, number>;
  };
}

export function sanitizeSyncKey(raw: string): string {
  const cleaned = String(raw || 'ritam-primary-space')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
  return cleaned || 'ritam-primary-space';
}

export function resolveSyncConflict(
  local: SyncSnapshot | null,
  remote: SyncSnapshot | null
): SyncSnapshot {
  if (!local && !remote) {
    return {
      syncKey: 'ritam-primary-space',
      updatedAt: 0,
      revision: 0,
      themeOverrides: {},
      assetOverrides: {},
      metrics: {views: 14820, channelClicks: {}},
    };
  }
  if (!local) return remote!;
  if (!remote) return local;

  const mergedClicks: Record<string, number> = {
    ...local.metrics.channelClicks,
  };
  for (const [k, v] of Object.entries(remote.metrics.channelClicks || {})) {
    mergedClicks[k] = Math.max(mergedClicks[k] || 0, v || 0);
  }

  const winner = remote.updatedAt >= local.updatedAt ? remote : local;

  return {
    syncKey: winner.syncKey,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    revision: Math.max(local.revision, remote.revision),
    themeOverrides: winner.themeOverrides || {},
    assetOverrides: winner.assetOverrides || {},
    metrics: {
      views: Math.max(local.metrics.views || 0, remote.metrics.views || 0),
      channelClicks: mergedClicks,
    },
  };
}

export function getActiveLyricIndex(
  lyrics: LyricLine[],
  currentTimeSec: number
): number {
  if (!Array.isArray(lyrics) || lyrics.length === 0) return -1;
  const t = Math.max(0, currentTimeSec);
  let activeIdx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (t >= lyrics[i].timeSec) {
      activeIdx = i;
    } else {
      break;
    }
  }
  return activeIdx;
}

export function formatSeconds(sec: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const LOCAL_STORAGE_PREFIX = 'ritam_cloud_sync_v1:';

export class CloudSyncClient {
  private channel: BroadcastChannel | null = null;

  constructor(onCrossTabUpdate?: (snapshot: SyncSnapshot) => void) {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('ritam_liquid_glass_sync');
        if (onCrossTabUpdate) {
          this.channel.onmessage = (ev) => {
            if (ev?.data && typeof ev.data === 'object' && ev.data.syncKey) {
              onCrossTabUpdate(ev.data as SyncSnapshot);
            }
          };
        }
      } catch {
        this.channel = null;
      }
    }
  }

  public readLocal(syncKey: string): SyncSnapshot | null {
    if (typeof window === 'undefined') return null;
    const key = sanitizeSyncKey(syncKey);
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as SyncSnapshot;
    } catch {
      return null;
    }
  }

  public writeLocal(snapshot: SyncSnapshot): void {
    if (typeof window === 'undefined') return;
    const key = sanitizeSyncKey(snapshot.syncKey);
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(snapshot));
      if (snapshot.themeOverrides?.mode) {
        localStorage.setItem('ritam_theme_mode', snapshot.themeOverrides.mode);
      }
      this.channel?.postMessage(snapshot);
    } catch {
      // Ignore storage quota issues
    }
  }

  public async pull(
    syncKey: string,
    provider: 'built-in' | 'custom-endpoint' | 'github-gist' = 'built-in',
    options?: {customEndpointUrl?: string; gistId?: string}
  ): Promise<{snapshot: SyncSnapshot; source: 'cloud' | 'local'}> {
    const cleanKey = sanitizeSyncKey(syncKey);
    const local = this.readLocal(cleanKey);

    try {
      let url = `/api/sync/${encodeURIComponent(cleanKey)}`;
      if (provider === 'custom-endpoint' && options?.customEndpointUrl) {
        url = options.customEndpointUrl;
      } else if (provider === 'github-gist' && options?.gistId) {
        url = `https://api.github.com/gists/${encodeURIComponent(options.gistId)}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {Accept: 'application/json'},
      });

      if (res.ok) {
        const payload = await res.json();
        let remoteRecord: SyncSnapshot | null = null;

        if (provider === 'github-gist' && payload?.files) {
          const firstFile = Object.values(payload.files)[0] as any;
          if (firstFile?.content) {
            const parsed = JSON.parse(firstFile.content);
            remoteRecord = {
              syncKey: cleanKey,
              updatedAt: Date.now(),
              revision: parsed.revision || 1,
              themeOverrides: parsed.theme
                ? sanitizeThemeSettings(parsed.theme)
                : parsed.themeOverrides || {},
              assetOverrides: parsed.assetOverrides || {},
              metrics: parsed.metrics || {views: 14820, channelClicks: {}},
            };
          }
        } else if (payload && typeof payload === 'object') {
          remoteRecord = {
            syncKey: cleanKey,
            updatedAt: Number(payload.updatedAt) || 0,
            revision: Number(payload.revision) || 0,
            themeOverrides: payload.themeOverrides || {},
            assetOverrides: payload.assetOverrides || {},
            metrics: payload.metrics || {views: 14820, channelClicks: {}},
          };
        }

        if (remoteRecord) {
          const merged = resolveSyncConflict(local, remoteRecord);
          this.writeLocal(merged);
          return {snapshot: merged, source: 'cloud'};
        }
      }
    } catch {
      // Static GitHub Pages or offline environment: gracefully use local cache
    }

    const fallback = resolveSyncConflict(local, null);
    fallback.syncKey = cleanKey;
    this.writeLocal(fallback);
    return {snapshot: fallback, source: 'local'};
  }

  public async push(
    snapshot: SyncSnapshot,
    provider: 'built-in' | 'custom-endpoint' | 'github-gist' = 'built-in',
    options?: {customEndpointUrl?: string}
  ): Promise<{snapshot: SyncSnapshot; syncedToCloud: boolean}> {
    const cleanKey = sanitizeSyncKey(snapshot.syncKey);
    const stamped: SyncSnapshot = {
      ...snapshot,
      syncKey: cleanKey,
      updatedAt: Date.now(),
      revision: (snapshot.revision || 0) + 1,
    };
    this.writeLocal(stamped);

    if (provider === 'github-gist') {
      // Public Gists are read-only without secret PAT; keep local + exportable
      return {snapshot: stamped, syncedToCloud: false};
    }

    const url =
      provider === 'custom-endpoint' && options?.customEndpointUrl
        ? options.customEndpointUrl
        : `/api/sync/${encodeURIComponent(cleanKey)}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(stamped),
      });
      if (res.ok) {
        const remote = (await res.json()) as SyncSnapshot;
        const merged = resolveSyncConflict(stamped, remote);
        this.writeLocal(merged);
        return {snapshot: merged, syncedToCloud: true};
      }
    } catch {
      // Offline or static host: local + BroadcastChannel already persisted
    }

    return {snapshot: stamped, syncedToCloud: false};
  }

  public async incrementMetric(
    syncKey: string,
    type: 'view' | 'channel',
    channelId?: string
  ): Promise<SyncSnapshot | null> {
    const cleanKey = sanitizeSyncKey(syncKey);
    const current =
      this.readLocal(cleanKey) || resolveSyncConflict(null, null);
    current.syncKey = cleanKey;

    if (type === 'view') {
      current.metrics.views = (current.metrics.views || 14820) + 1;
    } else if (type === 'channel' && channelId) {
      current.metrics.channelClicks[channelId] =
        (current.metrics.channelClicks[channelId] || 0) + 1;
    }
    current.updatedAt = Date.now();
    this.writeLocal(current);

    try {
      const res = await fetch(
        `/api/metrics/${encodeURIComponent(cleanKey)}/increment`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({type, channelId}),
        }
      );
      if (res.ok) {
        const remote = (await res.json()) as SyncSnapshot;
        const merged = resolveSyncConflict(current, remote);
        this.writeLocal(merged);
        return merged;
      }
    } catch {
      // Static host fallback
    }
    return current;
  }

  public dispose(): void {
    this.channel?.close();
  }
}
