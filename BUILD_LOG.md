# BetTrackr — Full Build Log

## What Was Done

Refactored a 1184-line monolithic `App.jsx` into a modular component architecture and added 4 major features: charts, bankroll management, bet editing/deletion, and UI polish.

---

## Phase 1: Foundation & Refactor

### Problem
The entire app lived in a single `App.jsx` file with hardcoded Supabase credentials, duplicated payout calculation logic (3 places), and all state/UI interleaved.

### What Changed

**Created shared libraries (`src/lib/`):**
- `supabase.js` — Supabase client reading from `import.meta.env` instead of hardcoded credentials. Credentials moved to `.env` (already in `.gitignore`).
- `odds.js` — Single `calculatePayout(odds, stake, result)` function replacing 3 duplicated payout calculation blocks (in `addBet`, `updateBetResult`, and `resolveGutCall`).
- `styles.js` — Extracted all shared style objects (`containerStyle`, `inputStyle`, `thStyle`, `tdStyle`, `miniBtn`) plus new constants: `COLORS` object (all theme colors), `SPORT_OPTIONS` array, `gradientButtonStyle`, `cancelButtonStyle`.

**Extracted 16 components (`src/components/`):**
- `Auth.jsx` — Login/signup screen. Owns its own `authMode`, `authEmail`, `authPassword`, `authError` state locally. Talks to Supabase auth directly.
- `Layout.jsx` — Header (logo + streak badge + logout) and nav tabs. Receives `children` to render active tab content.
- `Dashboard.jsx` — Stats grid (P/L, win rate, wagered, best sport, bankroll), chart slots, psychological hooks ("leaving money on the table", "your gut was right"), and empty state with CTA.
- `BetsList.jsx` — Bet table with pagination (20/page), inline add-bet form, W/L/P result buttons, edit/delete actions. Owns `showForm`, `newBet`, `page` state locally.
- `BetForm.jsx` — Presentational form component for adding new bets. Receives state and callbacks as props.
- `BetEditModal.jsx` — Modal overlay for editing existing bets (sport, event, pick, odds, stake). Recalculates payout on save. Uses `window.confirm()` pattern for closing.
- `GutCalls.jsx` — Gut calls tab with add form and card list. Owns `showForm`, `newGutCall` state locally. Resolving a gut call uses `calculatePayout` from odds.js.
- `GutCallForm.jsx` — Presentational form for adding gut calls.
- `Insights.jsx` — Sport breakdown table and favorites vs underdogs analysis. Accepts `sportBreakdownChart` as a component prop for chart injection.
- `ShareCard.jsx` — Screenshot-ready share card showing P/L, win rate, record, ROI, streak.
- `StatCard.jsx` — Reusable stat display card with colored top border accent.
- `PLChart.jsx` — Cumulative P/L line chart (recharts). Neon green line, dark tooltip, no grid lines.
- `SportBreakdownChart.jsx` — P/L by sport bar chart. Green bars for profitable sports, red for losing.
- `BankrollChart.jsx` — Bankroll over time line chart. Gold line with dashed reference line at starting bankroll.
- `LoadingSpinner.jsx` — Exports `FullPageSpinner` (full-page with CSS animation) and `InlineSpinner` (small inline). Uses `@keyframes spin` from index.css.
- `Toast.jsx` — Fixed-position auto-dismissing toast (4 second timeout). Supports `error` (red) and `success` (green) types. Fade-out animation.

**Rewrote `App.jsx` (~150 lines):**
- Slim orchestrator that owns: `user`, `loading`, `activeTab`, `bets`, `gutCalls`, `toast`, `editingBet`, `startingBankroll`
- Auth gating: shows `FullPageSpinner` while loading, `Auth` when logged out, `Layout` when logged in
- Data loading: fetches bets and gut calls on user login, with error handling via toast
- Computed stats: all stat calculations (P/L, win rate, ROI, streak, best sport, what-if, missed money) derived from state
- Tab switching: renders active tab component with appropriate props

**Updated `index.css`:**
- Added `@keyframes spin` for loading spinner rotation
- Added `@keyframes pulse` for future use

---

## Phase 2: Charts (recharts)

### New Dependency
`recharts` — React charting library. Only new dependency added.

### Components Created
- **PLChart** — Cumulative P/L line chart. Sorts bets by date ascending, accumulates profit/loss. Neon green (#00ff88) line, dark themed tooltip matching app style. Only renders with 2+ completed bets.
- **SportBreakdownChart** — Bar chart showing profit by sport. Green bars for profitable sports, red for losing. Sorted by profit descending. Injected into Insights tab above the existing sport table.
- **BankrollChart** — Bankroll balance over time. Gold (#ffd700) line with dashed reference line at starting bankroll amount. Only renders when bankroll > 0 and 2+ completed bets.

### Integration
- PLChart and BankrollChart are passed as component props to Dashboard (rendered between stat cards and psych hooks)
- SportBreakdownChart is passed as component prop to Insights (rendered above sport table)
- Chart styling: dark backgrounds, #333 axes, #666 tick text, no grid lines, themed tooltips

---

## Phase 3: Bankroll Management

### How It Works
- `startingBankroll` state lives in App.jsx, initialized from `localStorage.getItem('bettrackr_bankroll')`
- `persistBankroll()` function updates both React state and localStorage
- Dashboard shows a BANKROLL StatCard that displays current balance (starting + profit)
- When bankroll is 0 or user clicks "edit", an inline input appears to set the value
- Shows "Stored on this device" note so users know it's local-only
- BankrollChart renders below PLChart when bankroll > 0

### Design Decision
Bankroll is stored in localStorage, not Supabase. This avoids needing a database migration and keeps it simple. Trade-off: bankroll doesn't sync across devices.

---

## Phase 4: Bet Editing & Deletion

### Edit Flow
1. User clicks EDIT button in the ACTIONS column of the bet table
2. `BetEditModal` opens as a fixed overlay with backdrop click to close
3. Modal pre-fills with current bet data (sport, event, pick, odds, stake)
4. On save: recalculates payout based on current result, updates Supabase, updates local state optimistically
5. Modal closes automatically on successful save

### Delete Flow
1. User clicks DEL button in the ACTIONS column
2. Native `window.confirm()` dialog asks for confirmation
3. On confirm: deletes from Supabase, removes from local state optimistically
4. On error: shows toast notification

### Wiring
- `onEditBet` callback passed from App.jsx to BetsList (sets `editingBet` state)
- `BetEditModal` rendered in App.jsx (above tab content) when `editingBet` is not null
- `handleEditSave` in App.jsx updates the bets array with the edited bet
- `deleteBet` lives in BetsList, directly calls Supabase and updates local state via `setBets`

---

## Phase 5: Polish

### Pagination
- BetsList displays 20 bets per page (constant `BETS_PER_PAGE = 20`)
- Client-side pagination using `Array.slice()`
- PREV/NEXT buttons with page counter ("1 / 3")
- Buttons disable at boundaries (first/last page)
- Page resets when bets array changes

### Toast Notifications
- All Supabase error paths across BetForm, BetsList, BetEditModal, GutCallForm, GutCalls now call `showToast(error.message, 'error')`
- Data loading errors in App.jsx also show toasts
- Toast auto-dismisses after 4 seconds with fade-out animation

### Security
- Hardcoded Supabase URL and anon key removed from source code
- Credentials moved to `.env` file (which is in `.gitignore`)
- `src/lib/supabase.js` reads from `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`

---

## Final File Tree
```
src/
  lib/
    supabase.js
    odds.js
    styles.js
  components/
    Auth.jsx
    Layout.jsx
    Dashboard.jsx
    BetsList.jsx
    BetForm.jsx
    BetEditModal.jsx
    GutCalls.jsx
    GutCallForm.jsx
    Insights.jsx
    ShareCard.jsx
    StatCard.jsx
    PLChart.jsx
    SportBreakdownChart.jsx
    BankrollChart.jsx
    LoadingSpinner.jsx
    Toast.jsx
  App.jsx
  main.jsx
  index.css
.env
```

## State Architecture
```
App.jsx (orchestrator)
├── user, loading          — auth state
├── activeTab              — navigation
├── bets, gutCalls         — data (from Supabase)
├── startingBankroll       — from localStorage
├── toast                  — { message, type } or null
├── editingBet             — bet object or null
│
├── Dashboard              — reads stats, renders charts
│   └── StatCard (x5)      — presentational
│   └── PLChart            — reads bets
│   └── BankrollChart      — reads bets + startingBankroll
│
├── BetsList               — owns showForm, newBet, page
│   └── BetForm            — presentational
│
├── BetEditModal           — owns form state
│
├── GutCalls               — owns showForm, newGutCall
│   └── GutCallForm        — presentational
│
├── Insights               — derived from completedBets
│   └── SportBreakdownChart
│
└── ShareCard              — reads stats
```

## Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@supabase/supabase-js": "^2.39.0",
  "recharts": "^2.x"
}
```

## Netlify Deployment Notes
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify Site Settings > Environment Variables
- Build command: `npm run build` (or `vite build`)
- Publish directory: `dist`
