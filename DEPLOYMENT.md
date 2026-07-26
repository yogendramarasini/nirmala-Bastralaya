# Nirmala Bastralaya — Free Netlify Deployment

This release is prepared for `nirmalavastralaya.com.np`. It includes the
storefront, protected administrator dashboard, PostgreSQL database, orders,
customers, coupons, settings, email notifications, and persistent image uploads.

## Free services

- Netlify Free: Next.js application, API routes, SSL, CDN, and image storage
- Neon Free: PostgreSQL database
- Gmail SMTP (optional): transactional email for the store's low traffic

The free tiers are appropriate for the store's expected low traffic. Netlify
applies a monthly hard limit instead of charging automatically.

## 1. Put the project in GitHub

Create a public GitHub repository and upload this project. The application
source, Prisma schema and migrations, public storefront images,
`.env.example`, `package.json`, `package-lock.json`, and `netlify.toml` belong
in the repository.

Do not upload real `.env` files, database files, customer/order exports,
private payment proofs, `node_modules`, `.next`, `.netlify`, backups, logs,
archives, or a nested `.git` directory. The included `.gitignore` blocks these
items. Put every real password, database URL, SMTP credential, and
authenticator secret in Netlify environment variables only.

## 2. Create the PostgreSQL database

Create one free Neon project. Copy its pooled connection string and keep it
private. It will be entered in Netlify as:

```env
DATABASE_URL=postgresql://...
```

## 3. Import the project into Netlify

1. In Netlify, choose **Add new project → Import an existing project**.
2. Connect GitHub and select the private repository.
3. Netlify detects Next.js automatically.
4. Confirm build command `npm run netlify-build` and publish directory `.next`.

## 4. Add private environment variables

In **Project configuration → Environment variables**, add:

```env
DATABASE_URL=THE_NEON_POOLED_CONNECTION_STRING
NEXTAUTH_URL=https://nirmalavastralaya.com.np
NEXT_PUBLIC_APP_URL=https://nirmalavastralaya.com.np
NEXT_PUBLIC_SITE_NAME=Nirmala Bastralaya

NEXTAUTH_SECRET=RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
ADMIN_EMAIL=THE_PRIVATE_ADMIN_EMAIL
ADMIN_PASSWORD=A_UNIQUE_PASSWORD_OF_AT_LEAST_14_CHARACTERS
ADMIN_TOTP_SECRET=THE_OPTIONAL_AUTHENTICATOR_SETUP_KEY

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nirmalavastralya@gmail.com
SMTP_PASS=THE_GMAIL_APP_PASSWORD
SMTP_FROM=Nirmala Bastralaya <nirmalavastralya@gmail.com>
```

Never commit real passwords. Use a Gmail App Password, not the normal Gmail
password. The store and administrator panel remain fully functional if SMTP is
not configured; email notifications begin automatically after all five SMTP
variables are added.

For administrator two-factor authentication, set `ADMIN_EMAIL` locally and run
`npm run admin:2fa`. Add the printed account to an authenticator application,
then save its setup key only in Netlify as `ADMIN_TOTP_SECRET`. When this
variable is present, every administrator login requires the current six-digit
code. Keep an encrypted recovery copy of the setup key.

## 5. Deploy

Start the production deployment. The configured build:

1. applies PostgreSQL migrations;
2. creates or updates the administrator from private environment variables;
3. creates starter clothing categories and products;
4. disables any legacy jewellery categories;
5. builds the Next.js application.

Product, QR-code and payment-proof images are converted to WebP and stored in
Netlify Blobs. Each upload is limited to 4 MB. Payment proofs are private and
can only be retrieved by an authenticated administrator.

## 6. Configure backups before launch

Export an initial database backup and enable the database provider's automated
backup or point-in-time restore option. Keep at least one encrypted copy outside
the production account. Export the Netlify Blob image store on the same
retention schedule. Test one restore before accepting real orders.

For Docker/VPS deployment, `scripts/backup.sh` creates private database and
upload archives. Schedule it daily with cron and copy the resulting `backups`
directory to a second machine or encrypted object-storage account.

## 7. Connect the domain

In Netlify open **Domain management → Add a domain** and add:

```text
nirmalavastralaya.com.np
www.nirmalavastralaya.com.np
```

Netlify will show the DNS records or nameservers assigned to the project. Enter
those exact values at the `.com.np` registrar. Do not guess nameserver values.
Make the apex domain primary and redirect `www` to it. Netlify provisions SSL
after DNS validation.

## 8. Launch verification

Verify:

```text
/
/shop
/about
/contact
/cart
/checkout
/admin/login
/api/health
```

The health endpoint must report `database: connected` and
`storage: netlify-blobs`. Log in to the administrator dashboard, create and edit
a test product, upload an image and QR code, place a test order, confirm stock
decreases, update the order status, and verify the notification email.
Also confirm that a payment-proof URL returns `401` when opened in a private
browser window and that the same proof opens after administrator login.
