import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'

const root = process.cwd()
const productionSchemaPath = join(root, 'prisma', 'schema.prisma')
const localSchemaPath = join(root, 'prisma', 'schema.local.prisma')
const localDatabasePath = join(tmpdir(), 'nirmala-bastralaya-preview.db').replaceAll('\\', '/')
const localDatabaseUrl = `file:${localDatabasePath}`
const localAdminEmail = 'admin@nirmalavastralaya.com.np'
const localAdminPassword = `NbLocal!${randomBytes(15).toString('base64url')}`
const localAuthSecret = randomBytes(48).toString('base64url')

const productionSchema = readFileSync(productionSchemaPath, 'utf8')
const localSchema = productionSchema
  .replace('provider = "postgresql"', 'provider = "sqlite"')
  .replaceAll(/\s+@db\.Text/g, '')
  .replaceAll(/\s+@db\.Decimal\(10,\s*2\)/g, '')
  .replace(/tags\s+String\[\]/, 'tags        Json        @default("[]")')

if (localSchema === productionSchema || !localSchema.includes('provider = "sqlite"')) {
  throw new Error('Could not prepare the local SQLite schema safely.')
}

writeFileSync(localSchemaPath, localSchema)

const localEnvironment = `DATABASE_URL="${localDatabaseUrl}"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Nirmala Bastralaya"
NEXTAUTH_SECRET="${localAuthSecret}"
ADMIN_EMAIL="${localAdminEmail}"
ADMIN_PASSWORD="${localAdminPassword}"
`
writeFileSync(join(root, '.env.local'), localEnvironment)
writeFileSync(localDatabasePath, '')

const env = {
  ...process.env,
  DATABASE_URL: localDatabaseUrl,
  ADMIN_EMAIL: localAdminEmail,
  ADMIN_PASSWORD: localAdminPassword,
}
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' })
  if (result.error) {
    console.error(`Could not run ${command}: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log('Preparing the private local preview database...')
run(process.execPath, ['node_modules/prisma/build/index.js', 'generate', '--schema', 'prisma/schema.local.prisma'])
run(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--schema', 'prisma/schema.local.prisma', '--skip-generate'])
run(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'])

console.log('')
console.log('Local setup complete.')
console.log('Run: npm run dev')
console.log('Website: http://localhost:3000')
console.log('Admin: http://localhost:3000/admin/login')
console.log(`Email: ${localAdminEmail}`)
console.log(`Password: ${localAdminPassword}`)
console.log('Keep this local password private. Running setup again creates a new one.')
