# Phase 7 — AI Career Tools

**Goal:** AI-powered resume builder, cover letter generator, and career guidance chatbot using OpenAI GPT-4o via Convex actions.

## Tasks

### 1. Schema additions

**New tables in `convex/schema.ts`:**

- `resumes`: userId, title, sections (structured JSON), createdAt
- `cover_letters`: userId, jobId (optional), resumeId (optional), content, createdAt
- `career_chat_messages`: userId, role (user|assistant), content, createdAt

### 2. OpenAI integration

**`convex/ai.ts`** — Convex actions:
- `generateResumeContent` — accepts raw experience/education/skills + optional job description, returns AI-polished JSON
- `generateCoverLetter` — accepts resume + job details + company context, returns tailored cover letter text
- `askCareerQuestion` — accepts user question + profile context, returns guidance

**Env var:** `OPENAI_API_KEY` stored as Convex environment variable; graceful fallback when missing

### 3. Resume CRUD

**`convex/resumes.ts`:**
- `saveResume` — create with structured sections
- `updateResume` — update sections
- `getMyResumes` — list user's resumes
- `getResume` — single resume by id
- `deleteResume` — remove resume

### 4. Cover letter CRUD

**`convex/cover_letters.ts`:**
- `saveCoverLetter` — create with AI-generated or manual content
- `getMyCoverLetters` — list user's cover letters
- `getCoverLetter` — single cover letter
- `deleteCoverLetter` — remove

### 5. Career chat

**`convex/career_chat.ts`:**
- `sendMessage` — saves user message, calls AI, saves response
- `getChatHistory` — all messages for user
- `clearChat` — delete user's chat history

### 6. Resume builder UI

**`app/dashboard/seeker/resumes/page.tsx`** — list resumes with cards, "Create New Resume" button

**`app/dashboard/seeker/resumes/new/page.tsx`** — step-by-step builder:
- Step 1: Personal summary
- Step 2: Experience (add multiple entries)
- Step 3: Education (add multiple entries)
- Step 4: Skills (tag input)
- "Polish with AI" button per section
- Preview with print stylesheet for PDF export
- Save

**`app/dashboard/seeker/resumes/[id]/page.tsx`** — view/edit existing resume

### 7. Cover letter UI

**`app/dashboard/seeker/cover-letters/page.tsx`** — list with cards, "New Cover Letter" button

**`app/dashboard/seeker/cover-letters/new/page.tsx`** — pick job + resume → "Generate with AI" → edit → save

### 8. Career guidance UI

**`app/dashboard/seeker/career-guidance/page.tsx`** — chat interface:
- Message bubbles (user right, assistant left)
- Suggested prompts as quick buttons
- Input field + send button
- Conversation persists on reload

### 9. Navigation

- Seeker dashboard sidebar: add "Resumes", "Cover Letters", "Career Guidance" links

## Deliverables

- Resume builder with AI polish
- Cover letter generator integrated with jobs
- Career guidance chat
- All data persisted in Convex

## Files to create/modify

- `convex/schema.ts` (modify — 3 new tables)
- `convex/ai.ts` (new)
- `convex/resumes.ts` (new)
- `convex/cover_letters.ts` (new)
- `convex/career_chat.ts` (new)
- `app/dashboard/seeker/resumes/page.tsx` (new)
- `app/dashboard/seeker/resumes/new/page.tsx` (new)
- `app/dashboard/seeker/resumes/[id]/page.tsx` (new)
- `app/dashboard/seeker/cover-letters/page.tsx` (new)
- `app/dashboard/seeker/cover-letters/new/page.tsx` (new)
- `app/dashboard/seeker/career-guidance/page.tsx` (new)
- `app/dashboard/seeker/layout.tsx` (modify — nav items)
