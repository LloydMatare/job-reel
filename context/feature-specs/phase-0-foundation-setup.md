# Phase 0 — Foundation Setup

**Goal:** Fix auth plumbing, rename proxy to middleware, configure Clerk JWT with Convex, clean boilerplate.

## Tasks

### 1. Rename `proxy.ts` → `middleware.ts`
- `proxy.ts` at project root contains `clerkMiddleware` — rename to `middleware.ts` (Next.js convention)
- Keep the same matcher config and protected route logic

### 2. Configure Clerk JWT for Convex (`convex/auth.config.ts`)
- Uncomment the Clerk provider block
- Set `domain` to the Clerk JWT issuer URL from Clerk Dashboard → JWT Templates → "convex" template → Issuer URL
- Set `applicationID` to `"convex"`
- Verify: `ctx.auth.getUserIdentity()` should return identity in Convex functions

### 3. Set Convex environment variables
- In Convex dashboard, set `CLERK_JWT_ISSUER_DOMAIN` to the Clerk JWT issuer URL
- This allows the issuer to differ between dev/prod via env vars

### 4. Clean up boilerplate
- Remove `numbers` table from `convex/schema.ts`
- Remove example code from `convex/myFunctions.ts` (or delete and replace with initial structure)
- Update `app/page.tsx` to remove starter demo content
- Update `app/layout.tsx` metadata to "Job Reels"
- Remove `app/server/` route (or repurpose later)

### 5. Verify auth flow end-to-end
- Sign in with Clerk → Convex function returns `getUserIdentity()`
- Unauthenticated users get `null` from `getUserIdentity()`

## Deliverables
- `middleware.ts` (renamed from `proxy.ts`)
- `convex/auth.config.ts` with Clerk provider configured
- Clean schema with no placeholder tables
- Updated layout metadata → "Job Reels"
- Working auth → Convex identity flow

## Files to modify
- `proxy.ts` → rename to `middleware.ts`
- `convex/auth.config.ts`
- `convex/schema.ts`
- `convex/myFunctions.ts`
- `app/layout.tsx`
- `app/page.tsx`
