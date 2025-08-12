# Job Blaster MVP — Source of Truth (Week-1 Build)

## Goal

Ship a personal job-tracking MVP in 7 days that saves time now: fast job
capture, Kanban tracking, quick application notes, and follow-up reminders. No
auto-apply.

## Core Features

- Kanban: Saved → Applied → Interview → Offer → Rejected
- Add Job by URL: fetch title/company/source/logo guess, confirm, save
- Applications: attach resume + short tailored cover note
- Follow-ups: set `nextAction` automatically (default +5 days), “Due Today”
  banner
- Export CSV

## Stack

- **Frontend:** React + Vite + Tailwind, React Router, TanStack Query
- **Backend:** Node.js + Express
- **DB/ORM:** PostgreSQL (Supabase or Neon) + Prisma
- **Auth:** Supabase Auth (later). For week 1 dev, use header `x-user-id`.
- **Storage:** Supabase Storage (resumes) — day 6
- **Deploy:** Frontend (Vercel/Netlify), API (Render/Railway/Fly), DB
  (Supabase/Neon)
- **Parsing:** `node-fetch` + `cheerio` (read OG/Twitter/title tags)
- **Cron:** simple daily check for due follow-ups (can be in-app banner for MVP)

## Data Model (Prisma)

```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

enum JobStatus { SAVED APPLIED INTERVIEW OFFER REJECTED }
enum AppStatus { DRAFT APPLIED INTERVIEW OA OFFER REJECTED }

model User {
  id           String  @id @default(cuid())
  email        String  @unique
  name         String?
  createdAt    DateTime @default(now())
  resumes      Resume[]
  jobs         Job[]
  applications Application[]
  templates    Template[]
}

model Resume {
  id        String   @id @default(cuid())
  userId    String
  name      String
  fileUrl   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Job {
  id            String    @id @default(cuid())
  userId        String
  title         String
  company       String
  url           String
  source        String?
  location      String?
  salary        String?
  tags          String[]
  status        JobStatus  @default(SAVED)
  faviconUrl    String?
  notes         String?
  lastActivityAt DateTime  @default(now())
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications  Application[]

  @@index([userId, status, createdAt])
  @@index([userId, lastActivityAt])
}

model Application {
  id          String    @id @default(cuid())
  userId      String
  jobId       String
  resumeId    String?
  coverNote   String?
  status      AppStatus  @default(APPLIED)
  appliedAt   DateTime?
  nextAction  DateTime?
  notes       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  job         Job        @relation(fields: [jobId], references: [id], onDelete: Cascade)
  resume      Resume?    @relation(fields: [resumeId], references: [id])

  @@index([userId, nextAction])
  @@index([userId, status])
}

model Template {
  id        String   @id @default(cuid())
  userId    String
  name      String
  body      String   // uses {jobTitle}, {company}, {skills}
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
