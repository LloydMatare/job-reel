# Job Reels — Landing Page & Employer Platform Plan

**Stack:** Next.js 16 + Convex + Clerk (Auth, Orgs, Billing) + Tailwind CSS v4

---

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| Org-Company Mapping | 1 Clerk Org = 1 Company |
| Billing Tiers | Free (1 job, 2 seats) → Pro ($29/mo, 10 jobs, 10 seats) → Enterprise (custom) |
| Landing Page | Homepage only (no separate marketing pages) |
| Employer Routing | `/orgs/[slug]/dashboard` (org-slug-native) |

---

## Phase 1 — Clerk Organizations Integration

**Goal:** Replace single-owner company model with Clerk Organizations. Each company = 1 Clerk Org.

### Files to Modify

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `clerkOrgId: v.string()` to companies table + `by_clerk_org` index |
| `convex/companies.ts` | Add `createOrgAndCompany` — creates Clerk Org via `clerkClient` + company doc. Replace `ownerId` checks with `auth().orgId` checks. |
| `convex/users.ts` | Add `orgMembershipId` field. Update sync/webhook for org events. |
| `convex/http.ts` | Add org webhook routes for `organization.created`, `organizationMembership.created/deleted` |
| `app/company/new/page.tsx` | Create Clerk Org first, then company doc |
| `app/(auth)/role-select/page.tsx` | Employer flow creates org instead of just setting role |
| `middleware.ts` | Protect `/orgs/[slug]/*` routes, verify `orgSlug` matches |
| `app/api/clerk-webhook/route.ts` | Handle `organization.created`, `organizationMembership.created/deleted` events to sync members |

### Files to Create

| File | Purpose |
|------|---------|
| `app/orgs/[slug]/layout.tsx` | Layout with `OrganizationSwitcher`, sidebar nav, role checks |
| `app/orgs/[slug]/settings/page.tsx` | Org settings with `OrganizationProfile` component |
| `app/orgs/[slug]/members/page.tsx` | Team management (invite, roles, remove) |

### Key Patterns

- Server: `const { orgId, orgSlug } = await auth()` to identify org
- Client: `<OrganizationSwitcher hidePersonal />` for org switching
- Invitations: `<OrganizationProfile>` built-in UI or `clerkClient.organizations.createOrganizationInvitation`
- Role checks: `auth().has({ role: 'org:admin' })` for admin gating

### Flow

1. User signs up → selects "I'm Hiring" → Clerk prompts to create org name
2. Clerk Org created → Convex company doc created with `clerkOrgId` link
3. User is `org:admin` of the org
4. Admin invites members via Clerk UI → members auto-appear under org
5. Convex functions check `auth().orgId` for company-scoped access

---

## Phase 2 — Clerk Billing (Free + Pro + Enterprise)

### Clerk Dashboard Setup

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | `active_jobs: 1`, `team_seats: 2` |
| Pro | $29/mo | `active_jobs: 10`, `team_seats: 10`, `featured_jobs: true`, `analytics: true` |
| Enterprise | Custom | Unlimited, `sso: true`, `analytics: true`, priority support |

### Clerk Features to Create

- `active_jobs` — max active job postings (numeric)
- `team_seats` — max team members (numeric)
- `featured_jobs` — boolean, can promote jobs
- `analytics` — boolean, access to application analytics
- `sso` — boolean, enterprise SSO

### Files to Create

| File | Purpose |
|------|---------|
| `convex/billing.ts` | `checkBillingLimit` internal mutation — queries org's plan/features via Clerk, enforces limits |
| `app/orgs/[slug]/billing/page.tsx` | Current plan display, usage stats, upgrade/downgrade CTA |
| `app/orgs/[slug]/billing/portal/page.tsx` | Stripe/Clerk billing portal redirect |

### Convex Gating

```typescript
// Example gating in createJob
const { has } = await auth()
const activeJobs = await ctx.db
  .query("jobs")
  .withIndex("by_company_and_status", (q) =>
    q.eq("companyId", companyId).eq("status", "active")
  )
  .collect()

if (activeJobs.length >= await getPlanLimit(orgId, 'active_jobs')) {
  throw new Error("Active job limit reached for your plan")
}
```

---

## Phase 3 — Landing Page (B2C Homepage)

### Sections

1. **Header** — Logo "Job Reels", nav: Find Jobs, Companies, Pricing (future), auth buttons (Sign In / UserButton), role-aware dashboard link
2. **Hero** — Gradient bg, search bar with category quick-select, tagline "Find Your Next Opportunity", subtitle
3. **Featured Jobs** — 6 real job cards from `getFeaturedJobs` query (skeleton fallback)
4. **How It Works** — Dual flow:
   - **Job Seekers:** Search → Apply → Get Hired (3-step cards)
   - **Employers:** Post → Review → Hire (3-step cards)
5. **Categories** — Grid from `categories` table with icons, links to `/jobs?category=slug`
6. **CTA Sections** — "For Employers" card → "Post a Job" CTA; "For Seekers" card → "Find Jobs" CTA
7. **Footer** — Nav links, copyright "© 2026 Job Reels"

### Files to Create

| File | Purpose |
|------|---------|
| `components/Header.tsx` | Global navigation (logo, links, auth, dashboard link) |
| `components/Footer.tsx` | Site footer |
| `components/JobCard.tsx` | Reusable job card (title, company, location, salary, badges, date) |
| `components/SearchBar.tsx` | Search input with category dropdown |
| `components/ui/Button.tsx` | Button component (variants: primary/secondary/outline, sizes: sm/md/lg) |
| `components/ui/Badge.tsx` | Status/type badge |
| `components/ui/Card.tsx` | Content card wrapper |
| `components/ui/Input.tsx` | Input with label and error state |
| `components/ui/Skeleton.tsx` | Loading placeholder |

### Files to Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Complete rewrite with all sections above |
| `app/layout.tsx` | Integrate Header + Footer components |
| `app/globals.css` | Custom theme variables, component classes |

---

## Phase 4 — Job Postings CRUD

### Files to Create

| File | Purpose |
|------|---------|
| `convex/jobs.ts` | All job queries and mutations |
| `app/jobs/page.tsx` | Search + filter sidebar + paginated results |
| `app/jobs/[id]/page.tsx` | Full job detail, company card, apply CTA, save button |
| `app/jobs/new/page.tsx` | Job creation form |
| `app/jobs/[id]/edit/page.tsx` | Job edit form (pre-populated) |
| `components/JobFilters.tsx` | Filter sidebar (type, category, location, salary) |

### Convex Functions (convex/jobs.ts)

**Public Queries:**
- `listJobs` — paginated, active jobs only, ordered by `_creationTime` desc
- `getJob` — single job by ID (includes company info)
- `searchJobs` — full-text search on title + description with filter params
- `getFeaturedJobs` — featured + recent ~6 jobs for homepage
- `getJobsByCompany` — all active jobs for a company page

**Employer Mutations:**
- `createJob` — creates job (checks billing `active_jobs` limit)
- `updateJob` — edit title, description, type, location, salary, category, skills
- `closeJob` — set status to "closed"
- `reopenJob` — set status back to "active"
- `deleteJob` — delete a draft job

### Employer Dashboard

| File | Purpose |
|------|---------|
| `app/orgs/[slug]/dashboard/page.tsx` | Stats cards + My Jobs table |

**Dashboard content:**
- Stats: Active Jobs count, Total Applicants, New Applicants Today
- My Jobs table: title, status badge, application count, posted date, actions (edit/close/delete)
- "Post New Job" button

---

## Dependencies Between Phases

```
Phase 1 (Orgs) ─────────────┐
                             ├── Phase 2 (Billing) ──┐
                             │                        ├── Phase 4 (Jobs)
Phase 3 (Landing) ───────────┘                        │
  (independent of orgs)                                │
                                                       ▼
                                              Phase 4 depends on
                                              Phase 1 + Phase 2
```

**Suggested order:** Phase 1 → Phase 2 + Phase 3 (parallel) → Phase 4

---

## Complete File Inventory

### New Files (27 total)

```
app/orgs/[slug]/layout.tsx
app/orgs/[slug]/dashboard/page.tsx
app/orgs/[slug]/settings/page.tsx
app/orgs/[slug]/members/page.tsx
app/orgs/[slug]/billing/page.tsx
app/orgs/[slug]/billing/portal/page.tsx
convex/billing.ts
components/Header.tsx
components/Footer.tsx
components/JobCard.tsx
components/SearchBar.tsx
components/JobFilters.tsx
components/ui/Button.tsx
components/ui/Badge.tsx
components/ui/Card.tsx
components/ui/Input.tsx
components/ui/Skeleton.tsx
convex/jobs.ts
app/jobs/page.tsx
app/jobs/[id]/page.tsx
app/jobs/new/page.tsx
app/jobs/[id]/edit/page.tsx
```

### Modified Files (11 total)

```
convex/schema.ts
convex/companies.ts
convex/users.ts
convex/http.ts
app/company/new/page.tsx
app/(auth)/role-select/page.tsx
middleware.ts
app/api/clerk-webhook/route.ts
app/page.tsx
app/layout.tsx
app/globals.css
```
