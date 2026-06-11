import { assertEquals } from 'jsr:@std/assert'
import {
  isDateField,
  normalizeDateString,
  normalizeDeclarationDates,
} from '../../helpers/dateUtils.ts'

Deno.test('normalizeDateString pads single-digit month and day', () => {
  assertEquals(normalizeDateString('2025-3-3'), '2025-03-03')
})

Deno.test('normalizeDateString strips legacy datetime values', () => {
  assertEquals(
    normalizeDateString('2025-05-29 15:10:51'),
    '2025-05-29'
  )
  assertEquals(
    normalizeDateString('2025-05-30T08:45:42'),
    '2025-05-30'
  )
})

Deno.test('normalizeDateString leaves already-normalized dates unchanged', () => {
  assertEquals(normalizeDateString('2025-05-29'), '2025-05-29')
})

Deno.test('isDateField matches legacy date resolver keys', () => {
  assertEquals(isDateField('legacyInfo.legacyCreatedDate'), true)
  assertEquals(isDateField('legacyInfo.legacyAmendedDate'), true)
  assertEquals(isDateField('legacyInfo.migratedAt'), false)
})

Deno.test('normalizeDeclarationDates normalizes legacy datetime fields', () => {
  assertEquals(
    normalizeDeclarationDates({
      'legacyInfo.legacyCreatedDate': '2025-05-29 14:30:22',
      'legacyInfo.legacyAmendedDate': '2025-05-30 08:36:19',
      'legacyInfo.migratedAt': '2025-05-30 08:36:19',
      'child.firstname': 'Ana',
    }),
    {
      'legacyInfo.legacyCreatedDate': '2025-05-29',
      'legacyInfo.legacyAmendedDate': '2025-05-30',
      'legacyInfo.migratedAt': '2025-05-30 08:36:19',
      'child.firstname': 'Ana',
    }
  )
})
