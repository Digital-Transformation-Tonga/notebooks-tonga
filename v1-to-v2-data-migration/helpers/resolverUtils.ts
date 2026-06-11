import { resolveAddress } from '../countryData/addressResolver.ts'
import { normalizeDateString } from './dateUtils.ts'
import {
  birthSpecialInformants,
  deathSpecialInformants,
} from '../countryData/countryResolvers.ts'
import {
  AddressLine,
  Identifier,
  Document,
  EventRegistration,
  ProcessedDocumentWithOptionType,
  PersonWithIdentifiers,
  ProcessedDocument,
} from './types.ts'

export const getIdentifier = (
  data: { identifier?: Identifier[] } | undefined,
  identifier: string
): string | undefined =>
  data?.identifier?.find(({ type }) => type === identifier)?.id

export const getDocument = (
  data: any,
  type: string
): ProcessedDocument[] | null => {
  const document = data?.registration?.attachments
    ?.filter(({ subject }: { subject: string }) => subject === type)
    ?.map((doc: Document): ProcessedDocument => {
      return {
        path: doc.uri,
        originalFilename: doc.uri.replace('/ocrvs/', ''),
        type: doc.contentType,
      }
    })[0]
  if (!document) {
    return null
  }
  return document
}
export const getDocuments = (
  data: any,
  type: string
): ProcessedDocumentWithOptionType[] | null => {
  const documents = data?.registration?.attachments
    ?.filter(({ subject }: { subject: string }) => subject === type)
    ?.map((doc: Document): ProcessedDocumentWithOptionType => {
      return {
        path: doc.uri,
        originalFilename: doc.uri.replace('/ocrvs/', ''),
        type: doc.contentType,
        option: doc.type,
      }
    })
  if (!documents?.length) {
    return null
  }
  return documents
}

export function getCustomField(data: any, id: string): any {
  return data?.questionnaire?.find(
    ({ fieldId }: { fieldId: string }) => fieldId === id
  )?.value
}

export function getCustomDateField(data: any, id: string): string | undefined {
  const value = getCustomField(data, id)
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return normalizeDateString(String(value))
}

/** V1 questionnaire values are often the strings "true"/"false"; v2 expects booleans. */
export function coerceLegacyBoolean(value: unknown): boolean {
  if (value === true || value === 'true') return true
  return false
}

/** V1 questionnaire numeric fields are often strings; v2 expects integers. */
export function coerceLegacyOptionalInt(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined
    return Math.trunc(value)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const n = parseInt(trimmed, 10)
    return Number.isNaN(n) ? undefined : n
  }
  return undefined
}

/** True when v1 stored the same primary address on father and mother (v2: father.addressSameAs = YES). */
export function isFatherAddressSameAsMother(data: EventRegistration): boolean {
  return (
    JSON.stringify(data.father?.address?.[0]) ===
    JSON.stringify(data.mother?.address?.[0])
  )
}

/** v2 hides father.addressSameAs when father or mother details are marked not available. */
export function shouldEmitFatherAddressSameAs(
  data: EventRegistration
): boolean {
  if (!data.father) return false
  if (data.father?.detailsExist === false) return false
  if (data.mother?.detailsExist === false) return false
  return true
}

/** v2 death: mother.addressSameAs is hidden when mother details are not available. */
export function shouldEmitMotherAddressSameAs(
  data: EventRegistration
): boolean {
  if (!data.mother) return false
  if (data.mother?.detailsExist === false) return false
  return true
}

export function isMotherAddressSameAsDeceased(
  data: EventRegistration
): boolean {
  return (
    JSON.stringify(data.mother?.address?.[0]) ===
    JSON.stringify(data.deceased?.address?.[0])
  )
}

/** v2 death form only shows the spouse section when the deceased was married. */
export function isSpouseSectionVisible(data: EventRegistration): boolean {
  return data.deceased?.maritalStatus === 'MARRIED'
}

function legacyPrimaryAddressSameAs(
  data: EventRegistration,
  questionnaireFieldId: string
): boolean | undefined {
  const raw = getCustomField(data, questionnaireFieldId)
  if (raw === null || raw === undefined || raw === '') return undefined
  return coerceLegacyBoolean(raw)
}

function v1AddressesMatchAfterResolve(
  data: EventRegistration,
  a: AddressLine | undefined,
  b: AddressLine | undefined
): boolean {
  const resolvedA = resolveAddress(data, a)
  const resolvedB = resolveAddress(data, b)
  if (resolvedA && resolvedB) {
    return JSON.stringify(resolvedA) === JSON.stringify(resolvedB)
  }
  return JSON.stringify(a) === JSON.stringify(b)
}

export function isSpouseAddressSameAsDeceased(
  data: EventRegistration
): boolean {
  const legacy = legacyPrimaryAddressSameAs(
    data,
    'death.spouse.primaryAddressSameAsOtherPrimary'
  )
  if (legacy === true) return true
  if (legacy === false) return false
  return v1AddressesMatchAfterResolve(
    data,
    data.deceased?.address?.[0],
    data.spouse?.address?.[0]
  )
}

export function isInformantAddressSameAsDeceased(
  data: EventRegistration
): boolean {
  const legacy = legacyPrimaryAddressSameAs(
    data,
    'death.informant.primaryAddressSameAsOtherPrimary'
  )
  if (legacy === true) return true
  if (legacy === false) return false
  return v1AddressesMatchAfterResolve(
    data,
    data.deceased?.address?.[0],
    data.informant?.address?.[0]
  )
}

/** Spouse name/address fields are hidden when spouse details are marked not available. */
export function shouldEmitSpouseDetailFields(
  data: EventRegistration
): boolean {
  if (!isSpouseSectionVisible(data)) return false
  if (data.spouse?.detailsExist === false) return false
  return true
}

export function shouldEmitSpouseAddressSameAs(
  data: EventRegistration
): boolean {
  return shouldEmitSpouseDetailFields(data)
}

/** Informant identity fields are shown when not a special informant and name/dob exist. */
export function shouldEmitInformantPersonalDetailFields(
  data: EventRegistration,
  eventType: 'birth' | 'death'
): boolean {
  if (isSpecialInformant(data.informant, eventType)) return false
  const informant = data.informant
  if (!informant) return false
  return Boolean(
    informant.name?.[0]?.firstNames ||
      informant.name?.[0]?.familyName ||
      informant.birthDate
  )
}

/** Informant addressSameAs is hidden when informant is the spouse or has no captured details. */
export function shouldEmitInformantAddressSameAs(
  data: EventRegistration,
  eventType: 'birth' | 'death'
): boolean {
  return shouldEmitInformantPersonalDetailFields(data, eventType)
}

/**
 * Special informants have their own special sections like `mother.`, `father.` or `spouse.`.
 */
export const isSpecialInformant = (
  informant: PersonWithIdentifiers | undefined,
  eventType: 'birth' | 'death'
) => {
  if (!informant?.relationship) return false

  if (eventType === 'birth') {
    return birthSpecialInformants.includes(informant.relationship)
  }

  if (eventType === 'death') {
    return deathSpecialInformants.includes(informant.relationship)
  }
  return false
}
