# RUHOR — brand guidelines

## Idea

**Pillar · Arch · Strut.** The R monogram is built from the three elements that make a structure
stand: a vertical pillar (load), an arch (the bowl) and a diagonal strut (bracing). The strut is the
only coloured part, a "Kiln" orange brace. The arch also comes from RUHOR's signature work: granite
setts laid in segmental fans. The same arc becomes the brand pattern and the arch-shaped photo
windows on the website.

## Logo files (`/brand`)

| File | Use |
|---|---|
| `logo-full-light.svg` | Wordmark on light backgrounds (ink letters, kiln strut) |
| `logo-full-dark.svg` | Wordmark on dark backgrounds (stone letters, kiln strut) |
| `logo-full-mono-ink.svg` / `-mono-stone.svg` | One-colour use: stamps, engraving, single-colour print |
| `icon-light.svg` / `icon-dark.svg` | R monogram alone (avatars, small spaces) |
| `icon-tile.svg` | App icon / favicon: stone R on an ink tile |
| `pattern-fan-tile.svg` | Fan-paving pattern tile (backgrounds, print) |
| `brand-board-preview.png` | Overview for review only |

Generated from `src/brand/logo.ts` with `npm run brand` (also writes favicons and `og.jpg`).

**Construction:** cap height 48 units, stroke 10, true circular arcs. Letter spacing 12 units
(10 next to the round O). **Clear space:** at least the stroke width × 2 (20 units) on every side.
**Minimum size:** wordmark 72 px / 18 mm wide; monogram 16 px (use the tile version below 24 px).

Don't recolour the strut in anything but Kiln (or the mono colour), add effects or shadows,
stretch the logo, or set "RUHOR" in a font instead of using the drawn wordmark.

## Colour

| Token | Hex | Role |
|---|---|---|
| Ink | `#131518` | Primary dark, text on light |
| Basalt | `#1C1F23` | Dark surfaces (cards, form) |
| Iron | `#2A2E34` | Dark lines, footer signature |
| Concrete | `#5A5F66` | Secondary text on light (5.6 : 1 on Stone) |
| Ash | `#9CA1A8` | Secondary text on dark (7.0 : 1 on Ink) |
| Stone | `#F2F0EB` | Primary light background |
| Plaster | `#E7E3DB` | Alternate light background |
| Line | `#D6D1C7` | Hairlines on light |
| **Kiln** | `#E0592A` | The one accent: CTAs, strut, focus rings |
| Kiln Deep | `#B5441B` | Accent text on light (4.8 : 1) |
| Kiln Soft | `#F07A4A` | Accent text on dark (6.6 : 1) |

Kiln buttons use **Ink text** (4.9 : 1). Never put small Stone text on Kiln (3.3 : 1).
Keep orange rare, roughly one accent per screen.

## Typography

- **Geologica** (variable, 100–900): headings and body. Latin, Latin Extended (Czech, German) and Cyrillic (Ukrainian).
  Display 500 weight, tracking −0.045em; headings 500; body 400.
- **IBM Plex Mono** 500: labels, numbers, drawing-sheet annotations, uppercase with +0.1em tracking.
- Fluid scale (360 → 1920 px): display 44 → 124 px · H2 32 → 76 px · H3 22 → 34 px · body 16–17 px.

## Spacing & layout

4-px base. Gutter 16 → 64 px, section padding 88 → 176 px, 12-column grid, max content width 1520 px.

## Components

- **Buttons:** square corners (2 px), 56 px tall (44 px small). Primary: Kiln with Ink text. Ghost: 1 px hairline.
  On hover a fill rises from the bottom and the label rolls up.
- **Cards / frames:** no shadows, no rounded corners; photos sit in plain frames; hairline dividers.
- **Labels:** "01 —— SECTION" in mono, like sheet numbers on a construction drawing.

## Motion

One easing everywhere, `cubic-bezier(0.16, 1, 0.3, 1)`. Durations 0.25 / 0.5 / 0.9 s.
Only transform, opacity and clip-path are animated. Shapes morph (logo blocks → R, arch → full frame,
stage pictograms). Reduced-motion users get the final state without movement.
