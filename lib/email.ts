import nodemailer from 'nodemailer'

const smtpPort = Number(process.env.SMTP_PORT || 587)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  disableFileAccess: true,
  disableUrlAccess: true,
  tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const emailIsConfigured = Boolean(
  process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
)

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] || character)
}

export async function sendOrderConfirmation(order: {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  paymentMethod: string
  address: string
}) {
  if (!emailIsConfigured) return

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${escapeHtml(item.name)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">NPR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: #111111; padding: 40px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px;">Nirmala Vastralaya</h1>
          <p style="color: #ffffff; margin: 8px 0 0; opacity: 0.7; font-size: 14px;">Premium Clothing & Textile Store</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="color: #111111; margin: 0 0 8px;">Order Confirmed!</h2>
          <p style="color: #666; margin: 0 0 24px;">Thank you for your order, ${escapeHtml(order.customerName)}. We've received your order and will process it shortly.</p>

          <div style="background: #f9f9f9; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
            <p style="margin: 0; color: #111; font-size: 14px;"><strong>Order Number:</strong> <span style="color: #D4AF37; font-weight: 700;">${escapeHtml(order.orderNumber)}</span></p>
            <p style="margin: 8px 0 0; color: #666; font-size: 14px;"><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}</p>
            <p style="margin: 8px 0 0; color: #666; font-size: 14px;"><strong>Delivery Address:</strong> ${escapeHtml(order.address)}</p>
          </div>

          <!-- Order Items -->
          <h3 style="color: #111; margin: 0 0 16px; font-size: 16px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; font-size: 13px; color: #666;">Product</th>
                <th style="padding: 12px; text-align: center; font-size: 13px; color: #666;">Qty</th>
                <th style="padding: 12px; text-align: right; font-size: 13px; color: #666;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 12px; font-weight: 700; font-size: 15px;">Total</td>
                <td style="padding: 16px 12px; text-align: right; font-weight: 700; font-size: 15px; color: #D4AF37;">NPR ${order.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border-top: 2px solid #f0f0f0; margin-top: 28px; padding-top: 24px;">
            <p style="color: #666; font-size: 14px; margin: 0;">For any queries, contact us:</p>
            <p style="color: #111; margin: 4px 0 0;"><strong>📞</strong> 079-520658</p>
            <p style="color: #111; margin: 4px 0 0;"><strong>📧</strong> nirmalavastralya@gmail.com</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 24px 40px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">Nirmala Vastralaya | Tamghas, Resunga Municipality, Gulmi, Nepal</p>
          <p style="color: #999; font-size: 12px; margin: 4px 0 0;">Established 2002 · Trusted for over two decades</p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber} | Nirmala Vastralaya`,
    html,
  })
}

export async function sendAdminOrderAlert(order: {
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  paymentMethod: string
}) {
  if (!emailIsConfigured) return

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
      <h2 style="color: #111; margin: 0 0 16px;">🛍️ New Order Received</h2>
      <p><strong>Order Number:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>
      <p><strong>Total:</strong> NPR ${order.total.toLocaleString()}</p>
      <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>
      <p><a href="${escapeHtml(process.env.NEXTAUTH_URL || '')}/admin/orders" style="background:#111;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block;margin-top:12px;">View Order</a></p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    subject: `New Order: ${order.orderNumber} — NPR ${order.total.toLocaleString()}`,
    html,
  })
}

export async function sendContactNotification(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  if (!emailIsConfigured) return

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    subject: `Contact Form: ${data.subject.replace(/[\r\n]+/g, ' ').slice(0, 150)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
        <h2 style="color: #111;">New Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ''}
        <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f5f5f5;padding:16px;border-radius:4px;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
      </div>
    `,
  })
}
