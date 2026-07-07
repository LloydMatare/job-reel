# Phase 7 — Testing & Deployment

**Goal:** Ensure reliability with tests and ship to production.

## Tasks

### 1. Convex function tests

**Setup:**
- Install `vitest`, `convex-test`, `@edge-runtime/vm`
- Create `vitest.config.ts` with `environment: "edge-runtime"`
- Configure test script in `package.json`

**Test files (`convex/**/*.test.ts`):**

**`convex/users.test.ts`:**
- User profile creation via webhook
- Profile updates
- Role assignment

**`convex/jobs.test.ts`:**
- Create job listing
- Update job details
- Close/reopen job
- Search jobs with filters
- Pagination behavior
- Authorization — only employer can create/edit

**`convex/applications.test.ts`:**
- Submit application
- Duplicate application prevention
- Status transitions
- Withdraw application
- Authorization — only job owner can see applications

**`convex/saved_jobs.test.ts`:**
- Save/unsave job
- Get saved jobs

**`convex/admin.test.ts`:**
- Admin role check
- Admin-only operations

### 2. Playwright E2E tests

**Setup:**
- Install Playwright: `npx playwright install`
- Create `e2e/` directory
- Configure `playwright.config.ts`

**Test scenarios:**

**Auth flows:**
- Sign up as seeker
- Sign up as employer
- Sign in / sign out
- Role selection flow

**Job seeker flows:**
- Browse jobs on homepage
- Search jobs by keyword
- Filter jobs by type/category
- View job detail
- Save a job
- Apply to a job with resume + cover letter
- View "My Applications"
- Edit profile

**Employer flows:**
- Create company profile
- Post a new job
- Edit a job listing
- View applications for a job
- Update application status
- Close a job listing

### 3. Production deployment

**Convex:**
- `npx convex deploy` to push to production
- Set production environment variables (Clerk JWT issuer, email API key)
- Verify auth flow on production URL

**Vercel / Next.js:**
- Connect GitHub repo to Vercel
- Set environment variables: `NEXT_PUBLIC_CONVEX_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Deploy and verify

**Domain setup:**
- Configure custom domain
- Set up Clerk production instance with the domain
- Update JWT template issuer if needed

### 4. Performance optimization

- `preloadQuery` on server components for critical data
- Convex query batching where possible
- Image optimization (next/image)
- Lazy loading below-fold content
- Convex function pagination limits on all list queries

### 5. Security checklist

- [ ] All Convex mutations validate user identity via `ctx.auth.getUserIdentity()`
- [ ] Role-based access control on all employer/admin operations
- [ ] Clerk webhook signature verification
- [ ] Convex storage URLs are signed (not public)
- [ ] No sensitive data in Convex function arguments (use server-side identity)
- [ ] CORS settings on Convex HTTP endpoints

### 6. Monitoring

- Convex dashboard logs for error tracking
- Convex function duration monitoring
- Set up error reporting (Sentry or similar — optional)

## Deliverables
- Unit/integration tests for all Convex functions
- E2E tests for critical user flows
- Production deployment on Convex + Vercel
- Environment configuration for production
- Security audit complete
- Performance optimized

## Files to create/modify
- `vitest.config.ts` (new)
- `convex/users.test.ts` (new)
- `convex/jobs.test.ts` (new)
- `convex/applications.test.ts` (new)
- `convex/saved_jobs.test.ts` (new)
- `convex/admin.test.ts` (new)
- `playwright.config.ts` (new)
- `e2e/` (directory with test files)
- `package.json` (add test scripts)
