# Nirmala Vastralaya — Admin Guide

## Accessing the Admin Panel

URL: `https://nirmalavastralaya.com.np/admin`

There are no default credentials:
- **Email:** the value configured as `ADMIN_EMAIL`
- **Password:** the secure value configured as `ADMIN_PASSWORD`
- **Authenticator code:** required when `ADMIN_TOTP_SECRET` is configured

---

## Dashboard

The dashboard shows:
- **Revenue** — Total and this month's sales
- **Orders** — Total and pending count
- **Products** — Active product count
- **Customers** — Registered customer count
- **Recent Orders** — Last 5 orders with quick status
- **Low Stock Alerts** — Products with ≤5 units remaining

---

## Managing Products

### Add a New Product

1. Go to **Admin → Products**
2. Click **Add Product**
3. Fill in all fields:
   - **Name** — Full product name
   - **SKU** — Unique stock code (e.g. SAR-001)
   - **Category** — Select from dropdown
   - **Price** — Regular price in NPR
   - **Sale Price** — Leave empty if no discount
   - **Quantity** — Available stock
   - **Status** — Active / Inactive / Out of Stock
   - **Description** — Detailed product description
4. Upload product images (up to 10 images)
5. Check **Mark as New** for new arrivals
6. Check **Featured Product** to show on homepage
7. Click **Create Product**

### Edit a Product

1. Go to **Admin → Products**
2. Find the product using search or filters
3. Click the **pencil icon** on the right
4. Make changes and click **Update Product**

### Delete a Product

1. Click the **trash icon** next to the product
2. Confirm deletion

> ⚠️ Deletion is permanent. Consider setting status to **Inactive** instead.

---

## Managing Categories

1. Go to **Admin → Categories**
2. Click **Add Category**
3. Enter name, description, and sort order
4. Categories appear on the shop page and in filters

> Categories with products cannot be deleted. Remove products first.

---

## Managing Orders

### View Orders

Go to **Admin → Orders** to see all orders with:
- Order number and date
- Customer name and phone
- Payment method and status
- Order total
- Current status

### Update Order Status

1. Find the order in the list
2. Use the **status dropdown** to change status:
   - **PENDING** → New order, awaiting confirmation
   - **CONFIRMED** → Order confirmed
   - **PROCESSING** → Being prepared
   - **SHIPPED** → Dispatched
   - **DELIVERED** → Successfully delivered
   - **CANCELLED** → Order cancelled

### View Order Details

Click the **eye icon** on any order to see:
- Full customer information
- All ordered items with quantities
- Payment details and proof (for QR payments)
- Notes from customer

### Print Invoice

On the order detail page, click **Print Invoice** to open a printable invoice.

### Verify QR Payments

1. Open the order detail page
2. Check **Payment Status** — it shows "PENDING" for QR payments
3. Click **"View Payment Proof"** to see the screenshot uploaded by the customer
4. If valid, change **Payment Status** to **PAID**
5. Then update **Order Status** to CONFIRMED

---

## Discount Coupons

### Create a Coupon

1. Go to **Admin → Coupons**
2. Click **New Coupon**
3. Fill in:
   - **Code** — e.g. DASHAIN20 (auto-uppercased)
   - **Type** — Percentage (%) or Fixed amount (NPR)
   - **Value** — Discount amount
   - **Min Order** — Minimum cart value required (optional)
   - **Max Uses** — Leave empty for unlimited
   - **Start/End Date** — Validity period
4. Click **Create Coupon**

### Disable a Coupon

Click the status badge (Active/Inactive) to toggle it on or off instantly.

---

## Payment QR Codes

1. Go to **Admin → Settings**
2. Scroll to **Payment QR Codes**
3. The verified Nirmala Vastralaya **Fonepay** QR is already installed
4. To replace it, upload a clear PNG, JPEG or WebP image; the replacement saves automatically
5. Place a small test order and confirm that the banking app displays **Nirmala Vastralaya**

Customers can select Cash on Delivery or Fonepay. Fonepay is an offline manual
payment: the customer scans the QR, confirms the merchant name, pays through
their banking app and uploads the successful-payment screenshot for an
administrator to verify.

---

## Media Library

1. Go to **Admin → Media**
2. Drag and drop images or click **Upload Files**
3. Hover over any image to **copy its URL**
4. Use URLs in product descriptions or settings

---

## Store Settings

Go to **Admin → Settings** to update (no code changes needed):

- **Store Name**
- **Phone Number**
- **WhatsApp Number**
- **Email Address**
- **Store Address**
- **Facebook / Instagram URLs**
- **Payment QR Codes**

Click **Save All** to apply changes immediately.

---

## Customers

Go to **Admin → Customers** to view:
- All registered customers
- Contact details (name, phone, email)
- Number of orders
- Total amount spent

Use the search bar to find specific customers.

---

## Tips & Best Practices

- **Stock Management:** Keep product quantities updated. Low stock alerts show on the dashboard.
- **New Arrivals:** Check "Mark as New" for recently added products to highlight them on the store.
- **Featured Products:** Only feature 8–12 products to keep the homepage clean.
- **Sale Prices:** Always ensure sale price is lower than regular price.
- **Images:** Upload at least 2–3 images per product. First image is the main display image.
- **Order Processing:** Process orders within 24 hours and keep statuses updated.
