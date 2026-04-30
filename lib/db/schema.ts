import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default(''),
  location: text('location').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  status: text('status').notNull().default('active'), // active | completed | archived
  leadCount: integer('lead_count').notNull().default(0),
})

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').default(''),
  emailNorm: text('email_norm').default(''),
  phone: text('phone').default(''),
  phoneNorm: text('phone_norm').default(''),
  company: text('company').default(''),
  designation: text('designation').default(''),
  website: text('website').default(''),
  address: text('address').default(''),
  notes: text('notes').default(''),
  salesComments: text('sales_comments').default(''),
  scannedAt: timestamp('scanned_at').defaultNow().notNull(),
  savedBy: text('saved_by').default(''),
  savedByEmail: text('saved_by_email').default(''),
  submittedByName: text('submitted_by_name').default(''),
  submittedByEmail: text('submitted_by_email').default(''),
  eventId: text('event_id').notNull().default('general'),
  leadType: text('lead_type').notNull().default('Warm'), // Hot | Warm | Cold
  imageUrl: text('image_url').default(''),
})

export const accessLogs = pgTable('access_logs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  accessedAt: timestamp('accessed_at').defaultNow().notNull(),
  ipAddress: text('ip_address').default(''),
  userAgent: text('user_agent').default(''),
})

export type Event = typeof events.$inferSelect
export type Lead = typeof leads.$inferSelect
export type AccessLog = typeof accessLogs.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type NewLead = typeof leads.$inferInsert
