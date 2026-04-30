import {
  birthSpecialInformants,
  deathSpecialInformants,
} from '../countryData/countryResolvers.ts'
import {
  Identifier,
  Document,
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
