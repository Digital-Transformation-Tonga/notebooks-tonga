import { FormCollection, FormFieldWithId } from './types.ts'

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
  },
  recordImported(count: number) {
    this.importedCount += count
  },
  recordFailure(
    entryId: string,
    trackingId: string | undefined,
    error: string,
    options?: { wasImported?: boolean }
  ) {
    const reason = error.trim() || 'Unknown error'

    this.failedRecords.push({
      entryId,
      trackingId: trackingId ?? 'unknown',
      error: reason,
    })

    console.error(
      `SKIPPED RECORD: entryId=${entryId}, trackingId=${trackingId ?? 'unknown'}, reason=${reason}`
    )

    if (options?.wasImported) {
      this.importedCount = Math.max(0, this.importedCount - 1)
    }
  },
  logResumeHint() {
    const errorRecordCount = this.importedCount + 1
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
          `  entryId=${record.entryId}, trackingId=${record.trackingId}, reason=${record.error}`
        )
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

export const bulkImportIsolatingFailures = async (
  items: ImportItem[],
  token: string,
  importFn: ImportFn
): Promise<unknown> => {
  const context = toImportContext(items)

  try {
    const result = await importFn(
      items.map((item) => item.document),
      token,
      context
    )
    migrationProgress.recordImported(items.length)
    return result
  } catch (err) {
    if (items.length <= 1) {
      const item = items[0]
      migrationProgress.recordFailure(
        item?.entryId ?? 'unknown',
        String(item?.document?.trackingId ?? ''),
        formatErrorMessage(err)
      )
      return undefined
    }

    const mid = Math.floor(items.length / 2)
    console.error(
      `Bulk import failed for ${items.length} records (${context.entryIds[0]}..${context.entryIds[items.length - 1]}), splitting batch to isolate failure...`
    )

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
