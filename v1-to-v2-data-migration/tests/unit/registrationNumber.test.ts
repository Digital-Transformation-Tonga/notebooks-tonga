import { assertEquals } from 'jsr:@std/assert'
import {
  buildRegistrationNumber,
  formatSequenceNumber,
  getAcceptedRegistrationNumber,
  parseRegistrationNumber,
  setDocumentRegistrationNumber,
} from '../../helpers/registrationNumber.ts'

Deno.test('parseRegistrationNumber parses Tonga birth format', () => {
  const parsed = parseRegistrationNumber('TONT/NB/TT/1862/2021', 'birth')
  assertEquals(parsed, {
    eventType: 'birth',
    year: '2021',
    sequence: 1862,
    sequenceIndex: 3,
    parts: ['TONT', 'NB', 'TT', '1862', '2021'],
  })
})

Deno.test('parseRegistrationNumber parses Tonga death format', () => {
  const parsed = parseRegistrationNumber('ND/TT/0001/2021', 'death')
  assertEquals(parsed, {
    eventType: 'death',
    year: '2021',
    sequence: 1,
    sequenceIndex: 2,
    parts: ['ND', 'TT', '0001', '2021'],
  })
})

Deno.test('buildRegistrationNumber updates only the sequence segment', () => {
  const parsed = parseRegistrationNumber('TONT/NB/TT/1862/2021', 'birth')!
  assertEquals(
    buildRegistrationNumber(parsed, 1863),
    'TONT/NB/TT/1863/2021'
  )
  assertEquals(formatSequenceNumber(1), '0001')
})

Deno.test('getAcceptedRegistrationNumber prefers Accepted REGISTER action', () => {
  const document = {
    actions: [
      { type: 'REGISTER', registrationNumber: 'OLD/NUMBER' },
      {
        type: 'REGISTER',
        status: 'Accepted',
        registrationNumber: 'TONT/NB/TT/1862/2021',
      },
    ],
  }

  assertEquals(
    getAcceptedRegistrationNumber(document),
    'TONT/NB/TT/1862/2021'
  )
})

Deno.test('setDocumentRegistrationNumber updates REGISTER actions', () => {
  const document = {
    actions: [
      { type: 'DECLARE', status: 'Accepted' },
      { type: 'REGISTER', registrationNumber: 'TONT/NB/TT/1862/2021' },
    ],
  }

  setDocumentRegistrationNumber(document, 'TONT/NB/TT/1863/2021')
  assertEquals(
    getAcceptedRegistrationNumber(document),
    'TONT/NB/TT/1863/2021'
  )
})

Deno.test('parseRegistrationNumber rejects invalid formats', () => {
  assertEquals(parseRegistrationNumber('TONT/NB/TT/1862', 'birth'), undefined)
  assertEquals(parseRegistrationNumber('ND/TT/0001', 'death'), undefined)
})
