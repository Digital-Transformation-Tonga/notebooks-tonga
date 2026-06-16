import { Database } from 'jsr:@db/sqlite@0.13'
import {
  buildRegistrationNumber,
  formatSequenceNumber,
  getAcceptedRegistrationNumber,
  parseRegistrationNumber,
  setDocumentRegistrationNumber,
  type MigrationEventType,
} from './registrationNumber.ts'
import { getSequenceSqlitePath, REGISTRATION_NUMBER_RETRY_LIMIT } from './vars.ts'

const SUPPORTED_TYPES = new Set<MigrationEventType>(['birth', 'death'])

let warnedMissingDb = false
const usedRegistrationNumbersInSession = new Set<string>()

const MIGRATION_ORIGINAL_REG_NUMBER_KEY = '_migrationOriginalRegistrationNumber'

export type RegistrationNumberChangeRecord = {
  entryId: string
  trackingId: string
  previous: string
  next: string
}

const successfulRegistrationNumberChanges: RegistrationNumberChangeRecord[] = []

function openDatabase(): Database {
  return new Database(getSequenceSqlitePath())
}

function getStoredSequence(
  db: Database,
  type: MigrationEventType,
  year: string
): number | undefined {
  const row = db
    .prepare('SELECT sequence FROM sequence WHERE type = ? AND year = ?')
    .get(type, year) as { sequence: number } | undefined

  return row?.sequence
}

/**
 * Same increment pattern as country-config (createSqlitedb.ts):
 * INSERT with ON CONFLICT ... DO UPDATE SET sequence = sequence + 1
 */
function incrementStoredSequence(
  db: Database,
  type: MigrationEventType,
  year: string
): number {
  db.prepare(
    `
    INSERT INTO sequence (type, year, sequence)
    VALUES (?, ?, 1)
    ON CONFLICT(type, year) DO UPDATE SET sequence = sequence + 1
  `
  ).run(type, year)

  const sequence = getStoredSequence(db, type, year)
  if (sequence === undefined) {
    throw new Error(
      `Failed to read sequence for type=${type}, year=${year} after increment`
    )
  }

  return sequence
}

/**
 * After a successful import, bump the stored sequence if it is still below
 * the sequence that was actually used. Only updates existing rows — does not
 * create or alter the table schema.
 */
export function ensureSequenceAtLeast(
  type: MigrationEventType,
  year: string,
  sequence: number
): void {
  const db = openDatabase()
  try {
    db.exec('BEGIN IMMEDIATE')
    db.prepare(
      `
      UPDATE sequence
      SET sequence = ?
      WHERE type = ? AND year = ? AND sequence < ?
    `
    ).run(sequence, type, year, sequence)
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  } finally {
    db.close()
  }
}

/**
 * Allocates the next sequence for the given event type and year.
 * Never returns a value less than or equal to `minimumSequence`.
 * Each call increments the stored value in seq.db (same as country-config).
 */
export function allocateNextSequence(
  type: MigrationEventType,
  year: string,
  minimumSequence = 0
): number {
  const db = openDatabase()
  try {
    db.exec('BEGIN IMMEDIATE')

    let next = incrementStoredSequence(db, type, year)
    while (next <= minimumSequence) {
      next = incrementStoredSequence(db, type, year)
    }

    db.exec('COMMIT')
    return next
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  } finally {
    db.close()
  }
}

export type SequenceBaseline = {
  type: MigrationEventType
  year: string
  sequence: number
}

/**
 * Snapshot the current SQLite sequence before processing a record.
 * Used to roll back increments when the import never succeeds.
 */
export function captureDocumentSequenceBaselines(
  document: Record<string, unknown>
): SequenceBaseline[] {
  if (!isSequenceStoreConfigured()) {
    return []
  }

  const eventType = document.type
  if (eventType !== 'birth' && eventType !== 'death') {
    return []
  }

  const registrationNumber = getAcceptedRegistrationNumber(document)
  if (!registrationNumber) {
    return []
  }

  const parsed = parseRegistrationNumber(registrationNumber, eventType)
  if (!parsed) {
    return []
  }

  const db = openDatabase()
  try {
    const sequence = getStoredSequence(db, eventType, parsed.year) ?? 0
    return [{ type: eventType, year: parsed.year, sequence }]
  } finally {
    db.close()
  }
}

/**
 * Restores SQLite to the values captured before a failed record was processed.
 * Prevents sequence gaps when failures are not caused by registration numbers.
 */
export function restoreSequenceBaselines(baselines: SequenceBaseline[]): void {
  if (baselines.length === 0) {
    return
  }

  const db = openDatabase()
  try {
    db.exec('BEGIN IMMEDIATE')
    for (const { type, year, sequence } of baselines) {
      db.prepare(
        `
        UPDATE sequence
        SET sequence = ?
        WHERE type = ? AND year = ?
      `
      ).run(sequence, type, year)
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  } finally {
    db.close()
  }
}

export function isSequenceStoreConfigured(): boolean {
  try {
    Deno.statSync(getSequenceSqlitePath())
    return true
  } catch {
    if (!warnedMissingDb) {
      console.warn(
        `Sequence SQLite file not found at ${getSequenceSqlitePath()}. ` +
          'Duplicate registration number retries are disabled until the file is provided.'
      )
      warnedMissingDb = true
    }
    return false
  }
}

export function resetRegistrationNumberSession(): void {
  usedRegistrationNumbersInSession.clear()
  successfulRegistrationNumberChanges.length = 0
}

export function getRegistrationNumberChanges(): RegistrationNumberChangeRecord[] {
  return [...successfulRegistrationNumberChanges]
}

export function formatRegistrationNumberChangeLine(
  change: RegistrationNumberChangeRecord
): string {
  return (
    `trackingId=${change.trackingId}: ${change.previous} -> ${change.next} ` +
    `(sequence ${extractSequenceLabel(change.previous)} -> ${extractSequenceLabel(change.next)})`
  )
}

function rememberOriginalRegistrationNumber(
  document: Record<string, unknown>,
  registrationNumber: string
): void {
  if (!document[MIGRATION_ORIGINAL_REG_NUMBER_KEY]) {
    document[MIGRATION_ORIGINAL_REG_NUMBER_KEY] = registrationNumber
  }
}

export function recordSuccessfulRegistrationNumberChange(
  document: Record<string, unknown>
): void {
  const original = document[MIGRATION_ORIGINAL_REG_NUMBER_KEY]
  const current = getAcceptedRegistrationNumber(document)

  if (typeof original !== 'string' || !current || original === current) {
    return
  }

  successfulRegistrationNumberChanges.push({
    entryId: String(document.id ?? 'unknown'),
    trackingId: String(document.trackingId ?? 'unknown'),
    previous: original,
    next: current,
  })
}

export function isRegistrationNumberUsedInSession(
  registrationNumber: string
): boolean {
  return usedRegistrationNumbersInSession.has(registrationNumber)
}

export function markRegistrationNumberUsedInSession(
  registrationNumber: string
): void {
  usedRegistrationNumbersInSession.add(registrationNumber)
}

export function regenerateRegistrationNumber(
  currentRegistrationNumber: string,
  eventType: MigrationEventType
): string | undefined {
  if (!SUPPORTED_TYPES.has(eventType)) {
    return undefined
  }

  const parsed = parseRegistrationNumber(currentRegistrationNumber, eventType)
  if (!parsed) {
    return undefined
  }

  const nextSequence = allocateNextSequence(
    eventType,
    parsed.year,
    parsed.sequence
  )

  return buildRegistrationNumber(parsed, nextSequence)
}

export function tryAssignNewRegistrationNumber(
  document: Record<string, unknown>
): { previous: string; next: string } | undefined {
  const eventType = document.type
  if (eventType !== 'birth' && eventType !== 'death') {
    return undefined
  }

  const current = getAcceptedRegistrationNumber(document)
  if (!current) {
    return undefined
  }

  const next = regenerateRegistrationNumber(current, eventType)
  if (!next || next === current) {
    return undefined
  }

  rememberOriginalRegistrationNumber(document, current)
  setDocumentRegistrationNumber(document, next)
  return { previous: current, next }
}

function isRegistrationNumberReserved(
  registrationNumber: string,
  batchReserved: Set<string>
): boolean {
  return (
    usedRegistrationNumbersInSession.has(registrationNumber) ||
    batchReserved.has(registrationNumber)
  )
}

/**
 * Ensures the document has a registration number that is not already used
 * in this migration session or earlier items in the current batch.
 */
export function ensureUniqueRegistrationNumber(
  document: Record<string, unknown>,
  batchReserved: Set<string>
): { previous: string; next: string } | undefined {
  if (!isSequenceStoreConfigured()) {
    return undefined
  }

  const eventType = document.type
  if (eventType !== 'birth' && eventType !== 'death') {
    return undefined
  }

  let current = getAcceptedRegistrationNumber(document)
  if (!current) {
    return undefined
  }

  if (!isRegistrationNumberReserved(current, batchReserved)) {
    batchReserved.add(current)
    return undefined
  }

  for (let attempt = 1; attempt <= REGISTRATION_NUMBER_RETRY_LIMIT; attempt++) {
    const change = tryAssignNewRegistrationNumber(document)
    if (!change) {
      return undefined
    }

    current = change.next
    if (!isRegistrationNumberReserved(current, batchReserved)) {
      batchReserved.add(current)
      return change
    }
  }

  return undefined
}

export function prepareDocumentsForImport(
  documents: Record<string, unknown>[]
): void {
  if (!isSequenceStoreConfigured()) {
    return
  }

  const batchReserved = new Set<string>()

  for (const document of documents) {
    const change = ensureUniqueRegistrationNumber(document, batchReserved)
    if (change) {
      logRegistrationNumberChange(
        String(document.trackingId ?? 'unknown'),
        change.previous,
        change.next,
        0,
        'pre-import'
      )
    }
  }
}

export function commitRegistrationNumberFromDocument(
  document: Record<string, unknown>
): void {
  if (!isSequenceStoreConfigured()) {
    return
  }

  const eventType = document.type
  if (eventType !== 'birth' && eventType !== 'death') {
    return
  }

  const registrationNumber = getAcceptedRegistrationNumber(document)
  if (!registrationNumber) {
    return
  }

  recordSuccessfulRegistrationNumberChange(document)
  markRegistrationNumberUsedInSession(registrationNumber)

  const parsed = parseRegistrationNumber(registrationNumber, eventType)
  if (!parsed) {
    return
  }

  ensureSequenceAtLeast(eventType, parsed.year, parsed.sequence)
}

export function commitRegistrationNumbersFromDocuments(
  documents: Record<string, unknown>[]
): void {
  for (const document of documents) {
    commitRegistrationNumberFromDocument(document)
  }
}

export function logRegistrationNumberChange(
  trackingId: string,
  previous: string,
  next: string,
  attempt: number,
  phase: 'pre-import' | 'retry' = 'retry'
) {
  const label =
    phase === 'pre-import'
      ? 'Registration number pre-assigned'
      : `Registration number retry #${attempt}`

  console.warn(
    `${label} for trackingId=${trackingId}: ` +
      `${previous} -> ${next} (sequence ${extractSequenceLabel(previous)} -> ${extractSequenceLabel(next)})`
  )
}

function extractSequenceLabel(registrationNumber: string): string {
  const parts = registrationNumber.split('/')
  if (parts.length === 5) {
    return parts[3]
  }
  if (parts.length === 4) {
    return parts[2]
  }
  return registrationNumber
}

export { formatSequenceNumber }
