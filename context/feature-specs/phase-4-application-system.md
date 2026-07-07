# Phase 4 — Application System

**Goal:** Seekers can apply to jobs with resume + cover letter. Employers can review, shortlist, and manage applications.

## Tasks

### 1. Convex application functions (`convex/applications.ts`)

**Seeker mutations:**
- `applyToJob` — submit application (jobId, resumeStorageId?, coverLetter?)
  - Validates user hasn't already applied to this job
  - Validates job is active
  - Increments `applicationCount` on the job document
- `withdrawApplication` — withdraw own application (only if status is "pending")

**Employer mutations:**
- `updateApplicationStatus` — change status: reviewing, shortlisted, rejected, hired
- `addEmployerNotes` — private notes on an application

**Queries:**
- `getJobApplications` — all applications for a given job (employer only, owns the job)
- `getMyApplications` — all applications by current user (seeker only)
- `getApplication` — single application detail
- `getApplicationStats` — counts by status for a job

### 2. Apply flow (`app/jobs/[id]/apply/page.tsx`)

- Pre-filled user info from profile
- Upload resume file (optional if already on profile, allows new upload)
- Cover letter textarea
- Review & submit
- Success confirmation screen
- Redirect to "My Applications"

### 3. Employer — application review dashboard

**`app/dashboard/employer/applications/page.tsx`:**
- For a selected job, show all applications
- Filterable by status: all, pending, reviewing, shortlisted, rejected, hired
- Each application card: applicant name, email, status badge, date applied
- Click to expand detail

**`app/dashboard/employer/applications/[id]/page.tsx`:**
- Full applicant details
- Resume download/view link
- Cover letter text
- Status management buttons (reviewing → shortlisted → hired, or rejected at any point)
- Private notes textarea
- Application timeline

### 4. Seeker — "My Applications" dashboard

**`app/dashboard/seeker/applications/page.tsx`:**
- List of all applications with job title, company name, status, date applied
- Status badges with color coding
- Click to view application detail
- Withdraw button for pending applications

**`app/dashboard/seeker/applications/[id]/page.tsx`:**
- Application detail view
- Job info (title, company, salary)
- Submitted resume + cover letter
- Current status with timeline
- Company info card

### 5. Resume storage

- Use Convex storage for resumes (`ctx.storage.store()`)
- Resume uploaded during profile setup or during application
- Link resume via `resumeStorageId` on both user profile and application
- Generate signed URLs for employer to view/download (`ctx.storage.getUrl()`)

### 6. Application count denormalization

- Jobs table has `applicationCount` field
- Incremented in `applyToJob` mutation
- Decremented if application withdrawn
- Display on job detail page: "X applicants"

## Deliverables
- Apply to job flow with resume + cover letter
- Employer application management with status workflow
- Seeker "My Applications" dashboard
- Resume file storage and retrieval
- Application count on job listings

## Files to create/modify
- `convex/applications.ts` (new)
- `app/jobs/[id]/apply/page.tsx` (new)
- `app/dashboard/employer/applications/page.tsx` (new)
- `app/dashboard/employer/applications/[id]/page.tsx` (new)
- `app/dashboard/seeker/applications/page.tsx` (new)
- `app/dashboard/seeker/applications/[id]/page.tsx` (new)
- `components/ApplicationCard.tsx` (new)
- `components/StatusBadge.tsx` (new)
- `convex/jobs.ts` (update `createJob` to initialize `applicationCount`)
