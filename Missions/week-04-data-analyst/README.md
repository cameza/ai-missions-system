<div align="center">

# Transfer Hub — Week 04 Data Analyst (Soft Launch Foundation)

Dark-mode-first football transfer tracker built with the M4 tech stack.

</div>

## 🧱 Tech Stack

- Next.js 16.1 (App Router, Server Components)
- TypeScript (strict mode)
- Tailwind CSS v4 with custom dark palette
- shadcn/ui component primitives
- ESLint 9 + Prettier

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open <http://localhost:3000> to view the development build.

## 🗂 Project Structure

```
src/
  app/           # App Router entrypoints + layouts
  components/    # Reusable UI building blocks
  components/ui  # shadcn/ui exports
  components/features # Feature-specific composites
  hooks/
  lib/
  utils/
  styles/
```

## 🎨 Theming

- Default dark mode across the entire app
- Tailwind tokens:
  - `background`: `#0B0B15`
  - `surface`: `#12121A`
  - `primary`: `#8B5CF6`
  - `secondary`: `#2563EB`
  - `accent`: `#00FF88`
- Fonts: Chakra Petch (headings), Inter (body)

## ✅ Acceptance Checklist

- [x] Next.js 14+ project initialized
- [x] Tailwind CSS configured with custom palette
- [x] TypeScript strict mode enabled
- [x] ESLint + Prettier configured
- [x] shadcn/ui installed (`components.json` present)
- [x] Custom fonts wired through `next/font`
- [x] Git repo initialized
- [x] Dev server verified (`npm run dev`)

## 📄 Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Start local dev server     |
| `npm run build`| Create production build    |
| `npm run start`| Run built app              |
| `npm run lint` | Run ESLint with Next rules |

## 🔖 Labels

`setup` · `foundation` · `phase-0-setup`
