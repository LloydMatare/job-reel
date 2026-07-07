# Phase 3 — Job Listings & Search

**Goal:** Employers can post/manage jobs. Seekers can discover, search, filter, and save jobs.

## Tasks

### 1. Convex job functions (`convex/jobs.ts`)

**Employer mutations:**
- `createJob` — create a new job listing (requires employer role, company)
- `updateJob` — edit title, description, type, location, salary, category, skills
- `closeJob` — set status to "closed"
- `reopenJob` — set status back to "active"
- `deleteJob` — delete a draft job

**Public queries:**
- `listJobs` — paginated job feed, active jobs only, ordered by `_creationTime` desc
- `getJob` — single job detail by ID (includes company info via `ctx.db.get`)
- `searchJobs` — full-text search on title + description with filters
- `getJobsByCompany` — all jobs for a company page
- `getFeaturedJobs` — featured/promoted jobs for homepage

**Filter support in `listJobs` & `searchJobs`:**
- `employmentType` — filter by type
- `locationType` — on-site/remote/hybrid
- `category` — filter by category slug
- `salaryMin` — minimum salary floor
- `location` — location text search (basic)
- `skills` — filter by required skills (intersection)

### 2. Save/bookmark jobs (`convex/saved_jobs.ts`)

- `saveJob` / `unsaveJob` — mutations to toggle bookmark
- `getSavedJobs` — query returning user's saved jobs with full job data
- `isJobSaved` — query checking if a specific job is saved

### 3. Job categories (`convex/categories.ts`)

- `listCategories` — query returning all categories
- `seedCategories` — mutation to populate default categories (admin)

### 4. Employer dashboard — job management

**`app/dashboard/employer/page.tsx`:**
- List of employer's jobs with status badges
- Stats: total active, total applications received
- Actions: edit, close, reopen, view applicants
- Create new job button

### 5. Job posting form (`app/jobs/new/page.tsx` and `app/jobs/[id]/edit/page.tsx`)

- Title, description (textarea or rich text)
- Location + location type (on-site/remote/hybrid)
- Employment type dropdown
- Salary range inputs (min, max, currency)
- Category dropdown (populated from categories table)
- Skills input (tag-style, comma-separated or chips)
- Status selector: draft / publish immediately

### 6. Job feed / listing page (`app/jobs/page.tsx`)

- Paginated grid/list of job cards
- Each card: title, company name, location, salary range, type badges, posted date
- Click → job detail page
- Search bar at top
- Filter sidebar or dropdowns

### 7. Job detail page (`app/jobs/[id]/page.tsx`)

- Full job description
- Requirements & responsibilities sections
- Company info card (logo, name, description)
- Location, salary, type badges
- Save/unsave button
- "Apply Now" CTA (leads to application flow)

### 8. Homepage featured jobs section

- Featured/promoted jobs carousel or grid
- Quick category links
- Search bar prominently placed

## Deliverables
- Full CRUD for job listings
- Full-text search with filters
- Save/bookmark functionality
- Employer job management dashboard
- Job feed, detail page, posting form
- Categories system

## Files to create/modify
- `convex/jobs.ts` (new)
- `convex/saved_jobs.ts` (new)
- `convex/categories.ts` (new)
- `app/jobs/page.tsx` (new)
- `app/jobs/new/page.tsx` (new)
- `app/jobs/[id]/page.tsx` (new)
- `app/jobs/[id]/edit/page.tsx` (new)
- `app/dashboard/employer/page.tsx` (new)
- `app/page.tsx` (update with featured jobs + search)
- `components/JobCard.tsx` (new)
- `components/JobFilters.tsx` (new)
- `components/SearchBar.tsx` (new)
<｜｜DSML｜｜parameter name="filePath" string="true">/home/kronos/Apps/job-reel/context/feature-specs/phase-3-job-listings-and-search.md