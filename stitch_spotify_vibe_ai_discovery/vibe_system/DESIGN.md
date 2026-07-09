---
name: Vibe System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#53e076'
  primary: '#53e076'
  on-primary: '#003914'
  primary-container: '#1db954'
  on-primary-container: '#004118'
  inverse-primary: '#006e2d'
  secondary: '#3de96f'
  on-secondary: '#003913'
  secondary-container: '#00cc57'
  on-secondary-container: '#004f1d'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#a0a1a1'
  on-tertiary-container: '#363838'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72fe8f'
  primary-fixed-dim: '#53e076'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#69ff89'
  secondary-fixed-dim: '#34e36a'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#00531f'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 72px
  player-height: 90px
  container-padding: 24px
  card-padding: 16px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system focuses on a high-immersion, dark-mode experience that prioritizes content—specifically album art and artist imagery—over interface chrome. The brand personality is modern, rhythmic, and effortless. 

The style is **Modern Minimalism** with a focus on deep tonal layering rather than physical metaphors. It utilizes a "contained" layout where surfaces are defined by subtle value shifts in dark grays rather than borders. The goal is to create a theater-like environment where the vibrant primary accent and colorful media assets command the user's attention.

## Colors
The palette is built on a "Darkest-to-Lightest" depth model. 
- **Backgrounds:** Use `#121212` for the main application canvas. Use `#000000` for the navigation sidebar to provide a structural anchor.
- **Surfaces:** Cards reside on `#181818`. When a surface needs to feel closer to the user or indicates a hover state, it shifts to `#282828`.
- **Accents:** The primary green (`#1DB954`) is reserved for high-action elements like play buttons and progress indicators. The lighter hover green (`#1ED760`) provides immediate interactive feedback.
- **Text:** Primary information is pure white. All metadata, secondary labels, and timestamps use the muted gray (`#A7A7A7`) to maintain clear information hierarchy.

## Typography
The typography system uses **Inter** to achieve a clean, systematic look that remains legible at small sizes. 

- **Headlines:** Use Bold (700) or Extra Bold (800) weights. Larger headlines should have slightly tighter letter spacing to feel more cohesive.
- **Body:** Standardized at 14px for optimal readability against the dark background.
- **Metadata:** Use the `label-md` level for artist names, album titles in lists, and timestamps.
- **Responsive Note:** On mobile devices, `headline-lg` should scale down to 24px (`headline-md`) to ensure titles do not wrap aggressively.

## Layout & Spacing
The layout follows a **Fixed-Sidebar/Fluid-Content** model.
- **Sidebar:** A fixed 72px left-rail houses navigation and circular playlist icons. 
- **Main Canvas:** A fluid area that uses a grid of cards. The grid should adjust the number of columns based on the viewport width (e.g., 2 columns on mobile, up to 6 or 8 on widescreen).
- **Player Bar:** A fixed 90px footer that stays pinned to the bottom of the viewport. It features a 1px top border of `#282828` to separate it from the main content.
- **Rhythm:** Use a strict 8px-based spacing system for internal element alignment (8px, 16px, 24px, 32px).

## Elevation & Depth
Depth is expressed through color value rather than traditional drop shadows.
- **Level 0 (Floor):** `#121212` - The main background.
- **Level 1 (Card/Panel):** `#181818` - Used for content containers that sit on the floor.
- **Level 2 (Hover/Active):** `#282828` - Used for card hover states or floating menus.
- **Shadows:** When necessary (such as context menus), use a very soft, large-radius black shadow: `0 16px 24px rgba(0,0,0,0.5)`. 
- **Translucency:** The top navigation header should use a backdrop-filter blur with a semi-transparent black background to allow content to scroll underneath while maintaining legibility.

## Shapes
The design system uses a mix of radius styles to differentiate between content types:
- **Music/Album Cards:** Use a standard `rounded-lg` (16px) for the container, but the internal album art remains `rounded-md` (8px).
- **Pill Elements:** Search bars, action buttons, and tags use a full pill radius (999px) to contrast against the square geometry of album art.
- **Avatars/Playlists:** Circular (50% radius) icons are reserved for user profiles and the sidebar playlist shortcuts.

## Components
- **Buttons:** Primary buttons are solid Spotify Green (`#1DB954`) with white text, using a pill shape. Hover state transitions to `#1ED760`.
- **Music Cards:** Background is `#181818`. On hover, the background shifts to `#282828` and a circular green play button (`#1DB954`) transitions in from the bottom-right of the album art.
- **Search Bar:** A pill-shaped container with a `#2a2a2a` background. Text is white, and the placeholder is `#A7A7A7`.
- **Progress Bars:** Background is `#4d4d4d`. The active fill is white by default, but turns Spotify Green (`#1DB954`) when the user hovers over the player bar.
- **Sidebar Icons:** 48px x 48px circular icons with a 12px vertical margin between them.
- **Lists:** Row-based layouts for tracks. On hover, the entire row should show a `#ffffff1a` (10% white) background tint and reveal a play icon over the track number.