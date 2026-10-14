# Personal Task Manager — Specification & Architecture

## 1. Project Overview
A fast, warm-minimalist personal task manager inspired by **Notion** and **Things 3**, designed for seamless use across desktop browsers and the **iPhone 12 mini** (375pt viewport).

### Key Features
- **Zero-Friction Task Entry:** Create to-dos with an optional target due date and description.
- **Manual Hand-Reordering:** Drag-and-drop sortable lists with a dedicated touch-friendly grip (`⠿`), preserving user-defined priority order rather than auto-sorting.
- **Completion Flow & Filtering:** One-tap toggle to mark tasks complete, with filter views to show active tasks or view completed history.
- **Date-Driven Scheduling:** Assign tasks to specific days (e.g. *Today*, *Tomorrow*, or any calendar date).
- **Google Calendar Integration:** Uses the task's assigned date as a direct reference to sync/share the task into Google Calendar with zero manual retyping.
- **Local-First & Offline Resilience:** All tasks and order states are stored in browser storage (`localStorage`) so the app works offline with zero latency.
- **Mobile PWA Ready:** Configured for iOS Safari ("Add to Home Screen") with notch safe-area handling (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).

---

## 2. Code Structure

```text
personal-task-manager/
├── index.html                   # HTML entry point, PWA meta tags, viewport configuration
├── vite.config.ts               # Vite build tool configuration
├── tailwind.config.js           # Warm paper Notion color tokens and custom utilities
├── tsconfig.json                # TypeScript compiler settings
├── package.json                 # Project dependencies & scripts
├── SPEC.md                      # This architecture and specification document
└── src/
    ├── types/
    │   └── task.ts              # Core data types (Task, FilterType, NewTaskInput)
    ├── lib/
    │   ├── storage.ts           # Local-first persistence helper (load, save, reorder)
    │   ├── dateUtils.ts         # Human-friendly date formatting (Today, Tomorrow, Past Due)
    │   └── googleCalendar.ts    # Google Calendar event URL generator and intent handler
    ├── hooks/
    │   └── useTasks.ts          # Central React hook managing task operations and state
    ├── components/
    │   ├── TaskInput.tsx        # Inline input bar with date picker shortcut
    │   ├── TaskItem.tsx         # Draggable task row with checkbox, date badge, & calendar sync
    │   ├── TaskList.tsx         # Sortable container using @dnd-kit
    │   ├── FilterTabs.tsx       # View filter selector (All Active, Today, Completed)
    │   └── Header.tsx           # Notion-style minimal header with stats and theme accent
    ├── App.tsx                  # Main responsive shell (desktop & mobile-optimized)
    ├── index.css                # Base styling, Tailwind directives, safe-area padding
    └── main.tsx                 # React entry point
```

---

## 3. Data Specification (`src/types/task.ts`)

Each task object follows a strict TypeScript model:

```typescript
export interface Task {
  id: string;              // Unique identifier (UUID / timestamp)
  title: string;           // Task description/name
  completed: boolean;      // Completed status flag
  order: number;           // Explicit manual sorting position index
  dueDate?: string;        // ISO format YYYY-MM-DD (e.g., '2026-10-15')
  dueTime?: string;        // Optional time in 24h format HH:mm (e.g., '14:30')
  notes?: string;          // Optional sub-text or notes
  createdAt: string;       // ISO timestamp
  completedAt?: string;    // ISO timestamp when finished
}

export type FilterView = 'active' | 'today' | 'upcoming' | 'completed';
```

---

## 4. Google Calendar Integration Logic (`src/lib/googleCalendar.ts`)

The date attached to each task serves as the anchor for Google Calendar:
1. **Target Date Reference:**
   - If a task has a `dueDate` (e.g., `2026-10-15`), the sync utility formats start and end time parameters in ISO UTC format (`YYYYMMDD` or `YYYYMMDDTHHmmssZ`).
   - If no specific time is chosen, an all-day event is generated.
2. **Intent URL Generation:**
   Constructs a Google Calendar web intent:
   ```text
   https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={notes}
   ```
3. **Execution on iPhone & Desktop:**
   - On desktop: Opens in a clean new tab ready to save into Google Calendar.
   - On iPhone 12 mini: Directs to the native Google Calendar app via iOS universal linking with one tap.

---

## 5. Design & Color System (Notion Warm Minimalism)

- **Canvas Backgrounds:**
  - Light: `#FBFBFA` / `#FFFFFF` (Warm Paper)
  - Dark: `#191919` / `#222222` (Charcoal Slate)
- **Ink / Typography:**
  - Primary text: `#37352F` (Near-black ink)
  - Secondary / Muted: `#787774` (Warm gray for dates and icons)
  - Notion Blue: `#2383E2` (Active highlights and primary interactions)
- **Ergonomics for iPhone 12 Mini (375pt Viewport):**
  - Minimum touch target: `44px` height on interactive controls.
  - Drag handle restricted to `⠿` icon with `touch-action: none` to prevent interfering with iOS scrolling.
  - Bottom padding respects `env(safe-area-inset-bottom)`.
