# Portfolio Site

A performant, motion-first portfolio site built with React 18, Vite, TypeScript, and GSAP. Demonstrates web design + motion chops through kinetic typography, scroll-driven animations, and a reusable component system.

## Features

- **Variable Font Hero** — Inter Variable weight/width/slant animation on scroll via GSAP
- **Bento Grid Layout** — Responsive CSS Grid with auto-fit for project cards
- **GSAP ScrollTrigger** — Staggered reveals, parallax depth, scroll-linked animations
- **Dark Mode** — CSS custom properties + `prefers-color-scheme` + manual toggle (persists in localStorage)
- **Reduced Motion** — Respects `prefers-reduced-motion` media query
- **Component Kit** — Reusable Button, Card, Grid, TypeScale, MotionWrapper
- **Performance** — Code splitting, lazy loading, <70KB JS / <15KB CSS gzipped
- **Lighthouse CI** — Automated performance budgets on every PR

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite + TypeScript |
| Animation | GSAP 3 (ScrollTrigger) |
| Fonts | Inter Variable (self-hosted, woff2) |
| Styling | CSS Modules + CSS Custom Properties |
| Deploy | Netlify / Vercel (static export) |
| Lint/Format | ESLint + Prettier (Airbnb TypeScript) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
cd web/site
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build

```bash
npm run build
```

Outputs to `dist/` — ready for Netlify/Vercel static deploy.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
web/
├── site/                 # Main Vite + React app
│   ├── src/
│   │   ├── components/   # Page-specific components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── About.tsx
│   │   │   └── Contact.tsx
│   │   ├── pages/        # Route pages
│   │   │   └── CaseStudy.tsx
│   │   ├── App.tsx       # Root component
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Global styles + theme tokens
│   ├── public/
│   │   └── fonts/        # Inter Variable woff2
│   ├── .github/workflows/lighthouse.yml
│   ├── lighthouse-budget.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
└── components/           # Reusable component kit (shared)
    ├── Button.tsx
    ├── Card.tsx
    ├── Grid.tsx
    ├── TypeScale.tsx
    ├── MotionWrapper.tsx
    └── index.ts
```

## Component Kit (`web/components/`)

| Component | Description |
|-----------|-------------|
| `Button` | Primary/secondary/ghost variants, 3 sizes, loading state |
| `Card` | Default/glass/elevated variants, configurable padding, hover lift |
| `Grid` | Responsive columns (base/sm/md/lg/xl), configurable gap |
| `TypeScale` | Semantic type scale (xs–6xl), weights, colors, variable font axes |
| `MotionWrapper` | GSAP ScrollTrigger wrapper + StaggerChildren + Parallax helpers |

## Theming

CSS custom properties in `src/index.css`:

```css
:root {
  --color-bg: #fafafa;
  --color-fg: #1a1a2e;
  --color-primary: #1a73e8;
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --space-md: 1rem;
  --text-xl: 1.25rem;
  --duration-base: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme="dark"] {
  --color-bg: #0a0a0f;
  --color-fg: #f0f0f5;
  --color-primary: #4d9fff;
}
```

Toggle via `ThemeToggle` component (persists in `localStorage`).

## Performance Budgets

| Metric | Budget |
|--------|--------|
| JS (gz) | < 70 KB |
| CSS (gz) | < 15 KB |
| Fonts (woff2 subset) | < 120 KB |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 90 |
| Lighthouse SEO | ≥ 90 |

## Deploy

### Netlify

1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `web/site/dist`
4. Add environment variable: `NODE_VERSION=20`

### Vercel

```bash
vercel --prod
```

Or connect repo in Vercel dashboard — auto-detects Vite.

## Fonts

Inter Variable (woff2 subset) should be placed in `public/fonts/InterVariable.woff2`.

Download from: https://github.com/rsms/inter/releases

Subset for Latin only: `pyftsubset Inter-VariableFont_wght,wdth,slnt.woff2 --unicodes="U+0020-007F,U+00A0-00FF" --output-file=InterVariable.woff2 --flavor=woff2`

## License

MIT — Fictitious brands for portfolio demonstration only.