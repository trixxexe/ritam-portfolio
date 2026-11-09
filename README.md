# Ritam — Minimalist iOS Liquid Glass Portfolio

<!-- Watermark: Ritam // Signature guns.lol style iOS Liquid Glass Portfolio -->

A minimalist, high-performance personal profile and bio hub inspired by **guns.lol** and **LastWave**, crafted with **iOS Liquid Glass** optical refraction (`SVG feDisplacementMap` + specular rims), an embedded translucent **audio player**, tactile haptic feedback, automatic dark mode, full notch/safe-area support (`100dvh`), and zero-code customization via `public/config.json`. Perfect for hosting directly on **GitHub Pages**.

---

## Zero-Code Customization (`public/config.json`)

You never need to touch TypeScript, JSX, or CSS to update your website. Everything is driven by **`public/config.json`**.

- **Edit directly on GitHub**: Open `public/config.json` in GitHub's web editor, update your name, bio, links, projects, audio, or theme, and commit.
- **Visual Theme Studio**: Click the **Customize** button on your live site to tweak themes, glass blur, optical refraction, and haptics in real time, then click **Export config.json for GitHub** to copy or save the exact JSON.

---

## Asset & Placeholder Guide

You can drop your own custom images, avatars, banners, and songs into `public/assets/`, then reference them in `public/config.json`:

| `config.json` Field | Default Value | Where It Shows | Recommended Specs | Custom Example |
| :--- | :--- | :--- | :--- | :--- |
| `profile.name` | `"Ritam"` | Profile card display name | Plain text | `"Your Name"` |
| `profile.handle` | `"@ritam"` | Handle shown below name | Plain text | `"@yourhandle"` |
| `profile.badge` | `"Developer"` | Verified badge text pill | Short string | `"Creator"` / `"Designer"` |
| `profile.status` | `"Available for projects"` | Presence status with green indicator | Short string | `"Coding next big thing"` |
| `profile.bio` | `"Building sleek web tools..."` | Bio line | 1-2 concise sentences | `"Music, code, aesthetics."` |
| `profile.bannerUrl` | `"preset:banner"` | Header banner across the top of the card | 16:9 (`1600×900`) JPG/PNG | `"./assets/my-banner.jpg"` |
| `profile.avatarUrl` | `"preset:avatar"` | Circular profile portrait with liquid glass rim | 1:1 (`800×800`) JPG/PNG | `"./assets/my-avatar.png"` |
| `profile.logoUrl` | `"./assets/custom-logo.svg"` | Glass logo pill in top-right of banner | 1:1 SVG or transparent PNG | `"./assets/logo.svg"` |
| `audio.title` | `"Velvet Refraction"` | Title of track in LastWave player | Track name | `"My Track"` |
| `audio.artist` | `"Ritam"` | Artist name in LastWave player | Artist name | `"Artist Name"` |
| `audio.audioUrl` | `""` | Music track audio file *(uses ambient synth if empty)* | `.mp3` or `.ogg` in `public/assets/` | `"./assets/song.mp3"` |
| `audio.coverUrl` | `"preset:project-audio"` | Album artwork thumbnail in player | 1:1 JPG/PNG | `"./assets/cover.jpg"` |

### Built-in Preset Shipped Assets
If you prefer not to upload your own files right away, you can use these preset strings in `public/config.json`:
- `"preset:banner"` — Minimalist Dark Titanium frosted banner
- `"preset:avatar"` — Studio portrait placeholder
- `"preset:wallpaper"` — Obsidian Liquid Glass ambient background
- `"preset:project-audio"` — Minimalist hardware audio artwork
- `"preset:project-prism"` — Optical glass refraction render
- `"preset:project-kinetix"` — Modern mechanical dial render

---

## Social Links & Projects Configuration

In `public/config.json`:

### Socials (`socials`)
```json
{
  "id": "discord",
  "label": "Discord",
  "handle": "ritam.dev",
  "url": "ritam.dev",
  "icon": "discord",
  "action": "copy"
}
```
- `action`: `"external"` opens the link in a new tab; `"copy"` copies `url` or `handle` to clipboard with haptic feedback.
- `icon`: `"github"`, `"discord"`, `"twitter"`, `"music"`, `"mail"`, `"globe"`, `"link"`.

### Projects (`projects`)
```json
{
  "id": "project-1",
  "title": "Aesthetic Tool",
  "description": "Minimalist interface for generative graphics.",
  "tags": ["React", "WebGL"],
  "url": "https://github.com",
  "imageUrl": "preset:project-prism"
}
```

---

## Deploying to GitHub Pages

1. Push this repository to your GitHub account.
2. In your GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` will automatically build and publish your site upon push.

### Local Development Commands

```bash
npm install
npm test          # Run portfolio unit tests
npm run dev       # Start local development server on port 3000
npm run build     # Compile static bundle for GitHub Pages
```
