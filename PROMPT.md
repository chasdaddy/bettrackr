# BetTrackr — Project Context Prompt

You are working on **BetTrackr**, a sports betting tracker web app. It lets users log bets, track performance stats, visualize P/L over time, manage their bankroll, and track "gut calls" (bets they considered but didn't place). The app has a cyberpunk dark theme with neon green/blue/gold accents.

---

## Tech Stack

- **Frontend**: React 18 (no TypeScript, no routing library, single-page with tab navigation)
- **Backend**: Supabase (auth + PostgreSQL database)
- **Build**: Vite 5
- **Charts**: recharts 3.x
- **Styling**: Inline JavaScript style objects only — no CSS modules, no Tailwind, no styled-components. All shared styles live in `src/lib/styles.js`.
- **Font**: JetBrains Mono / Fira Code monospace
- **Deployment**: Netlify (connected to GitHub, env vars set in Netlify dashboard)

## Environment Variables

Stored in `.env` (gitignored), and must also be set in Netlify:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key

Read via `import.meta.env.VITE_SUPABASE_URL` etc.

---

## Supabase Database Schema

### `bets` table
| Column   | Type    | Notes                                      |
|----------|---------|--------------------------------------------|
| id       | uuid    | Primary key, auto-generated                |
| user_id  | uuid    | References auth.users                      |
| sport    | text    | One of: NBA, NFL, MLB, NHL, UFC, Soccer, Tennis, NCAAB, NCAAF, Other |
| event    | text    | e.g. "Lakers vs Celtics"                   |
| pick     | text    | e.g. "Lakers -3.5"                         |
| odds     | numeric | American odds (e.g. -110, +150)            |
| stake    | numeric | Amount wagered in dollars                  |
| result   | text    | 'pending', 'win', 'loss', or 'push'        |
| payout   | numeric | Total payout (stake + profit) for wins, 0 for losses |
| date     | date    | Date bet was placed (YYYY-MM-DD)           |

### `gut_calls` table
| Column          | Type    | Notes                                |
|-----------------|---------|--------------------------------------|
| id              | uuid    | Primary key, auto-generated          |
| user_id         | uuid    | References auth.users                |
| event           | text    | Event considered                     |
| pick            | text    | Pick considered                      |
| odds            | numeric | American odds                        |
| potential_stake | numeric | How much they would have bet         |
| date            | date    | Date considered                      |
| actual_result   | text    | 'won' or 'lost' (null if unresolved) |
| would_have_won  | numeric | Payout they would have received      |

---

## File Structure

```
bettrackr/
├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .gitignore                    # node_modules, dist, .env, .env.local, .DS_Store
├── index.html                    # Vite entry point
├── package.json                  # react, react-dom, @supabase/supabase-js, recharts
├── vite.config.js                # plugins: [react()]
├── src/
│   ├── main.jsx                  # ReactDOM.createRoot, renders <App />
│   ├── index.css                 # Reset, scrollbar styles, @keyframes spin/pulse
│   ├── App.jsx                   # ~150-line orchestrator (state, auth, data loading, tabs)
│   ├── lib/
│   │   ├── supabase.js           # createClient(import.meta.env.VITE_SUPABASE_URL, ...)
│   │   ├── odds.js               # calculatePayout(odds, stake, result) — American odds math
│   │   └── styles.js             # COLORS, SPORT_OPTIONS, containerStyle, inputStyle, thStyle, tdStyle, miniBtn, gradientButtonStyle, cancelButtonStyle
│   └── components/
│       ├── Auth.jsx              # Login/signup screen (owns auth form state locally)
│       ├── Layout.jsx            # Header (logo + streak + logout) + tab nav + children
│       ├── Dashboard.jsx         # Stats grid, bankroll card, chart slots, psych hooks, empty state
│       ├── BetsList.jsx          # Bet table with pagination, add form, W/L/P buttons, edit/delete
│       ├── BetForm.jsx           # Presentational: new bet form (sport, event, pick, odds, stake, result)
│       ├── BetEditModal.jsx      # Modal overlay for editing a bet's sport/event/pick/odds/stake
│       ├── GutCalls.jsx          # Gut calls tab: add form, card list, resolve buttons
│       ├── GutCallForm.jsx       # Presentational: new gut call form
│       ├── Insights.jsx          # Sport breakdown table, fav/dog stats, chart slot
│       ├── ShareCard.jsx         # Screenshot-ready share card with stats
│       ├── StatCard.jsx          # Reusable stat display card with colored top border
│       ├── PLChart.jsx           # Cumulative P/L line chart (neon green, recharts)
│       ├── SportBreakdownChart.jsx # P/L by sport bar chart (green/red bars, recharts)
│       ├── BankrollChart.jsx     # Bankroll over time line chart (gold, recharts)
│       ├── LoadingSpinner.jsx    # FullPageSpinner + InlineSpinner (CSS animation)
│       └── Toast.jsx             # Fixed-position auto-dismiss toast (4s, error/success)
```

---

## Architecture & State Management

### App.jsx — The Orchestrator

App.jsx owns all shared state and passes it down as props. There is no context, no Redux, no state management library.

**State owned by App.jsx:**
- `user` — Supabase auth user object (null when logged out)
- `loading` — true until initial auth check completes
- `activeTab` — string: 'dashboard' | 'bets' | 'gut calls' | 'insights' | 'share'
- `bets` — array of bet objects from Supabase, ordered by date descending
- `gutCalls` — array of gut call objects from Supabase, ordered by date descending
- `toast` — `{ message, type }` or null (type is 'error' or 'success')
- `editingBet` — bet object or null (controls BetEditModal visibility)
- `startingBankroll` — number, initialized from `localStorage.getItem('bettrackr_bankroll')`, persisted via `localStorage.setItem`

**Computed values derived in App.jsx (passed as `stats` object):**
- `completedBets` — bets filtered to exclude 'pending'
- `totalBets`, `wins`, `losses`, `winRate`, `totalStaked`, `totalPayout`, `profit`, `roi`
- `streakInfo` — `{ streak: number, type: 'win'|'loss' }` from most recent consecutive results
- `bestSport` — `{ sport: string, profit: number }` sport with highest profit
- `whatIfBestSportOnly` — profit if user only bet their best sport
- `totalMissedMoney` — sum of `would_have_won` from gut calls that hit

**Auth flow:**
1. On mount: `supabase.auth.getSession()` checks for existing session
2. `supabase.auth.onAuthStateChange()` listener updates `user` on login/logout
3. If `!user`: render `<Auth />` (login/signup screen)
4. If `user`: render `<Layout>` with active tab content

**Data loading:**
- On `user` change: fetch all bets and gut calls for that user from Supabase
- Errors trigger toast notifications

### Component Responsibilities

**Auth.jsx** — Fully self-contained. Owns `authMode`, `authEmail`, `authPassword`, `authError`. Calls `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()` directly.

**Layout.jsx** — Pure layout wrapper. Receives `activeTab`, `setActiveTab`, `streakInfo`, `onLogout`, `children`. Renders header with gradient logo, streak badge (fire/ice emoji), logout button, and 5 tab buttons.

**Dashboard.jsx** — Receives `stats`, `bets`, `completedBets`, `startingBankroll`, `setStartingBankroll`, plus chart components as props (`plChart`, `bankrollChart`). Contains:
- 5 StatCards: Total P/L, Win Rate, Total Wagered, Best Sport, Bankroll
- Bankroll card has inline edit mode (input + SET button, shows "Stored on this device")
- PLChart slot (renders when 2+ completed bets)
- BankrollChart slot (renders when bankroll > 0 and 2+ completed bets)
- Two "psychological hook" cards: "You're leaving money on the table" and "Your gut was right"
- Empty state with "LOG YOUR FIRST BET" button

**BetsList.jsx** — Owns `showForm`, `newBet`, `page` state. Contains:
- "+ LOG NEW BET" button that shows `<BetForm />`
- `addBet()` — validates, calculates payout via `calculatePayout()`, inserts to Supabase, prepends to bets array
- `updateBetResult()` — W/L/P buttons in table, recalculates payout, updates Supabase
- `deleteBet()` — `window.confirm()`, then deletes from Supabase and filters from state
- Bet table with 9 columns: DATE, SPORT, EVENT, PICK, ODDS, STAKE, RESULT, P/L, ACTIONS
- ACTIONS column: EDIT button (calls `onEditBet` prop) and DEL button
- Client-side pagination: 20 bets per page, PREV/NEXT buttons, page counter

**BetEditModal.jsx** — Fixed overlay modal. Owns local `form` state initialized from the bet being edited. Edits sport, event, pick, odds, stake. On save: recalculates payout based on current result, updates Supabase, calls `onSave` callback, closes. Backdrop click closes.

**GutCalls.jsx** — Owns `showForm`, `newGutCall` state. Contains:
- Header explaining gut calls concept
- "+ LOG GUT CALL" button that shows `<GutCallForm />`
- `addGutCall()` — inserts to Supabase, prepends to gutCalls array
- `resolveGutCall(id, won)` — calculates `wouldHaveWon` via `calculatePayout()`, updates Supabase
- Card list showing each gut call with IT HIT/IT MISSED buttons (or resolved state)

**Insights.jsx** — Requires 5+ completed bets to render (otherwise shows "Need more data" empty state). Contains:
- SportBreakdownChart slot (passed as component prop)
- Sport-by-sport table: wins-losses and profit per sport
- Favorites vs Underdogs analysis: win rate and profit for negative vs positive odds

**ShareCard.jsx** — Screenshot-optimized card with gradient border glow. Shows P/L, win rate, record, ROI, current streak. Footer says "bettrackr.io".

**Chart Components (all use recharts):**
- `PLChart` — `<LineChart>` with cumulative P/L. Sorts bets by date ascending, accumulates profit. Green line (#00ff88), dark tooltip, no grid.
- `SportBreakdownChart` — `<BarChart>` with profit per sport. Green cells for positive, red for negative. Sorted by profit descending.
- `BankrollChart` — `<LineChart>` with balance over time. Gold line (#ffd700), dashed `<ReferenceLine>` at starting bankroll.

All charts share styling: `#333` axes, `#666` tick text, dark (#1a1a2e) tooltip background, monospace font, no grid lines.

---

## Design System

### Theme Colors (from `COLORS` in styles.js)
- **Green** `#00ff88` — wins, profit, primary accent, gradient start
- **Red** `#ff4444` — losses, errors, delete actions
- **Blue** `#00d4ff` — win rate, secondary accent, gradient end, edit actions
- **Gold** `#ffd700` — bankroll, wagered amounts, ROI
- **Pink** `#ff88ff` — best sport stat
- **Teal** `#00c896` — sport breakdown section
- **Purple** `#aa88ff` — gut calls gradient end

### Background Hierarchy
- Page: `linear-gradient(135deg, #0a0a0f, #1a1a2e, #0f0f1a)`
- Cards: `rgba(0, 0, 0, 0.4)`
- Inputs: `rgba(0, 0, 0, 0.5)`
- Table rows: transparent with `#222` border-bottom
- Modals: `#1a1a2e` solid with `rgba(0,0,0,0.8)` backdrop

### Text Hierarchy
- Primary: `#e0e0e0`
- Muted: `#aaa`
- Dim: `#888`
- Dimmer: `#666`
- Dimmest: `#555`

### Interactive Elements
- Primary buttons: `linear-gradient(90deg, #00ff88, #00d4ff)` with black text
- Cancel buttons: transparent with `#444` border, `#888` text
- Mini buttons (W/L/P, EDIT, DEL): transparent with colored border, small text
- Tab buttons: transparent (inactive) or `rgba(0, 255, 136, 0.15)` (active) with green border
- All buttons: `fontFamily: 'inherit'`, uppercase text, `cursor: pointer`

### Patterns
- StatCards have a 2px colored top border accent
- Section cards use low-opacity background tint matching their accent color (e.g. `rgba(255, 215, 0, 0.05)` for gold sections)
- Borders are typically `#333` (muted) or `#222` (subtle)
- Letter-spacing on labels: 1-3px
- Font sizes: labels 0.7rem, body 0.85rem, headings 1.2rem+, stat values 1.8rem

---

## Payout Calculation (American Odds)

`calculatePayout(odds, stake, result)` in `src/lib/odds.js`:
- If result is not 'win', returns 0
- Positive odds (underdog): `stake + (stake * odds / 100)` — e.g. +150 on $100 = $250 total
- Negative odds (favorite): `stake + (stake * 100 / |odds|)` — e.g. -110 on $110 = $210 total
- Returns **total payout** (stake + profit), not just profit

---

## Key Design Decisions

1. **No routing library** — Tab navigation via `activeTab` string state. Simple enough that React Router would be overhead.
2. **Inline styles only** — Matches original codebase. All shared styles extracted to `styles.js`. No CSS-in-JS library.
3. **No state management library** — Props-down pattern. App.jsx is the single source of truth. Form state stays local to form components.
4. **Bankroll in localStorage** — Not in Supabase. Avoids database migration. Trade-off: doesn't sync across devices. UI shows "Stored on this device".
5. **Client-side pagination** — All bets fetched at once. Simple `Array.slice()` pagination. Server-side `.range()` can be added later if needed.
6. **Charts as component props** — Dashboard and Insights receive chart components as props (`plChart`, `bankrollChart`, `sportBreakdownChart`). This keeps chart imports in App.jsx and allows easy swapping/removal.
7. **Delete uses native confirm()** — `window.confirm('Delete this bet?')` instead of building another custom modal.
8. **Toast for all errors** — Every Supabase operation that can fail shows a toast notification. Auto-dismisses after 4 seconds.
9. **Optimistic-ish updates** — After Supabase confirms success, local state is updated immediately (not a full refetch).

---

## Sport Options

Defined in `SPORT_OPTIONS` array in `styles.js`:
`NBA, NFL, MLB, NHL, UFC, Soccer, Tennis, NCAAB, NCAAF, Other`

Used in BetForm and BetEditModal sport dropdowns.

---

