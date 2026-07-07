# Phase 5 — UI/UX & Dashboards

**Goal:** Make Job Reels look like a professional job board. Polish homepage, navigation, responsiveness, and all dashboard views.

## Tasks

### 1. Design system & global styles

**`app/globals.css`** — Tailwind CSS v4 with custom theme:
- Color palette (blues, grays, accent color)
- Typography scale
- Spacing system
- Custom component classes for cards, buttons, inputs

**Shared UI components (`components/ui/`):**
- `Button` — variants: primary, secondary, outline, ghost; sizes: sm, md, lg
- `Input` — text inputs with labels, error states
- `Select` — dropdown selects
- `Badge` — status/category badges
- `Card` — content card wrapper
- `Modal` — dialog overlay
- `Skeleton` — loading placeholders
- `EmptyState` — illustration + message for empty lists
- `Pagination` — page navigation
- `Toast` / `Notification` — success/error messages

### 2. Navigation & layout

**`app/layout.tsx`** — global layout:
- **Header**: Logo "Job Reels", nav links (Find Jobs, Companies), auth buttons (Sign In / UserButton), role-aware dashboard link
- Role-aware: Seekers see "My Applications", Employers see "Dashboard"
- Mobile hamburger menu
- Footer: links, copyright, branding

**`app/(main)/layout.tsx`** — main content layout with sidebar for authenticated views

### 3. Homepage (`app/page.tsx`)

Hero section:
- Large search bar with category quick-select
- Tagline: "Find your next opportunity"
- Background image/gradient

Featured jobs section:
- 4-6 featured job cards in a grid
- "View all jobs" link

Categories section:
- Grid of category cards with icons
- Each links to `/jobs?category=slug`

CTA section:
- For employers: "Post a job and find talent"
- For seekers: "Create your profile and get discovered"

### 4. Job listing page (`app/jobs/page.tsx`)

- Search bar at top (persists search query)
- Filter sidebar (desktop) / filter drawer (mobile):
  - Employment type checkboxes
  - Location type checkboxes
  - Category dropdown
  - Salary range slider
  - Skills input
- Results grid with pagination
- Sort: newest first, salary high-low, relevance
- "No results" empty state

### 5. Seeker dashboard (`app/dashboard/seeker/`)

Layout with sidebar nav:
- Overview — stats card: applications sent, saved jobs, profile views
- My Applications — table/list with status filters
- Saved Jobs — grid of bookmarked jobs
- Profile — view/edit profile form
- Settings — account preferences

### 6. Employer dashboard (`app/dashboard/employer/`)

Layout with sidebar nav:
- Overview — stats: active jobs, total applicants, new applications today
- My Jobs — table of all jobs with status, application count, actions
- Post a Job — link to job creation form
- Applications — filtered by job
- Company Profile — edit company info
- Settings — account settings

### 7. Company page (`app/companies/[slug]/page.tsx`)

- Company header: logo, name, description, website, size, industry
- Active jobs list from this company
- "About" section with full description

### 8. Responsive design

- Mobile-first approach throughout
- Breakpoints: sm (640), md (768), lg (1024), xl (1280)
- Touch-friendly interactions (larger tap targets)
- Slide-in filters on mobile instead of sidebar

### 9. Loading & empty states

- Skeleton components for all data-fetching views
- Empty state illustrations with helpful messages
- "No jobs found — try different keywords"
- "No applications yet — start applying!"
- "No saved jobs — save jobs you're interested in"

### 10. Error handling

- Error boundaries on dashboard sections
- Toast notifications for mutation success/failure
- Form validation errors inline
- 404 page for invalid job/company IDs

## Deliverables
- Professional UI matching Indeed-level quality
- Responsive design (mobile + desktop)
- Complete navigation system with role awareness
- Loading skeletons & empty states
- Error handling & toast notifications
- All dashboard layouts

## Files to create/modify
- `app/globals.css` (complete rewrite)
- `app/layout.tsx` (update with header + footer)
- `app/(main)/layout.tsx` (new)
- `app/page.tsx` (complete rewrite — homepage)
- `app/dashboard/seeker/layout.tsx` (new)
- `app/dashboard/seeker/page.tsx` (new)
- `app/dashboard/employer/layout.tsx` (new)
- `app/dashboard/employer/page.tsx` (new)
- `app/companies/[slug]/page.tsx` (new)
- `components/ui/` — Button, Input, Select, Badge, Card, Modal, Skeleton, EmptyState, Pagination, Toast
- `components/Header.tsx` (new)
- `components/Footer.tsx` (new)
- `components/Sidebar.tsx` (new)
