# Phase 2 — Auth & User Profiles

**Goal:** Complete auth flows, role selection, Clerk→Convex user sync, employer company profiles, seeker profiles.

## Tasks

### 1. Clerk sign-in/sign-up with role selection
- Add role selection during sign-up (Seeker / Employer)
  - Use Clerk's after sign-up redirect to a role selection page
  - Or use Clerk's `signUp` flow with custom metadata
- Store role preference to pass to Convex on first login

### 2. Clerk webhook — sync users to Convex
- Create `convex/http.ts` with a Clerk webhook endpoint
- Listen for `user.created` and `user.updated` events
- On user creation, insert into `users` table with `tokenIdentifier`, `name`, `email`, `avatarUrl`
- Verify webhook signature using Clerk's `verifyWebhook` or Svix
- Handle `user.deleted` to optionally mark as inactive

### 3. Convex auth helper functions

**`convex/users.ts`:**
- `getMe` — query that returns current user profile via `ctx.auth.getUserIdentity()`
- `updateProfile` — mutation to update name, phone, location, bio, skills
- `onboardUser` — mutation to set role and mark `onboarded = true`

### 4. Employer — create/manage company profile
- `createCompany` — mutation to create a company (sets user's `companyId`)
- `updateCompany` — mutation to edit company details
- `uploadCompanyLogo` — mutation using Convex storage
- `getMyCompany` — query to get employer's company

### 5. Seeker — profile management
- `updateSeekerProfile` — mutation for bio, skills, location, phone
- `uploadResume` — mutation to upload resume to Convex storage
- `getSeekerProfile` — query for profile data

### 6. UI pages

**Role selection page** (`/role-select`):
- Two cards: "I'm looking for a job" (Seeker) / "I'm hiring" (Employer)
- Calls `onboardUser` mutation

**Profile page — Seeker** (`/profile`):
- Edit name, phone, location
- Add bio, skills (tag input)
- Upload resume file
- Display current profile

**Profile page — Employer** (`/profile`):
- Same seeker fields +
- Link to company management
- Create company if none exists

**Company page** (`/company/new`, `/company/edit`):
- Form for company name, description, website, location, size, industry
- Logo upload
- Slug auto-generated from name

### 7. Auth guards
- `middleware.ts`: Protect `/profile`, `/dashboard`, `/company/` routes
- `convex/auth.config.ts`: Already configured from Phase 0

## Deliverables
- Clerk webhook → Convex user sync
- Role selection flow
- Seeker profile with resume upload
- Employer profile + company creation
- Profile pages UI

## Files to create/modify
- `convex/http.ts` (new — webhook handler)
- `convex/users.ts` (new — user functions)
- `convex/companies.ts` (new — company functions)
- `convex/crons.ts` (optional — cleanup tasks)
- `app/(auth)/role-select/page.tsx` (new)
- `app/profile/page.tsx` (new)
- `app/company/new/page.tsx` (new)
- `app/company/edit/page.tsx` (new)
- `middleware.ts` (update protected routes)
