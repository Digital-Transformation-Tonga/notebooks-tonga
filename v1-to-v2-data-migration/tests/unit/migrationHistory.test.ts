import { assertEquals } from 'jsr:@std/assert'
import {
  appendFailedRecord,
  appendRegistrationNumberChange,
  clearMigrationHistory,
  loadFailedRecords,
  loadRegistrationNumberChanges,
} from '../../helpers/migrationHistory.ts'
import { migrationProgress } from '../../helpers/utils.ts'
import { getRegistrationNumberChanges } from '../../helpers/registrationSequence.ts'

async function withTempHistoryPaths(
  fn: (dir: string) => void | Promise<void>
) {
  const dir = await Deno.makeTempDir()
  const failuresPath = `${dir}/failures.jsonl`
  const changesPath = `${dir}/changes.jsonl`

  Deno.env.set('MIGRATION_FAILURES_HISTORY_PATH', failuresPath)
  Deno.env.set('MIGRATION_REG_CHANGES_HISTORY_PATH', changesPath)

  try {
    await fn(dir)
  } finally {
    Deno.env.delete('MIGRATION_FAILURES_HISTORY_PATH')
    Deno.env.delete('MIGRATION_REG_CHANGES_HISTORY_PATH')
    await Deno.remove(dir, { recursive: true })
  }
}

Deno.test('append and load migration history across runs', async () => {
  await withTempHistoryPaths(() => {
    appendFailedRecord({
      recordNumber: 10,
      entryId: 'entry-1',
      trackingId: 'TRACK01',
      error: '500 error',
    })
    appendRegistrationNumberChange({
      entryId: 'entry-2',
      trackingId: 'TRACK02',
      previous: 'TONT/NB/TT/1/2017',
      next: 'TONT/NB/TT/99/2017',
    })

    assertEquals(loadFailedRecords().length, 1)
    assertEquals(loadRegistrationNumberChanges().length, 1)

    clearMigrationHistory()
    assertEquals(loadFailedRecords().length, 0)
    assertEquals(loadRegistrationNumberChanges().length, 0)
  })
})
Deno.test('buildSummaryLines reads cumulative history from disk at completion', async () => {
  await withTempHistoryPaths(() => {
    appendFailedRecord({
      recordNumber: 99,
      entryId: 'disk-fail',
      trackingId: 'DISK01',
      error: 'from prior run',
    })
    appendRegistrationNumberChange({
      entryId: 'disk-change',
      trackingId: 'DISK02',
      previous: 'TONT/NB/TT/1/2017',
      next: 'TONT/NB/TT/2/2017',
    })

    migrationProgress.reset(100)

    const lines = migrationProgress.buildSummaryLines('birth')

    assertEquals(lines.includes('Failed: 1'), true)
    assertEquals(lines.some((line) => line.includes('DISK01')), true)
    assertEquals(lines.includes('Registration number changes: 1'), true)
    assertEquals(lines.some((line) => line.includes('DISK02')), true)
    assertEquals(
      lines.some((line) =>
        line.includes('include all resumed runs')
      ),
      true
    )

    migrationProgress.reset(0)
  })
})

Deno.test('migrationProgress.reset loads prior run history when resuming', async () => {
  await withTempHistoryPaths(() => {
    appendFailedRecord({
      recordNumber: 5,
      entryId: 'prior-fail',
      trackingId: 'PRIOR01',
      error: 'prior error',
    })
    appendRegistrationNumberChange({
      entryId: 'prior-change',
      trackingId: 'PRIOR02',
      previous: 'TONT/NB/TT/10/2018',
      next: 'TONT/NB/TT/11/2018',
    })

    migrationProgress.reset(100)

    assertEquals(migrationProgress.importedCount, 100)
    assertEquals(migrationProgress.failedRecords.length, 1)
    assertEquals(migrationProgress.failedRecords[0].trackingId, 'PRIOR01')
    assertEquals(getRegistrationNumberChanges().length, 1)
    assertEquals(getRegistrationNumberChanges()[0].trackingId, 'PRIOR02')

    migrationProgress.recordFailure(
      'new-fail',
      'NEW01',
      'new error'
    )

    assertEquals(loadFailedRecords().length, 2)

    const lines = migrationProgress.buildSummaryLines('birth')
    assertEquals(lines.includes('Failed: 2'), true)
    assertEquals(lines.includes('Registration number changes: 1'), true)
    assertEquals(lines.some((line) => line.includes('PRIOR01')), true)
    assertEquals(lines.some((line) => line.includes('NEW01')), true)

    migrationProgress.reset(0)
  })
})
