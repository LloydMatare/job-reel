# Phase 6 — Advanced Features

**Goal:** Production-ready enhancements: notifications, job alerts, admin panel, company pages, salary filtering.

## Tasks

### 1. Email notifications

**Convex actions for sending emails:**
- Use Convex actions with `fetch()` to call an email API (Resend, SendGrid, or similar)
- Define environment variables in `convex/convex.config.ts` for the API key

**Notification events:**
- Application submitted → email to employer ("New applicant for {job title}")
- Status changed → email to seeker ("Your application has been {status}")
- Job posted → confirmation to employer
- Profile incomplete → reminder to complete onboarding

**`convex/notifications.ts`:**
- `sendApplicationNotification` — notifies employer of new application
- `sendStatusNotification` — notifies seeker of status change
- `sendJobAlert` — batch email to seekers with matching saved searches

### 2. Job alerts / saved searches

**`convex/job_alerts.ts`:**
- New table `job_alerts`: userId, keywords, filters (type, category, location, salary), frequency (daily|weekly), lastSent
- `createJobAlert` / `deleteJobAlert` — mutations
- `getMyAlerts` — query

**Cron job:**
- Daily/weekly cron in `convex/crons.ts` that runs saved searches and sends email digests
- `sendJobAlertsCron` — batch process all active alerts

**UI:**
- "Create alert" button on search results page
- Alert management in dashboard settings
- Frequency selector (daily/weekly)

### 3. Admin panel

**`convex/admin.ts`:**
- Admin check: user has `role: "admin"` in users table
- `getAllUsers` — list all users (paginated)
- `getAllCompanies` — list all companies
- `getSiteStats` — total users, jobs, applications, companies
- `deleteJob` — force delete any job
- `banUser` — suspend a user

**UI (`app/admin/`):**
- Protected by middleware + admin role check
- Dashboard with site-wide statistics
- Users management table (search, view, ban)
- Jobs management table (view, remove)
- Companies management table

### 4. Company pages

**`app/companies/[slug]/page.tsx`** (enhance from Phase 5):
- All active jobs listed with search/filter
- Company reviews/rating (future — placeholder section)
- "Follow company" button (future — placeholder)

**`app/companies/page.tsx`:**
- Browse all companies
- Search by name, industry, location
- Alphabetical or by most jobs

### 5. Salary range filtering

- Slider component for salary range
- Min/max salary inputs
- Preset ranges: $0-50k, $50-100k, $100-150k, $150k+
- Currency selector if supporting multiple currencies

### 6. Job recommendations (bonus)

- Simple recommendation: jobs in same category as user's recent applications/saves
- Display in homepage "Recommended for you" section
- Only for authenticated seekers

### 7. Application analytics for employers

- Chart: applications over time (last 7/30 days)
- Breakdown by status
- Average time to review
- Source tracking (direct vs search vs alert)

## Deliverables
- Email notifications for application/status events
- Job alerts/saved searches with cron delivery
- Admin panel with user/job/company management
- Company browsing page
- Salary range filter slider
- Job recommendations (basic)
- Application analytics for employers

## Files to create/modify
- `convex/notifications.ts` (new)
- `convex/job_alerts.ts` (new)
- `convex/admin.ts` (new)
- `convex/crons.ts` (new — cron jobs)
- `convex/convex.config.ts` (new — typed env vars)
- `app/admin/page.tsx` (new)
- `app/admin/users/page.tsx` (new)
- `app/admin/jobs/page.tsx` (new)
- `app/companies/page.tsx` (new)
- `app/dashboard/employer/analytics/page.tsx` (new)
- `app/dashboard/seeker/alerts/page.tsx` (new)
- `components/SalarySlider.tsx` (new)
- `middleware.ts` (add `/admin` route protection)
