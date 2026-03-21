# Design System Specification: Terminal-Noir Protocol

## 1. Overview & Creative North Star
### Creative North Star: "The Underground Architect"
This design system rejects the "clean-and-safe" aesthetics of modern SaaS in favor of a high-fidelity, terminal-native experience. It is designed to feel like a high-end command center—where Portuguese coding culture meets a "hacker-elite" cyberpunk reality. We prioritize technical precision, intentional asymmetry, and "rebellious" high-contrast typography over standard grid layouts. 

The experience must feel like a specialized tool: professional enough for serious engineering, but gritty enough to maintain its underground soul. We achieve this by blending ultra-clean UI elements (à la Linear) with the raw, data-dense energy of a Warp terminal.

---

## 2. Colors
Our palette is rooted in the "void"—a deepest-black foundation that allows neon primary accents to vibrate.

### The Foundation
- **Background**: `#0e0e0e` (The Primary Void)
- **Surface**: `#0e0e0e` (Base Layer)
- **Surface Container (Lowest to Highest)**: `#000000` (In-set depth) → `#131313` → `#1a1919` → `#201f1f` → `#262626` (Floating depth).

### Neon Accents (The "Energy" Tokens)
- **Primary (Neon Green)**: `#a1ffc2` — Use for success states, terminal prompts, and active missions.
- **Secondary (Neon Purple)**: `#d873ff` — Use for branding, "ultra-rare" badges, and community highlights.
- **Tertiary (Neon Blue)**: `#81e9ff` — Use for data-readouts, links, and system info.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for structural sectioning. Boundaries must be defined by:
1.  **Background Shifts**: A `surface-container-low` section sitting against a `surface` background.
2.  **Tonal Transitions**: Moving from a `#0e0e0e` background to a `#1a1919` container to define an area.
3.  **Neon Glows**: Using a 1px inner-glow (using `primary` at 20% opacity) instead of a solid line to define focus.

### The "Glass & Gradient" Rule
Floating elements (modals, dropdowns) must use **Glassmorphism**. Apply a `surface-container-high` color with a 12px-20px backdrop-blur. For main CTAs, use a subtle linear gradient from `primary` to `primary-container` to create a "liquid light" effect that feels premium rather than flat.

---

## 3. Typography
We utilize a dual-font strategy: **Space Grotesk** for high-impact brand statements and **Inter** for functional UI, supplemented by monospace for all technical data.

- **Display (Space Grotesk)**: Used for hero headlines and "Mission" titles. High-contrast sizing (up to 3.5rem) creates an editorial, high-end feel.
- **Title & Body (Inter)**: The workhorse for UI labels, descriptions, and navigation. Clean, legible, and "standard" to provide a professional anchor to the rebellious display type.
- **Label (Monospace/Space Grotesk)**: All numbers, status codes, and "Intel Reports" must be rendered in a monospace-feeling style to reinforce the terminal-native aesthetic.

---

## 4. Elevation & Depth
In this system, depth is not simulated with shadows; it is built with **Tonal Layering**.

- **The Layering Principle**: Treat the UI as stacked sheets of obsidian. Place a `surface-container-lowest` (#000000) card on a `surface-container-low` (#131313) section to create a "sunken" terminal window effect.
- **Ambient Shadows**: Shadows are only permitted for "Floating" elements (Modals/Popovers). They must be ultra-diffused: `blur: 40px`, `opacity: 8%`, using a tinted version of the `primary` color to simulate neon light spill.
- **The "Ghost Border" Fallback**: If a container needs an edge for accessibility, use the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.
- **Signature Scanlines**: Apply a `0.05` opacity repeating linear-gradient overlay on the `surface` layer to mimic CRT-monitor textures, giving the UI a "physical" hardware feel.

---

## 5. Components

### Buttons
- **Primary**: Neon Green (`primary`) background, black text. No border. On hover, apply a `0 0 15px` outer glow using the `primary` color.
- **Secondary (The Hacker Variant)**: Ghost border (`primary` at 20%) with monospace text. On hover, the border becomes 100% opaque and the text shifts to the primary color.
- **Tertiary**: Underlined monospace text. No background.

### Cards & Lists
- **Rule**: Divider lines are forbidden.
- **Separation**: Use `spacing: 8 (1.75rem)` to separate content blocks. 
- **Header**: Use a small "Status Indicator" (a 4px neon circle) next to titles to indicate activity.
- **Hover State**: Cards should shift background from `surface-container` to `surface-bright` and reveal a subtle `primary` neon top-border (2px).

### Input Fields
- **Terminal Style**: Inputs must look like terminal prompts. Use a `surface-container-lowest` background with a monospace caret. 
- **Focus**: When active, the entire input container gains a 1px `tertiary` (Neon Blue) glow.

### Stats & Numbers
- All numeric data (XP, Rank, Latency) must use monospace formatting.
- **Data Glow**: High-value stats should have a subtle outer glow in the corresponding accent color.

---

## 6. Do's and Don'ts

### Do
- **Do** use intentional asymmetry. Align titles to the left and status metadata to the far right.
- **Do** use "Protocol" language: Instead of "Loading," use `SYSTEM_INITIALIZING...`. Instead of "Error," use `THREAT_DETECTED`.
- **Do** use the spacing scale strictly to create a sense of "Air" between dense technical data.

### Don't
- **Don't** use rounded corners above `xl (0.75rem)`. This system prefers the "sharp" precision of `sm (0.125rem)` or `md (0.375rem)`.
- **Don't** use generic icons. Use sharp, thin-stroke SVG icons that look like technical schematics.
- **Don't** use "AI Slop" or soft gradients. Every gradient must feel like light reflecting off a dark surface, not a colorful cloud.
- **Don't** use standard blue/grey colors for system messages. Use the `secondary` (Purple) or `tertiary` (Blue) neons to keep the "underground" vibe alive.