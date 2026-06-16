import {
  getMigrationFailuresHistoryPath,
  getMigrationRegChangesHistoryPath,
} from './vars.ts'
import { dirname } from 'jsr:@std/path/dirname'

export type PersistedFailedRecord = {
  recordNumber: number
  entryId: string
  trackingId: string
  error: string
}

export type PersistedRegistrationNumberChange = {
  entryId: string
  trackingId: string
  previous: string
  next: string
}

const ensuredDirs = new Set<string>()

function ensureParentDir(path: string) {
  const dir = dirname(path)
  if (!dir || dir === '.' || ensuredDirs.has(dir)) {
    return
  }
  Deno.mkdirSync(dir, { recursive: true })
  ensuredDirs.add(dir)
}

function appendJsonLine(path: string, value: unknown) {
  ensureParentDir(path)
  Deno.writeTextFileSync(path, `${JSON.stringify(value)}\n`, { append: true })
}

function readJsonLines<T>(path: string): T[] {
  try {
    const text = Deno.readTextFileSync(path)
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as T)
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return []
    }
    throw error
  }
}

export function clearMigrationHistory(): void {
  for (const path of [
    getMigrationFailuresHistoryPath(),
    getMigrationRegChangesHistoryPath(),
  ]) {
    try {
      Deno.removeSync(path)
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error
      }
    }
  }
  ensuredDirs.clear()
}

export function loadFailedRecords(): PersistedFailedRecord[] {
  return readJsonLines<PersistedFailedRecord>(getMigrationFailuresHistoryPath())
}

export function loadRegistrationNumberChanges(): PersistedRegistrationNumberChange[] {
  return readJsonLines<PersistedRegistrationNumberChange>(
    getMigrationRegChangesHistoryPath()
  )
}

export function appendFailedRecord(record: PersistedFailedRecord): void {
  appendJsonLine(getMigrationFailuresHistoryPath(), record)
}

export function appendRegistrationNumberChange(
  change: PersistedRegistrationNumberChange
): void {
  appendJsonLine(getMigrationRegChangesHistoryPath(), change)
}
