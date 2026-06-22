import defaultResolvers, {
  defaultBirthResolver,
  defaultDeathResolver,
} from '../../helpers/defaultResolvers.ts'
import {
  countryResolver,
  deathCountryResolver,
} from '../../countryData/countryResolvers.ts'
import type { EventRegistration, HistoryItem } from '../../helpers/types.ts'
import { buildPhoneNumber } from './phoneBuilder.ts'
import { COUNTRY_CODE } from '../../countryData/addressResolver.ts'

/**
 * Build a birth resolver with all default and country resolvers
 */
export function buildBirthResolver() {
  const allResolvers = { ...defaultResolvers, ...countryResolver }
  return { ...defaultBirthResolver, ...allResolvers }
}

/**
 * Build a death resolver with all default and country resolvers
 */
export function buildDeathResolver() {
  const allResolvers = {
    ...defaultResolvers,
    ...countryResolver,
    ...deathCountryResolver,
  }
  return { ...defaultDeathResolver, ...allResolvers }
}

/**
 * Build a basic EventRegistration for birth tests with sensible defaults
 * Includes custom fields that country resolvers might expect
 */
export function buildBirthEventRegistration(
  overrides?: Partial<EventRegistration>
): EventRegistration {
  return {
    id: '123',
    registration: {
      trackingId: 'B123456',
      registrationNumber: '2024B123456',
      contactPhoneNumber: buildPhoneNumber('7712345'),
      contactEmail: 'test@example.com',
      informantsSignature: 'data:image/png;base64,abc123',
    },
    history: [
      {
        date: '2024-01-01T10:00:00Z',
        regStatus: 'DECLARED',
        user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
        office: { id: 'office1' },
      },
    ],
    questionnaire: [],
    ...overrides,
  }
}

/**
 * Build a basic EventRegistration for death tests with sensible defaults
 */
export function buildDeathEventRegistration(
  overrides: Partial<EventRegistration> = {}
): EventRegistration {
  return {
    id: 'test-id',
    deceased: {
      id: 'deceased-id',
      name: [{ use: 'en', firstNames: 'John', familyName: 'Doe' }],
      gender: 'male',
      birthDate: '1950-01-01',
      identifier: [{ type: 'NATIONAL_ID', id: 'DEC123456' }],
      nationality: [COUNTRY_CODE],
      maritalStatus: 'MARRIED',
      address: [
        {
          type: 'PRIMARY_ADDRESS',
          line: ['123 Main St', 'Apt 4'],
          district: 'District1',
          state: 'State1',
          country: COUNTRY_CODE,
        },
      ],
      deceased: {
        deathDate: '2024-01-01',
      },
    },
    deathDate: '2024-01-01',
    informant: {
      id: 'informant-id',
      relationship: 'SON',
      name: [{ use: 'en', firstNames: 'Jane', familyName: 'Doe' }],
      birthDate: '1980-01-01',
      identifier: [{ type: 'NATIONAL_ID', id: 'INF789' }],
      address: [
        {
          type: 'PRIMARY_ADDRESS',
          line: ['456 Oak Ave'],
          district: 'District2',
          state: 'State2',
          country: COUNTRY_CODE,
        },
      ],
    },
    spouse: {
      id: 'spouse-id',
      detailsExist: true,
      name: [{ use: 'en', firstNames: 'Mary', familyName: 'Smith' }],
      birthDate: '1952-01-01',
      nationality: [COUNTRY_CODE],
      identifier: [{ type: 'NATIONAL_ID', id: 'SPO456' }],
      address: [
        {
          type: 'PRIMARY_ADDRESS',
          line: ['789 Pine Rd'],
          district: 'District3',
          state: 'State3',
          country: COUNTRY_CODE,
        },
      ],
    },
    registration: {
      trackingId: 'DW12345',
      registrationNumber: 'REG123',
      contactPhoneNumber: buildPhoneNumber('7712345'),
      contactEmail: 'contact@example.com',
    },
    history: [
      {
        date: '2024-01-15T10:00:00.000Z',
        regStatus: 'DECLARED',
        user: { id: 'user-id', role: { id: 'FIELD_AGENT' } },
        office: { id: 'office-id' },
      },
    ],
    eventLocation: {
      id: 'location-id',
      type: 'HEALTH_FACILITY',
    },
    causeOfDeathEstablished: 'true',
    causeOfDeathMethod: 'PHYSICIAN',
    mannerOfDeath: 'NATURAL_CAUSES',
    questionnaire: [
      {
        fieldId: 'death.deceased.deceased-view-group.birthRegNo',
        value: 'B123456',
      },
    ],
    ...overrides,
  } as EventRegistration
}

/**
 * Build a basic HistoryItem for action mapping tests with sensible defaults
 */
export function buildHistoryItem(
  overrides: Partial<HistoryItem> = {}
): HistoryItem {
  return {
    date: '2023-10-01T12:00:00Z',
    user: { id: 'user-123', role: { id: 'FIELD_AGENT' } },
    office: { id: 'office-456' },
    ...overrides,
  }
}

/**
 * Build a simple EventRegistration for action mapping tests
 */
export function buildSimpleEventRegistration(
  overrides: Partial<EventRegistration> = {}
): EventRegistration {
  return {
    id: 'event-123',
    registration: {
      trackingId: 'TRACK123',
      registrationNumber: 'REG123',
    },
    history: [],
    ...overrides,
  }
}
