import { assertEquals } from 'jsr:@std/assert'
import { migrationProgress } from '../../helpers/utils.ts'
import { resetRegistrationNumberSession } from '../../helpers/registrationSequence.ts'

Deno.test('buildSummaryLines includes failed records and resume hint', () => {
  resetRegistrationNumberSession()
  migrationProgress.reset(0)
  migrationProgress.importedCount = 2

  migrationProgress.failedRecords.push({
    recordNumber: 3,
    entryId: 'entry-fail',
    trackingId: 'BFAIL01',
    error: 'Event creation failed: 500',
  })

  const lines = migrationProgress.buildSummaryLines('birth')

  assertEquals(lines.includes('MIGRATION COMPLETE: birth'), true)
  assertEquals(lines.includes('Imported: 2'), true)
  assertEquals(lines.includes('Failed: 1'), true)
  assertEquals(
    lines.some((line) => line.includes('trackingId=BFAIL01')),
    true
  )
  assertEquals(lines.includes('Resume with skip: 4'), true)
  assertEquals(lines.includes('Registration number changes: 0'), true)
})

Deno.test('writeSummaryFile writes migration summary to disk', async () => {
  resetRegistrationNumberSession()
  migrationProgress.reset(0)
  migrationProgress.importedCount = 1

  const summaryPath = await Deno.makeTempFile({ suffix: '.txt' })
  Deno.env.set('MIGRATION_SUMMARY_PATH', summaryPath)

  try {
    migrationProgress.writeSummaryFile('death')

    const contents = await Deno.readTextFile(summaryPath)
    assertEquals(contents.includes('MIGRATION COMPLETE: death'), true)
    assertEquals(contents.includes('Imported: 1'), true)
  } finally {
    Deno.env.delete('MIGRATION_SUMMARY_PATH')
    await Deno.remove(summaryPath)
  }
})
