# CenterKick Typography Guidelines

## Strict Typography Rules
To maintain a premium, cohesive design, we strictly enforce a typography scale based on standard Tailwind CSS classes. 
**Never use hardcoded pixel values (e.g., `text-[12px]`, `text-[14px]`). This is strictly forbidden.**

### Font Sizes
- `text-xs`: For small text, tags, badges, very minor labels (12px). Use this instead of `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, or `text-[12px]`.
- `text-sm`: Secondary body text, forms, dense UI tables.
- `text-base`: Primary body text, standard paragraphs.
- `text-lg`: Large body text, emphasis, small component titles.
- `text-xl`: Sub-headings (H4), card titles.
- `text-2xl`: Section headings (H3).
- `text-3xl`: Page headings (H2).
- `text-4xl`: Main Hero headings (H1).
- `text-5xl`: Display text, very large hero text.

### Font Weights
- `font-normal`: Standard body text and paragraphs.
- `font-medium`: Buttons, navigational links, table headers, subtitles.
- `font-semibold`: Small card titles, important emphasized text.
- `font-bold`: Standard headings (H1-H6).
- `font-black`: **Restricted Use:** Only for massive display text (e.g., `text-5xl` and above) or brand logos where extreme visual weight is required. Do NOT use for standard UI text.

## Migration Files Naming
Whenever generating a new Supabase migration file, always ensure to include a title comment at the very top of the file using the format: `-- title: [Your Title Here]` so that it is properly named in the Supabase Studio SQL Editor.

# CenterKick UX Guidelines

## Feedback Toast Notifications
Every action that requires user feedback (e.g., success, error, warnings, validation failures) MUST trigger a toast notification containing non-technical, user-friendly language instead of inline status text or generic console logs. Always utilize the existing Toast context for this.

# CenterKick Database Rules

## Transactions Table
In CenterKick, the `transactions` table stores the `profile.id` in its `user_id` column. Always extract the correct `profile.id` for each user and then query the `transactions` table using those exact profile IDs.

# CenterKick Performance, Compute & Resource Optimization Rules

## Strict Development & Deployment Guardrails
To prevent platform downtime, database connection exhaustion, and excess compute consumption across Supabase and Vercel free-tier limits, all application code and deployments MUST strictly adhere to the following rules:

1. **Zero Unbounded Database Queries**:
   - Never execute unbounded `select('*')` on growing tables (`profiles`, `users`, `site_content`, `cms_posts`). Always explicitly project only required columns.
   - Always enforce `.limit()` caps on directory, listing, and search queries.
   - Ensure all frequently filtered columns (`status`, `user_id`, `role`, `slug`) possess covering database indexes.

2. **Middleware & Proxy Execution Guardrails**:
   - NEVER execute database queries in Next.js middleware / proxy handlers on public routes.
   - Restrict role, participant, and subscription database checks strictly to protected `/dashboard` and `/admin` routes.
   - Short-circuit immediately for anonymous traffic (no Supabase auth cookies present) in <1ms without calling Supabase Auth API or PostgreSQL.

3. **Caching & Single-Flight Deduplication**:
   - Static reference tables (`clubs`, `leagues`, `countries`, global site settings) MUST be cached via `getCachedData` (L1 in-memory + L2 Upstash Redis with single-flight stampede protection) with appropriate TTLs (e.g., 3600s).
   - Public directory, marketing, and detail pages MUST export `revalidate` (ISR) instead of `force-dynamic` or un-cached SSR whenever user session cookies are not required for the initial render.
   - Do not call dynamic `cookies()` or dynamic `createClient()` during SSR of public pages. Active/complete profiles must be servable directly from Vercel Edge CDN.

4. **Serverless Timeouts & Resource Protection**:
   - Every outbound network `fetch()` inside serverless API routes or server actions MUST include an explicit timeout signal (`AbortSignal.timeout(...)`) to prevent hanging executions and runaway Vercel CPU time burns.
   - Diagnostic and testing endpoints must be completely disabled (return 404) in production.
   - Cron endpoints must strictly enforce secret verification (`CRON_SECRET`) and reject unauthorized crawlers in production.

5. **Security & Speed Balance**:
   - Optimizations must never bypass authorization or data integrity. Use `createAdminClient()` strictly for public read-only ISR pre-renders; protected mutations and user-scoped data must always verify authentication and RLS.

