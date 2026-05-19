# KANBAN 3.0 — Full Auto

## Infrastructure

- **GitHub Repo:** https://github.com/hissel98/KANBAN_3.0_FULLAUTO.git
- **Vercel:** Auto-deploys on every push to `main`
- **Supabase:** Database + Auth (credentials in Vercel env vars + .env.local)
- **Domain:** https://www.dasistmeinetest.space/
- **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Supabase + Playwright
- **Build Output:** `standalone` (Server Actions + SSR möglich)

## Current Status

### Implemented
- [x] Next.js boilerplate with shadcn/ui
- [x] Supabase clients (browser + server)
- [x] Vercel connected + auto-deploy
- [x] Auth: Login/Signup with Supabase Auth (email/password + Google OAuth)
- [x] Dashboard: Protected route with Multi-Board support (create, rename, delete)
- [x] Kanban Board: DnD cards between columns (@dnd-kit)
- [x] Column CRUD: Create, rename, delete columns + card counts
- [x] Cards: Create, edit, delete with modal + detail view
- [x] Apple-inspired design polish + Mobile responsiveness
- [x] Playwright E2E Tests: local dev server, global auth setup
- [x] CI: GitHub Actions — E2E Tests bei Push/PR + täglich 08:00

### E2E Test Suites
| Suite | Tests | Status |
|-------|-------|--------|
| `boards.spec.ts` | create, rename, delete | restored |
| `columns.spec.ts` | create, rename, delete | restored |
| `cards.spec.ts` | create, edit, delete, drag | OK |
| `kanban-page.ts` | Page Object Model | OK (hook fix) |
| `global-setup.ts` | Auth-Seed vor Tests | OK |

### Quality Fixes Applied
- ESLint: `dist/` und `android/` ignoriert
- TypeScript: `type` imports für `Card as CardType`, `Column as ColumnType`
- React Hooks: `useCallback` für loadData, cleanup-Funktionen in `useEffect`
- Playwright: `webServer` config mit `npm run dev` für lokale Tests

## Planned / Next Steps
- [ ] Google OAuth in Production verifizieren (Domain-Callback)
- [ ] Middleware für auth redirects (`/login` wenn nicht authed)
- [ ] Column reorder (Drag & Drop Spalten)
- [ ] Dark Mode
- [ ] Performance: React.memo / Virtualisierung bei vielen Karten

## Color Scheme

- Accent Yellow: #ecad0a
- Blue Primary: #209dd7
- Purple Secondary: #753991
- Dark Navy: #032147
- Gray Text: #888888
