# Standard Tech Stack

This document defines the standard technology stack used across all AI missions. Consistency in tooling enables faster development, easier maintenance, and better collaboration.

---

## Overview

**Philosophy:** Use modern, production-ready tools that are:
- Well-documented and widely adopted
- Easy to deploy (Vercel-friendly)
- Type-safe and developer-friendly
- Accessible and performant by default

---

## Frontend Stack

### Core Framework

#### React 18+
**Why:** Industry standard, excellent ecosystem, concurrent features, great TypeScript support

**Key Features:**
- Concurrent rendering
- Automatic batching
- Suspense for data fetching
- Server Components (future)

**Resources:**
- Docs: https://react.dev/
- TypeScript: https://react-typescript-cheatsheet.netlify.app/

### Build Tool

#### Vite
**Why:** Lightning-fast dev server, optimized production builds, excellent DX

**Key Features:**
- Instant HMR (Hot Module Replacement)
- Native ES modules
- Optimized production builds
- Plugin ecosystem

**Configuration:**
```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Resources:**
- Docs: https://vitejs.dev/
- Plugins: https://vitejs.dev/plugins/

### Language

#### TypeScript (Strict Mode)
**Why:** Type safety, better IDE support, catch errors early, self-documenting code

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Resources:**
- Docs: https://www.typescriptlang.org/
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/

---

## Styling

### Tailwind CSS
**Why:** Utility-first, highly customizable, excellent DX, small production bundle

**Configuration:**
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      fontFamily: {
        // Custom fonts
      },
    },
  },
  plugins: [],
}
```

**Best Practices:**
- Use Tailwind utilities for most styling
- Create custom components for repeated patterns
- Use `@apply` sparingly (prefer composition)
- Leverage Tailwind's design tokens

**Resources:**
- Docs: https://tailwindcss.com/
- UI Patterns: https://tailwindui.com/

### UI Components (Optional)

#### shadcn/ui
**Why:** Accessible, customizable, copy-paste components, built on Radix UI

**When to Use:**
- Complex UI needs (dropdowns, dialogs, tooltips)
- Need accessible components out of the box
- Want to customize component code

**Installation:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
```

**Resources:**
- Docs: https://ui.shadcn.com/
- Components: https://ui.shadcn.com/docs/components

### Icons

#### Lucide React
**Why:** Beautiful icons, tree-shakeable, TypeScript support, consistent style

**Usage:**
```typescript
import { Plus, Trash2, Edit } from 'lucide-react'

<Plus className="w-4 h-4" />
```

**Resources:**
- Icons: https://lucide.dev/icons/
- React: https://lucide.dev/guide/packages/lucide-react

---

## Forms & Validation

### React Hook Form
**Why:** Performant, minimal re-renders, great DX, TypeScript support

**Usage:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})
```

**Resources:**
- Docs: https://react-hook-form.com/
- Examples: https://react-hook-form.com/get-started

### Zod
**Why:** TypeScript-first schema validation, type inference, composable

**Usage:**
```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
})

type FormData = z.infer<typeof schema>
```

**Resources:**
- Docs: https://zod.dev/
- Recipes: https://zod.dev/?id=recipes

---

## State Management

### Context API (Simple Apps)
**Why:** Built-in, no dependencies, good for simple state

**When to Use:**
- Small to medium apps
- Infrequent state updates
- Simple state structure

**Usage:**
```typescript
const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState)
  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  )
}
```

### Zustand (Complex Apps)
**Why:** Simple API, minimal boilerplate, great TypeScript support, middleware

**When to Use:**
- Complex state logic
- Frequent state updates
- Need persistence or devtools

**Usage:**
```typescript
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface AppState {
  items: Item[]
  addItem: (item: Item) => void
}

const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        addItem: (item) => set((state) => ({ 
          items: [...state.items, item] 
        })),
      }),
      { name: 'app-storage' }
    )
  )
)
```

**Resources:**
- Docs: https://github.com/pmndrs/zustand
- Recipes: https://docs.pmnd.rs/zustand/guides/typescript

---

## Routing

### React Router (Multi-Page Apps)
**Why:** Industry standard, powerful, type-safe with TypeScript

**When to Use:**
- Multiple distinct pages/views
- Need URL-based navigation
- SEO considerations

**Usage:**
```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
])

<RouterProvider router={router} />
```

**Resources:**
- Docs: https://reactrouter.com/
- Tutorial: https://reactrouter.com/en/main/start/tutorial

### Single Page (Simple Apps)
**Why:** Simpler, faster, less overhead

**When to Use:**
- Single view or simple navigation
- No SEO requirements
- State-based view switching

---

## Backend & APIs

### Vercel Serverless Functions
**Why:** Zero config, auto-scaling, integrated with frontend deployment

**When to Use:**
- Need backend API endpoints
- Server-side processing
- Third-party API proxying

**Usage:**
```typescript
// api/hello.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: 'Hello World' })
}
```

**Resources:**
- Docs: https://vercel.com/docs/functions

### tRPC (Optional)
**Why:** End-to-end type safety, no code generation, great DX

**When to Use:**
- Full-stack TypeScript
- Need type-safe APIs
- Complex API requirements

**Resources:**
- Docs: https://trpc.io/

---

## Database & Storage

### Supabase (Primary Choice)
**Why:** PostgreSQL, real-time, auth, storage, generous free tier

**Features:**
- PostgreSQL database
- Real-time subscriptions
- Authentication
- File storage
- Row Level Security

**Usage:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Query data
const { data, error } = await supabase
  .from('items')
  .select('*')
```

**Resources:**
- Docs: https://supabase.com/docs
- Client: https://supabase.com/docs/reference/javascript

### Firebase (Alternative)
**Why:** Google-backed, real-time, auth, hosting

**When to Use:**
- Need Google ecosystem integration
- Prefer NoSQL (Firestore)
- Need Firebase-specific features

**Resources:**
- Docs: https://firebase.google.com/docs

### localStorage (Client-Only Apps)
**Why:** Simple, no backend needed, instant

**When to Use:**
- Single-user apps
- No sync requirements
- Simple data structures

**Usage:**
```typescript
// Save
localStorage.setItem('key', JSON.stringify(data))

// Load
const data = JSON.parse(localStorage.getItem('key') || '{}')
```

**Best Practices:**
- Always handle JSON parse errors
- Implement versioning for data structure changes
- Monitor quota (typically 5-10MB)
- Consider encryption for sensitive data

---

## Development Tools

### Package Manager

#### pnpm
**Why:** Fast, disk-efficient, strict dependency resolution

**Commands:**
```bash
pnpm install          # Install dependencies
pnpm add <package>    # Add dependency
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
```

**Resources:**
- Docs: https://pnpm.io/

### Code Quality

#### ESLint
**Why:** Catch errors, enforce code style, customizable

**Configuration:**
```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
}
```

#### Prettier
**Why:** Consistent formatting, no debates, auto-fix

**Configuration:**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

#### Husky + lint-staged (Optional)
**Why:** Run linters on commit, prevent bad code from being committed

**Setup:**
```bash
pnpm add -D husky lint-staged
npx husky init
```

**Resources:**
- ESLint: https://eslint.org/
- Prettier: https://prettier.io/
- Husky: https://typicode.github.io/husky/

---

## Testing

### Vitest (Unit & Component Tests)
**Why:** Vite-native, fast, Jest-compatible API

**Usage:**
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

**Resources:**
- Docs: https://vitest.dev/
- Testing Library: https://testing-library.com/react

### Playwright (E2E Tests)
**Why:** Cross-browser, reliable, great DX

**When to Use:**
- Critical user journeys
- Cross-browser testing
- Complex interactions

**Resources:**
- Docs: https://playwright.dev/

---

## Deployment

### Vercel
**Why:** Zero-config, automatic deployments, edge network, great DX

**Features:**
- Automatic deployments from Git
- Preview deployments for PRs
- Environment variables
- Edge functions
- Analytics
- Web Vitals monitoring

**Setup:**
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Configuration:**
```json
// vercel.json (optional)
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

**Resources:**
- Docs: https://vercel.com/docs
- CLI: https://vercel.com/docs/cli

---

## Environment Variables

### Development (.env.local)
```bash
# API Keys
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Feature Flags
VITE_ENABLE_ANALYTICS=false

# API Endpoints
VITE_API_URL=http://localhost:3000
```

### Production (Vercel Dashboard)
- Set via Vercel dashboard or CLI
- Never commit secrets to Git
- Use different values for production

**Best Practices:**
- Prefix with `VITE_` for client-side access
- Use different keys for dev/prod
- Document all required variables
- Provide fallback values where appropriate

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Lazy load heavy components
const Chart = lazy(() => import('./components/Chart'))
```

### Image Optimization
- Use WebP format with PNG/JPG fallback
- Lazy load images below the fold
- Use appropriate sizes for different viewports
- Consider using a CDN

### Bundle Analysis
```bash
# Analyze bundle size
pnpm add -D vite-bundle-visualizer
```

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance Score: > 90
- Bundle Size: < 500KB (initial)

---

## Accessibility

### Standards
- WCAG 2.1 AA compliance minimum
- Semantic HTML
- Keyboard navigation
- Screen reader support

### Tools
- axe DevTools (browser extension)
- Lighthouse accessibility audit
- WAVE (browser extension)
- Screen readers (VoiceOver, NVDA)

### Best Practices
- Use semantic HTML elements
- Provide alt text for images
- Ensure color contrast (4.5:1 for text)
- Make all interactive elements keyboard accessible
- Use ARIA labels appropriately
- Test with keyboard only
- Test with screen reader

---

## Security

### Best Practices
- Never commit API keys or secrets
- Use environment variables
- Validate all user input (client + server)
- Sanitize data before rendering
- Use HTTPS only (Vercel default)
- Implement CORS properly
- Keep dependencies updated
- Use Content Security Policy

### Tools
- npm audit (check for vulnerabilities)
- Dependabot (automated updates)
- Snyk (security scanning)

---

## Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Vue Plugin (Volar)** - Better TypeScript support
- **Error Lens** - Inline error display
- **GitLens** - Git supercharged
- **Auto Rename Tag** - Rename paired HTML tags
- **Path Intellisense** - File path autocomplete

---

## Quick Start Template

```bash
# Create new project
npm create vite@latest my-app -- --template react-ts
cd my-app

# Install dependencies
pnpm install

# Add Tailwind
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Add common dependencies
pnpm add react-router-dom zustand zod react-hook-form @hookform/resolvers/zod lucide-react

# Add dev dependencies
pnpm add -D @types/node

# Start dev server
pnpm dev
```

---

## Resources

### Official Documentation
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- Vercel: https://vercel.com/docs

### Learning Resources
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/
- Tailwind UI: https://tailwindui.com/
- Web.dev: https://web.dev/
- MDN: https://developer.mozilla.org/

### Community
- React Discord: https://discord.gg/react
- Tailwind Discord: https://discord.gg/tailwindcss
- TypeScript Discord: https://discord.gg/typescript

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-09 | 1.0 | Initial tech stack definition |

---

## Notes

This tech stack is designed to be:
- **Modern** - Using current best practices and tools
- **Production-ready** - Battle-tested in real applications
- **Developer-friendly** - Great DX with TypeScript and tooling
- **Performant** - Optimized for speed and bundle size
- **Accessible** - Built with accessibility in mind
- **Deployable** - Easy to deploy to Vercel

Adjust as needed for specific mission requirements, but maintain consistency where possible.
