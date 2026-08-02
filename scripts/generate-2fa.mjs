import * as OTPAuth from 'otpauth'

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
if (!email || !email.includes('@')) {
  console.error('Set ADMIN_EMAIL before generating the administrator 2FA key.')
  process.exit(1)
}

const totp = new OTPAuth.TOTP({
  issuer: 'Nirmala Vastralaya',
  label: email,
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: new OTPAuth.Secret({ size: 20 }),
})

console.log('Add this account to Google Authenticator, Microsoft Authenticator, or 1Password.')
console.log(`Account: ${email}`)
console.log(`Setup key: ${totp.secret.base32}`)
console.log(`Authenticator URI: ${totp.toString()}`)
console.log('')
console.log('Store the setup key as the private ADMIN_TOTP_SECRET environment variable.')
