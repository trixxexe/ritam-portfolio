/**
 * ====================================================================
 * @watermark Ritam // Cloud Sync & Vite Full-Stack Server
 * @author Ritam (@ritam)
 * ====================================================================
 * Provides cross-device JSON state synchronization (/api/sync/:syncKey)
 * and visitor/channel telemetry while serving Vite in dev or dist/ in prod.
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const RITAM_SERVER_WATERMARK = 'Ritam';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SyncedRecord {
  syncKey: string;
  updatedAt: number;
  revision: number;
  themeOverrides?: Record<string, unknown>;
  assetOverrides?: Record<string, unknown>;
  metrics: {
    views: number;
    channelClicks: Record<string, number>;
  };
}

interface SyncStoreData {
  records: Record<string, SyncedRecord>;
}

const STORAGE_FILE = path.resolve(
  process.cwd(),
  process.env.SYNC_STORAGE_PATH || '.data/cloud-sync.json'
);

function sanitizeKey(raw: string): string {
  const cleaned = String(raw || 'ritam-default')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .slice(0, 64);
  return cleaned || 'ritam-default';
}

function loadStore(): SyncStoreData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
      if (parsed && typeof parsed === 'object' && parsed.records) {
        return parsed as SyncStoreData;
      }
    }
  } catch {
    // Fallback to clean in-memory state if file is unreadable
  }
  return {records: {}};
}

function saveStore(store: SyncStoreData): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Keep serving from memory even on read-only filesystems
  }
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const store = loadStore();

  app.use(express.json({limit: '256kb'}));

  app.get('/api/health', (_req, res) => {
    res.json({ok: true, watermark: RITAM_SERVER_WATERMARK});
  });

  app.get('/api/sync/:syncKey', (req, res) => {
    const key = sanitizeKey(req.params.syncKey);
    const existing = store.records[key] || {
      syncKey: key,
      updatedAt: 0,
      revision: 0,
      themeOverrides: {},
      assetOverrides: {},
      metrics: {
        views: 14820,
        channelClicks: {},
      },
    };
    res.json(existing);
  });

  app.put('/api/sync/:syncKey', (req, res) => {
    const key = sanitizeKey(req.params.syncKey);
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const prev = store.records[key] || {
      syncKey: key,
      updatedAt: 0,
      revision: 0,
      themeOverrides: {},
      assetOverrides: {},
      metrics: {
        views: 14820,
        channelClicks: {},
      },
    };

    const incomingTheme =
      body.themeOverrides && typeof body.themeOverrides === 'object'
        ? (body.themeOverrides as Record<string, unknown>)
        : prev.themeOverrides;

    const incomingAssets =
      body.assetOverrides && typeof body.assetOverrides === 'object'
        ? (body.assetOverrides as Record<string, unknown>)
        : prev.assetOverrides;

    const incomingClicks =
      body.metrics &&
      typeof body.metrics === 'object' &&
      body.metrics.channelClicks &&
      typeof body.metrics.channelClicks === 'object'
        ? {...prev.metrics.channelClicks, ...body.metrics.channelClicks}
        : prev.metrics.channelClicks;

    const nextRecord: SyncedRecord = {
      syncKey: key,
      updatedAt: Date.now(),
      revision: prev.revision + 1,
      themeOverrides: incomingTheme,
      assetOverrides: incomingAssets,
      metrics: {
        views:
          typeof body.metrics?.views === 'number'
            ? Math.max(prev.metrics.views, body.metrics.views)
            : prev.metrics.views,
        channelClicks: incomingClicks,
      },
    };

    store.records[key] = nextRecord;
    saveStore(store);
    res.json(nextRecord);
  });

  app.post('/api/metrics/:syncKey/increment', (req, res) => {
    const key = sanitizeKey(req.params.syncKey);
    const prev = store.records[key] || {
      syncKey: key,
      updatedAt: Date.now(),
      revision: 0,
      themeOverrides: {},
      assetOverrides: {},
      metrics: {
        views: 14820,
        channelClicks: {},
      },
    };

    const type = req.body?.type;
    const channelId =
      typeof req.body?.channelId === 'string'
        ? req.body.channelId.slice(0, 48)
        : '';

    if (type === 'view') {
      prev.metrics.views += 1;
    } else if (type === 'channel' && channelId) {
      prev.metrics.channelClicks[channelId] =
        (prev.metrics.channelClicks[channelId] || 0) + 1;
    }
    prev.updatedAt = Date.now();
    store.records[key] = prev;
    saveStore(store);
    res.json(prev);
  });

  const isProdServer =
    process.env.NODE_ENV === 'production' ||
    (process.argv[1] && process.argv[1].endsWith('server.js'));

  if (!isProdServer) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Ritam Portfolio] Listening on http://0.0.0.0:${port}`);
  });
}

startServer();
