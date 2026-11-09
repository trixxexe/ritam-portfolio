/**
 * ====================================================================
 * @watermark Ritam // Unit Tests (node:test)
 * @author Ritam (@ritam)
 * ====================================================================
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeThemeCssVariables,
  DEFAULT_PORTFOLIO_CONFIG,
  mergePortfolioConfig,
  resolveEffectiveDark,
  RITAM_SCHEMA_WATERMARK,
  sanitizeThemeSettings,
  serializeConfigForExport,
} from './configSchema';
import {
  formatSeconds,
  getActiveLyricIndex,
  resolveSyncConflict,
  sanitizeSyncKey,
} from './syncEngine';

test('Ritam watermark is embedded in schema and default config', () => {
  assert.equal(RITAM_SCHEMA_WATERMARK, 'Ritam');
  assert.ok(DEFAULT_PORTFOLIO_CONFIG._watermark.includes('Ritam'));
  assert.equal(DEFAULT_PORTFOLIO_CONFIG.profile.name, 'Ritam');
});

test('sanitizeThemeSettings clamps out-of-range glass values and validates hex colors', () => {
  const sanitized = sanitizeThemeSettings({
    mode: 'light',
    preset: 'titanium-amber',
    customAccent: 'not-a-color',
    glassBlurPx: 999,
    glassRefractionScale: -12,
    glassSpecular: 5,
  });

  assert.equal(sanitized.mode, 'light');
  assert.equal(sanitized.preset, 'titanium-amber');
  assert.equal(sanitized.glassBlurPx, 44);
  assert.equal(sanitized.glassRefractionScale, 0);
  assert.equal(sanitized.glassSpecular, 0.85);
  assert.equal(sanitized.customAccent, '');

  const withValidHex = sanitizeThemeSettings({customAccent: '#38BDF8'});
  assert.equal(withValidHex.customAccent, '#38BDF8');
});

test('mergePortfolioConfig safely merges partial user config.json overrides', () => {
  const merged = mergePortfolioConfig({
    profile: {
      name: 'Ritam Ghosh',
      handle: '@ritam_ghosh',
    },
    theme: {
      preset: 'midnight-cobalt',
      glassBlurPx: 28,
    },
  });

  assert.equal(merged.profile.name, 'Ritam Ghosh');
  assert.equal(merged.profile.handle, '@ritam_ghosh');
  assert.equal(merged.profile.location, DEFAULT_PORTFOLIO_CONFIG.profile.location);
  assert.equal(merged.theme.preset, 'midnight-cobalt');
  assert.equal(merged.theme.glassBlurPx, 28);
  assert.ok(merged.projects.length >= 3);
});

test('resolveEffectiveDark and computeThemeCssVariables handle auto, dark, and light modes', () => {
  assert.equal(resolveEffectiveDark('auto', true), true);
  assert.equal(resolveEffectiveDark('auto', false), false);
  assert.equal(resolveEffectiveDark('dark', false), true);
  assert.equal(resolveEffectiveDark('light', true), false);

  const darkVars = computeThemeCssVariables(DEFAULT_PORTFOLIO_CONFIG.theme, true);
  const lightVars = computeThemeCssVariables(DEFAULT_PORTFOLIO_CONFIG.theme, false);

  assert.equal(darkVars['--canvas-bg'], '#07090e');
  assert.equal(lightVars['--canvas-bg'], '#f3f5fa');
  assert.equal(darkVars['--glass-blur'], '22px');
});

test('sync conflict resolution preserves newest timestamp and max metrics', () => {
  const local = {
    syncKey: 'ritam-space',
    updatedAt: 1000,
    revision: 2,
    themeOverrides: {preset: 'obsidian-ice' as const},
    metrics: {views: 15000, channelClicks: {github: 5, discord: 2}},
  };
  const remote = {
    syncKey: 'ritam-space',
    updatedAt: 2000,
    revision: 3,
    themeOverrides: {preset: 'pearl-quartz' as const},
    metrics: {views: 14900, channelClicks: {github: 3, discord: 9}},
  };

  const resolved = resolveSyncConflict(local, remote);
  assert.equal(resolved.themeOverrides?.preset, 'pearl-quartz');
  assert.equal(resolved.metrics.views, 15000);
  assert.equal(resolved.metrics.channelClicks.github, 5);
  assert.equal(resolved.metrics.channelClicks.discord, 9);
});

test('lyric timestamp lookup and time formatting are accurate', () => {
  const lyrics = [
    {timeSec: 0, line: 'Intro'},
    {timeSec: 8, line: 'Verse 1'},
    {timeSec: 18, line: 'Chorus'},
  ];
  assert.equal(getActiveLyricIndex(lyrics, 0), 0);
  assert.equal(getActiveLyricIndex(lyrics, 7.9), 0);
  assert.equal(getActiveLyricIndex(lyrics, 8), 1);
  assert.equal(getActiveLyricIndex(lyrics, 25), 2);
  assert.equal(formatSeconds(65), '01:05');
  assert.equal(sanitizeSyncKey('  Ritam Space #1! '), 'ritam-space-1');

  const exported = JSON.parse(serializeConfigForExport(DEFAULT_PORTFOLIO_CONFIG));
  assert.equal(exported.profile.name, 'Ritam');
});
