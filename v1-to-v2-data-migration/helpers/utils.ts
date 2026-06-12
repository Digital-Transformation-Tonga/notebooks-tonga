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

export const migrationProgress = {
  importedCount: 0,
  reset(skip: number) {
    this.importedCount = skip
  },
  recordImported(count: number) {
    this.importedCount += count
  },
  logResumeHint() {
    const errorRecordCount = this.importedCount + 1
    console.error(`ERROR RECORD COUNT: ${errorRecordCount}`)
    console.error(
      `Resume with skip: ${errorRecordCount} to start from record ${errorRecordCount + 1}`
    )
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

export const getIndexErrors = (
  indexResult: IndexResult
): string[] | undefined => {
  if (indexResult.result?.data?.json?.errors) {
    return indexResult.result.data.json.items
      ?.filter((x: { index: { error: any } }) => x.index?.error)
      .map((x: { index: { error: { reason: any } } }) => x.index.error.reason)
  }
}

type ImportItem = {
  entryId: string
  document: Record<string, unknown>
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
      console.error(
        `ISOLATED FAILING RECORD: entryId=${item?.entryId}, trackingId=${item?.document?.trackingId}`
      )
      throw err
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
