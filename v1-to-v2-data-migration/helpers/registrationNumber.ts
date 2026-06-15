export type MigrationEventType = 'birth' | 'death'

export type ParsedRegistrationNumber = {
  eventType: MigrationEventType
  year: string
  sequence: number
  /** Sequence segment index in split('/') parts */
  sequenceIndex: number
  parts: string[]
}

const BIRTH_PART_COUNT = 5
const DEATH_PART_COUNT = 4

/**
 * Tonga v2 registration number formats (country-config):
 * - Birth:  {nationality}/{birthType}/{stateCode}/{sequence}/{year}
 * - Death:  {deathType}/{stateCode}/{sequence}/{year}
 */
export function parseRegistrationNumber(
  registrationNumber: string,
  eventType: MigrationEventType
): ParsedRegistrationNumber | undefined {
  const parts = registrationNumber.split('/')

  if (eventType === 'birth' && parts.length === BIRTH_PART_COUNT) {
    const sequence = Number.parseInt(parts[3], 10)
    const year = parts[4]
    if (!Number.isFinite(sequence) || !/^\d{4}$/.test(year)) {
      return undefined
    }
    return { eventType, year, sequence, sequenceIndex: 3, parts }
  }

  if (eventType === 'death' && parts.length === DEATH_PART_COUNT) {
    const sequence = Number.parseInt(parts[2], 10)
    const year = parts[3]
    if (!Number.isFinite(sequence) || !/^\d{4}$/.test(year)) {
      return undefined
    }
    return { eventType, year, sequence, sequenceIndex: 2, parts }
  }

  return undefined
}

export function formatSequenceNumber(sequence: number): string {
  return sequence.toString().padStart(4, '0')
}

export function buildRegistrationNumber(
  parsed: ParsedRegistrationNumber,
  sequence: number
): string {
  const parts = [...parsed.parts]
  parts[parsed.sequenceIndex] = formatSequenceNumber(sequence)
  return parts.join('/')
}

export function getAcceptedRegistrationNumber(
  document: Record<string, unknown>
): string | undefined {
  const actions = document.actions
  if (!Array.isArray(actions)) {
    return undefined
  }

  for (const action of actions) {
    if (
      action?.type === 'REGISTER' &&
      action?.status === 'Accepted' &&
      typeof action?.registrationNumber === 'string' &&
      action.registrationNumber.length > 0
    ) {
      return action.registrationNumber
    }
  }

  for (const action of actions) {
    if (
      action?.type === 'REGISTER' &&
      typeof action?.registrationNumber === 'string' &&
      action.registrationNumber.length > 0
    ) {
      return action.registrationNumber
    }
  }

  return undefined
}

export function setDocumentRegistrationNumber(
  document: Record<string, unknown>,
  registrationNumber: string
): void {
  const actions = document.actions
  if (!Array.isArray(actions)) {
    return
  }

  for (const action of actions) {
    if (action?.type === 'REGISTER' && action?.registrationNumber) {
      action.registrationNumber = registrationNumber
    }
  }
}
