// @ts-nocheck - Using Deno-specific environment variables
import { fromFileUrl } from 'jsr:@std/path/from-file-url'

export const DOMAIN = Deno?.env?.get('OPENCRVS_DOMAIN') || 'localhost'
export const EVENT = Deno?.env?.get('OPENCRVS_EVENT') || 'birth'
export const RECORD_SKIP = Number(Deno?.env?.get('RECORD_SKIP')) || 0
export const CLIENT_ID = Deno?.env?.get('OPENCRVS_CLIENT_ID')
export const CLIENT_SECRET = Deno?.env?.get('OPENCRVS_CLIENT_SECRET')
export const ADMIN_USERNAME =
  Deno?.env?.get('OPENCRVS_ADMIN_USERNAME') || 'j.campbell'
export const ADMIN_PASSWORD =
  Deno?.env?.get('OPENCRVS_ADMIN_PASSWORD') || 'test'
export const REGISTRAR_USERNAME =
  Deno?.env?.get('OPENCRVS_REGISTRAR_USERNAME') || 'k.mweene'
export const REGISTRAR_PASSWORD =
  Deno?.env?.get('OPENCRVS_REGISTRAR_PASSWORD') || 'test'
export const SEQUENCE_SQLITE_PATH =
  Deno?.env?.get('SEQUENCE_SQLITE_PATH') ||
  fromFileUrl(new URL('../data/seq.db', import.meta.url))

export function getSequenceSqlitePath(): string {
  return Deno?.env?.get('SEQUENCE_SQLITE_PATH') || SEQUENCE_SQLITE_PATH
}
export const REGISTRATION_NUMBER_RETRY_LIMIT = Number(
  Deno?.env?.get('REGISTRATION_NUMBER_RETRY_LIMIT') || 10
)
export const MIGRATION_SUMMARY_PATH =
  Deno?.env?.get('MIGRATION_SUMMARY_PATH') || 'tmp/migration-summary.txt'

export function getMigrationSummaryPath(): string {
  return Deno?.env?.get('MIGRATION_SUMMARY_PATH') || MIGRATION_SUMMARY_PATH
}
