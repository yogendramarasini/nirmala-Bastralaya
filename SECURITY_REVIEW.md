# Nirmala Vastralaya Security Review

Review date: 2026-07-26  
Scope: the complete source tree in this release, including the Next.js
storefront, API routes, Prisma schema and migrations, local setup, Netlify
configuration, Docker/Nginx configuration, uploads, and deployment scripts.

## Executive result

All high-, critical-, and moderate-severity code findings discovered during
this review were corrected. `npm audit` reports **0 known vulnerabilities** in
both production and development dependencies. TypeScript validation and the
optimized production build pass.

No review can prove that future vulnerabilities or deployment mistakes are
impossible. The two remaining launch actions are operational: enable
`ADMIN_TOTP_SECRET` after enrolling the owner's authenticator, and enable/test
off-site backups in the selected hosting accounts.

## Findings and corrections

### 1. Secrets and credentials

- **PASS — no real `.env`, key, certificate, or `.git` directory is included.**
  Only placeholder values are present in `.env.example:1-15`. Environment,
  certificate, private-upload, generated SQLite schema, and build paths are
  excluded by `.gitignore:16-18,23-25,33-48`.
- **FIXED — known local administrator credentials were removed.**
  `scripts/setup-local-preview.mjs` generates a new authentication secret and
  administrator password every time it prepares a clean preview. Production
  seeding refuses missing, common, or shorter-than-14-character passwords at
  `prisma/seed.ts:10-17`.
- **PASS — production secrets are references, not values.**
  Netlify/Docker read database, NextAuth, administrator, SMTP, and optional
  TOTP values from environment variables (`docker-compose.yml:27-40`).
- **ACTION — rotate any credential that ever existed in an older/original ZIP.**
  This release is clean, but removing a leaked credential from a later archive
  does not revoke the earlier value.

### 2. User and data security

- **PASS — passwords use bcrypt with cost 12.**
  See `prisma/seed.ts:19-23`; no MD5, SHA-1 password storage, or plaintext
  password persistence was found.
- **PASS — customer and order records are administrator-only.**
  The list routes reject non-admin sessions at
  `app/api/customers/route.ts:7-11` and `app/api/orders/route.ts:16-19`.
  Individual order reads and updates have the same check at
  `app/api/orders/[id]/route.ts:7-12,47-52`. The storefront has guest checkout,
  not customer accounts, so private order details are deliberately admin-only;
  a buyer receives only the newly created order number and ID in the direct
  create response.
- **FIXED — public product details no longer expose reviewer email addresses.**
  The explicit public review projection is at
  `app/api/products/[id]/route.ts:10-20`.
- **PASS — checkout prices, discounts, and stock are server authoritative.**
  Item price is read from the product record at
  `app/api/orders/route.ts:84-101`; coupon use and stock are atomically guarded
  at `app/api/orders/route.ts:105-159`; the transaction is serializable at
  `app/api/orders/route.ts:182-186`.
- **PASS — SQL injection controls.**
  Database access uses Prisma's typed query API. No
  `$queryRawUnsafe`/`$executeRawUnsafe` calls or string-built SQL were found.
- **FIXED — input shapes and lengths are validated.**
  Order, product, category, coupon, login, media, newsletter, image URL, and
  update schemas are defined in `lib/validations.ts:21-121`. State-changing
  routes reject cross-origin requests through `lib/security.ts:25-50`.
- **FIXED — HTML email injection/XSS.**
  Customer-controlled values are escaped by `lib/email.ts:25-33` before use in
  templates (`lib/email.ts:50-82,141-179`). React escapes storefront/admin text
  by default, and no `dangerouslySetInnerHTML`, `eval`, or `new Function` use
  was found.

### 3. Configuration issues

- **PASS — production mode is explicit.**
  The container sets `NODE_ENV=production` at `Dockerfile:35-36`; Next.js
  production builds suppress development stack pages.
- **PASS — no default production administrator.**
  Production requires environment-supplied credentials and rejects weak
  passwords (`prisma/seed.ts:10-23`). The local preview generates a fresh
  password rather than shipping one.
- **PASS — CORS is not opened.**
  No wildcard `Access-Control-Allow-Origin` header exists. Mutation origin
  enforcement is in `lib/security.ts:25-50`.
- **PASS — directory listing is disabled.**
  Nginx sets `autoindex off` at `nginx/nginx.conf:19-23`; Netlify does not expose
  filesystem directory listings.
- **PASS — private responses are not cached.**
  Administrator and API cache controls are set in
  `next.config.ts:23-30`; payment proofs additionally use private/no-store
  headers at `app/api/assets/[...path]/route.ts:60-69`.

### 4. File upload risks

- **PASS — authorization and origin checks.**
  Product, QR, and general uploads require an administrator; public payment
  uploads are origin-checked and rate-limited at
  `app/api/upload/route.ts:19-49`.
- **PASS — size, MIME, decoded format, and pixel count are limited.**
  The 4 MB limit and allowlists are at `app/api/upload/route.ts:15-17,24-56`.
  Sharp decodes the actual content with a 40-million-pixel ceiling and
  re-encodes it to WebP at `app/api/upload/route.ts:59-82`. An executable renamed
  to `.jpg` therefore fails decoding.
- **PASS — random filenames and non-executable storage.**
  UUID WebP names and private storage are used at
  `app/api/upload/route.ts:84-115`. Local/Docker uploads live outside `public`;
  Netlify uses a private Blob store.
- **PASS — QR integrity and scan quality.**
  Administrator-uploaded QR images use lossless WebP at
  `app/api/upload/route.ts:68-79`. The bundled Fonepay QR is the default at
  `prisma/seed.ts:27-38` and `app/api/settings/qr-codes/route.ts:11-19`.
  Its decoded merchant payload was compared with the supplied bank document,
  and automated scanning passed at both 264-pixel and 200-pixel display sizes.
- **FIXED — payment proofs are no longer public bearer images.**
  `app/api/assets/[...path]/route.ts:18-29` requires an admin session for every
  `payment/` object, and `:60-69` prevents public caching.

### 5. Dependencies

- **FIXED — vulnerable packages were updated.**
  Patched direct versions and security overrides are pinned in
  `package.json:20-65`, including Next.js, NextAuth, PostCSS, Sharp, Netlify
  telemetry dependencies, Nodemailer, and Tailwind.
- **FIXED — unused packages were removed.**
  Unused Multer, UUID, date-fns, next-themes, Recharts, Swiper, ts-node, and
  obsolete type packages were removed.
- **PASS — audit result.**
  `npm audit` on 2026-07-26: 0 critical, 0 high, 0 moderate, 0 low.
  A clean-install dry run also passes.

### 6. Administrator panel

- **PASS — page and API authorization.**
  The dashboard layout verifies the admin role at
  `app/admin/(dashboard)/layout.tsx:7-10`. All admin data and mutation APIs use
  the same role check; representative examples are
  `app/api/admin/stats/route.ts:6-10`,
  `app/api/settings/route.ts:11-15,26-31`, and
  `app/api/media/route.ts:8-12,20-25`.
- **FIXED — persistent login lockout and audit logging.**
  Five failures in 15 minutes block both the target email and source address;
  identifiers are hashed before storage. See
  `lib/security.ts:6-8,72-114` and `lib/auth.ts:33-73`. Successful login/logout
  auditing is at `lib/auth.ts:111-132`.
- **ADDED — optional standards-based TOTP 2FA.**
  Verification is at `lib/auth.ts:50-67`; enrollment generation is provided by
  `scripts/generate-2fa.mjs`. Set `ADMIN_TOTP_SECRET` to require the six-digit
  authenticator code. It is intentionally not activated with a shared default
  secret.
- **PASS — secure session cookie.**
  Production cookies are HTTP-only, Secure, SameSite=Lax, and limited to an
  eight-hour session (`lib/auth.ts:17-20,100-109`).

### 7. Deployment readiness

- **PASS — HTTPS and transport security.**
  Netlify HSTS is set at `netlify.toml:9-16`; Docker/Nginx redirects HTTP to
  HTTPS and permits TLS 1.2/1.3 at `nginx/nginx.conf:38-63`.
- **PASS — browser security headers.**
  Nonce-based CSP and HSTS are generated in `proxy.ts:4-31`. Frame denial,
  MIME sniff protection, referrer policy, permissions policy, and private
  caching are in `next.config.ts:12-30`.
- **PASS — safe generic errors.**
  APIs return fixed public error messages, while `app/error.tsx`,
  `app/global-error.tsx`, and `app/not-found.tsx` do not expose exception text,
  stack traces, or file paths.
- **READY — backups are implemented, but hosting must schedule them.**
  Docker database and private-upload archives, restrictive permissions, and
  30-day local retention are implemented in `scripts/backup.sh:1-26`.
  `DEPLOYMENT.md` requires enabling provider backups, storing an off-site copy,
  and testing a restore before launch.

## Runtime verification

The following local integration checks passed against a freshly generated
SQLite preview database:

- storefront and public product API: `200`;
- admin login, session, stats, and authenticated order detail: `200`;
- customer list, order list/detail, product upload, and payment proof without
  authentication: `401`;
- cross-origin newsletter request: `403`;
- executable text disguised as `image/jpeg`: `400`;
- valid payment image upload: `200`, converted to private WebP;
- bundled Fonepay QR: decoded successfully at 264 px and 200 px with the
  merchant name `Nirmala Vastralaya`;
- guest Cash on Delivery order: `201`;
- charged item price matched the database catalog price (NPR 4,200), not client
  input;
- five bad logins followed by the correct password: still `401` (lockout);
- with 2FA enabled, correct password without code: `401`; correct password plus
  valid TOTP: `200`;
- full TypeScript check: pass;
- optimized Next.js production build: pass, 39 routes generated;
- `npm audit`: 0 known vulnerabilities.
