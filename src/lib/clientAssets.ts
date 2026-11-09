/**
 * ====================================================================
 * @watermark Ritam // Bundled High-Resolution Asset Registry
 * @author Ritam (@ritam)
 * ====================================================================
 * Maps semantic `preset:*` tokens in public/config.json to Vite-bundled
 * studio assets while supporting any user-supplied `./assets/...` or
 * external URLs for GitHub Pages deployment.
 */
import wallpaperDarkImg from '../assets/images/wallpaper_dark_liquid_1793813260519.jpg';
import bannerHeaderImg from '../assets/images/banner_profile_header_1793813261192.jpg';
import avatarPortraitImg from '../assets/images/avatar_ritam_portrait_1793813263884.jpg';
import projectVeloxImg from '../assets/images/project_velox_audio_1793813265361.jpg';
import projectPrismImg from '../assets/images/project_prism_shader_1793813266864.jpg';
import projectKinetixImg from '../assets/images/project_kinetix_os_1793813269179.jpg';

export const RITAM_ASSETS_WATERMARK = 'Ritam';

export const PRESET_ASSETS: Record<string, string> = {
  'preset:wallpaper': wallpaperDarkImg,
  'preset:banner': bannerHeaderImg,
  'preset:avatar': avatarPortraitImg,
  'preset:project-audio': projectVeloxImg,
  'preset:project-prism': projectPrismImg,
  'preset:project-kinetix': projectKinetixImg,
};

export function resolveAssetUrl(rawPath: string | undefined | null): string {
  if (!rawPath || typeof rawPath !== 'string') return '';
  const trimmed = rawPath.trim();
  if (!trimmed) return '';

  if (trimmed in PRESET_ASSETS) {
    return PRESET_ASSETS[trimmed];
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const base = import.meta.env.BASE_URL || './';
  if (trimmed.startsWith('./')) {
    const cleanRel = trimmed.slice(2);
    return base.endsWith('/') ? `${base}${cleanRel}` : `${base}/${cleanRel}`;
  }
  if (trimmed.startsWith('/')) {
    const cleanRel = trimmed.slice(1);
    return base.endsWith('/') ? `${base}${cleanRel}` : `${base}/${cleanRel}`;
  }

  return trimmed;
}
