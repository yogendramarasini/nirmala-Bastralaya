# Nirmala Vastralaya

Production clothing storefront and administrator system for Nirmala Vastralaya,
Tamghas, Gulmi, Nepal. Established in 2002.

## Included

- Luxury maroon, ivory, and gold responsive storefront
- Sarees, coat pants, bags, shoes, bridal, traditional and everyday clothing
- Founder story, branded logo, and themed editorial photography
- Product, category, inventory, coupon, customer and order management
- Cash on Delivery and offline Fonepay QR proof workflow
- Protected administrator authentication
- PostgreSQL with Prisma
- Persistent Netlify Blob image uploads
- Contact, newsletter, SEO, sitemap and security headers

## Local development

```bash
npm install
npm run local:setup
npm run dev
```

The setup command creates a clean private preview database and prints a newly
generated local administrator password. Open `http://localhost:3000`.

Administrator login: `http://localhost:3000/admin/login`. Use the email and
one-time local password printed by `npm run local:setup`.

## Deployment

See `DEPLOYMENT.md` for the Netlify Free, Neon PostgreSQL and domain steps.
See `ADMIN_GUIDE.md` for daily store administration.

## Public repository safety

Commit the application source, Prisma schema and migrations, public images,
documentation, `.env.example`, lockfile, and Netlify configuration.

Never commit real `.env` files, credentials, database files, customer/order
exports, private payment proofs, `node_modules`, `.next`, `.netlify`, backups,
logs, ZIP archives, or a nested `.git` directory.
