import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

migrate(db, { migrationsFolder: './drizzle' }).then(() => {
  console.log('Migration complete')
  process.exit(0)
}).catch((err) => {
  console.error('Migration failed', err)
  process.exit(1)
})
