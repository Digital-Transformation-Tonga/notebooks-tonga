import { FormCollection, FormFieldWithId } from './types.ts'
import {
  captureDocumentSequenceBaselines,
  commitRegistrationNumbersFromDocuments,
  isSequenceStoreConfigured,
  logRegistrationNumberChange,
  prepareDocumentsForImport,
  formatRegistrationNumberChangeLine,
  getRegistrationNumberChanges,
  resetRegistrationNumberSession,
  restoreSequenceBaselines,
  tryAssignNewRegistrationNumber,
} from './registrationSequence.ts'
import { REGISTRATION_NUMBER_RETRY_LIMIT } from './vars.ts'

export const extractFieldType = (obj: any, fieldName: string): unknown[] => {
  const fields: unknown[] = []

  function recurse(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach((item) => recurse(item))
    } else if (value !== null && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        if (key === fieldName) {
          fields.push(val)
        }
        recurse(val)
      }
    }
  }

  recurse(obj)
  return fields.flatMap((x) => x)
}

export const extractFormFields = (
  form: FormCollection,
  formName: string | number
): FormFieldWithId[] =>
  form[formName].sections
    .map((section) =>
      section.groups.flatMap((group) =>
        group.fields.map((field) => ({
          ...field,
          id:
            field.customQuestionMappingId ||
            `${formName}.${section.id}.${field.name}`,
        }))
      )
    )
    .flatMap((x) => x)

type FailedRecord = {
  recordNumber: number
  entryId: string
  trackingId: string
  error: string
}

export const migrationProgress = {
  importedCount: 0,
  failedRecords: [] as FailedRecord[],
  reset(skip: number) {
    this.importedCount = skip
    this.failedRecords = []
    resetRegistrationNumberSession()
  },
  recordImported(count: number) {
    this.importedCount += count
  },
  getNextRecordNumber() {
    return this.importedCount + this.failedRecords.length + 1
  },
  recordFailure(
    entryId: string,
    trackingId: string | undefined,
    error: string,
    options?: { wasImported?: boolean }
  ) {
    const reason = error.trim() || 'Unknown error'
    const recordNumber = this.getNextRecordNumber()

    this.failedRecords.push({
      recordNumber,
      entryId,
      trackingId: trackingId ?? 'unknown',
      error: reason,
    })

    console.error(
      `SKIPPED RECORD #${recordNumber}: entryId=${entryId}, trackingId=${trackingId ?? 'unknown'}, reason=${reason}`
    )

    if (options?.wasImported) {
      this.importedCount = Math.max(0, this.importedCount - 1)
    }
  },
  logResumeHint() {
    const errorRecordCount = this.getNextRecordNumber()
    console.error(`ERROR RECORD COUNT: ${errorRecordCount}`)
    console.error(
      `Resume with skip: ${errorRecordCount} to start from record ${errorRecordCount + 1}`
    )
  },
  logSummary(eventLabel: string) {
    console.log('')
    console.log(`MIGRATION COMPLETE: ${eventLabel}`)
    console.log(`Imported: ${this.importedCount}`)
    console.log(`Failed: ${this.failedRecords.length}`)

    if (this.failedRecords.length > 0) {
      console.error('Failed records:')
      for (const record of this.failedRecords) {
        console.error(
          `  #${record.recordNumber}: entryId=${record.entryId}, trackingId=${record.trackingId}, reason=${record.error}`
        )
      }
    }

    const registrationNumberChanges = getRegistrationNumberChanges()
    console.log(`Registration number changes: ${registrationNumberChanges.length}`)

    if (registrationNumberChanges.length > 0) {
      console.warn('Changed registration numbers:')
      for (const change of registrationNumberChanges) {
        console.warn(`  ${formatRegistrationNumberChangeLine(change)}`)
      }
    }
  },
}

export const getPaginationSkip = (recordSkip: number, pageSize: number) => {
  const startPage = Math.floor(recordSkip / pageSize) + 1
  const skipWithinPage = recordSkip % pageSize

  return {
    startPage,
    skipWithinPage,
    totalProcessed: recordSkip,
  }
}

export function batch<T>(items: T[], batchSize: number): T[][] {
  if (batchSize <= 0) {
    throw new Error('batchSize must be greater than 0')
  }

  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return batches
}

type IndexResult = {
  result: {
    data: {
      json: {
        errors: any
        items: any[]
      }
    }
  }
}

type ImportItem = {
  entryId: string
  document: Record<string, unknown>
}

export const formatErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  if (typeof err === 'string') {
    return err
  }

  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

const formatIndexError = (error: Record<string, unknown>) => {
  return [
    error.reason,
    error.message,
    error.type,
    error.code,
  ]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map(String)
    .join(' | ') || 'Index error'
}

export const getIndexErrors = (
  indexResult: IndexResult
): string[] | undefined => {
  if (indexResult.result?.data?.json?.errors) {
    return indexResult.result.data.json.items
      ?.filter((x: { index: { error: any } }) => x.index?.error)
      .map((x: { index: { error: { reason: any } } }) => x.index.error.reason)
  }
}

export const recordIndexErrors = (
  indexResult: IndexResult | undefined,
  items: ImportItem[]
) => {
  if (!indexResult?.result?.data?.json?.errors) {
    return
  }

  const resultItems = indexResult.result.data.json.items ?? []

  for (let i = 0; i < resultItems.length; i++) {
    const resultItem = resultItems[i]
    if (!resultItem.index?.error) {
      continue
    }

    const item = items[i]
    const reason = formatIndexError(resultItem.index.error ?? {})
    migrationProgress.recordFailure(
      item?.entryId ?? 'unknown',
      String(item?.document?.trackingId ?? ''),
      reason,
      { wasImported: true }
    )
  }
}

type ImportFn = (
  documents: Record<string, unknown>[],
  token: string,
  context?: { entryIds?: string[]; trackingIds?: string[] }
) => Promise<unknown>

const toImportContext = (items: ImportItem[]) => ({
  entryIds: items.map((item) => item.entryId),
  trackingIds: items.map((item) => String(item.document.trackingId ?? '')),
})

const isRetryableImportError = (err: unknown) => {
  const message = formatErrorMessage(err)
  return (
    message.includes('500') ||
    message.includes('INTERNAL_SERVER_ERROR') ||
    message.includes('duplicate') ||
    message.includes('unique constraint')
  )
}

const importSingleItem = async (
  item: ImportItem,
  token: string,
  importFn: ImportFn
) => {
  const context = toImportContext([item])
  const result = await importFn([item.document], token, context)
  commitRegistrationNumbersFromDocuments([item.document])
  return result
}

const processSingleRecordImport = async (
  item: ImportItem,
  token: string,
  importFn: ImportFn
): Promise<{ success: true; result: unknown } | { success: false; error: unknown }> => {
  const baselines = captureDocumentSequenceBaselines(item.document)
  const trackingId = String(item.document.trackingId ?? 'unknown')

  prepareDocumentsForImport([item.document])

  try {
    const result = await importSingleItem(item, token, importFn)
    return { success: true, result }
  } catch (initialError) {
    if (!isSequenceStoreConfigured() || !isRetryableImportError(initialError)) {
      restoreSequenceBaselines(baselines)
      return { success: false, error: initialError }
    }

    for (let attempt = 1; attempt <= REGISTRATION_NUMBER_RETRY_LIMIT; attempt++) {
      const change = tryAssignNewRegistrationNumber(item.document)
      if (!change) {
        restoreSequenceBaselines(baselines)
        return { success: false, error: initialError }
      }

      logRegistrationNumberChange(
        trackingId,
        change.previous,
        change.next,
        attempt,
        'retry'
      )

      try {
        const result = await importSingleItem(item, token, importFn)
        console.warn(
          `Registration number retry succeeded for trackingId=${trackingId} ` +
            `using ${change.next}`
        )
        return { success: true, result }
      } catch (retryError) {
        if (attempt === REGISTRATION_NUMBER_RETRY_LIMIT) {
          console.error(
            `Registration number retries exhausted for trackingId=${trackingId}: ` +
              formatErrorMessage(retryError)
          )
        }
      }
    }

    restoreSequenceBaselines(baselines)
    console.warn(
      `Restored sequence baseline for trackingId=${trackingId} ` +
        'after failed import (sequence was not consumed)'
    )
    return { success: false, error: initialError }
  }
}

export const bulkImportIsolatingFailures = async (
  items: ImportItem[],
  token: string,
  importFn: ImportFn
): Promise<unknown> => {
  if (items.length <= 1) {
    const item = items[0]
    const outcome = await processSingleRecordImport(item, token, importFn)

    if (outcome.success) {
      migrationProgress.recordImported(1)
      return outcome.result
    }

    migrationProgress.recordFailure(
      item?.entryId ?? 'unknown',
      String(item?.document?.trackingId ?? ''),
      formatErrorMessage(outcome.error)
    )
    return undefined
  }

  const documents = items.map((item) => item.document)
  prepareDocumentsForImport(documents)
  const context = toImportContext(items)

  try {
    const result = await importFn(documents, token, context)
    commitRegistrationNumbersFromDocuments(documents)
    migrationProgress.recordImported(items.length)
    return result
  } catch (err) {
    const mid = Math.floor(items.length / 2)

    const leftResult = await bulkImportIsolatingFailures(
      items.slice(0, mid),
      token,
      importFn
    )
    const rightResult = await bulkImportIsolatingFailures(
      items.slice(mid),
      token,
      importFn
    )
    return rightResult ?? leftResult
  }
}
