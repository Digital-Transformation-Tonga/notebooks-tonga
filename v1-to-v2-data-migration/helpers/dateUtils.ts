/**
 * @example
 * normalizeDateString('2025-3-3') // returns '2025-03-03'
 * normalizeDateString('2025-05-29 15:10:51') // returns '2025-05-29'
 */
export function normalizeDateString(
  dateStr: string | undefined
): string | undefined {
  if (!dateStr) {
    return dateStr
  }

  const str = dateStr.toString().trim()

  // Legacy v1 datetime strings: '2025-05-29 15:10:51' or ISO '2025-05-29T15:10:51'
  const datetimePattern = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T]/
  const datetimeMatch = str.match(datetimePattern)
  if (datetimeMatch) {
    const [, year, month, day] = datetimeMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const datePattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  const match = str.match(datePattern)

  if (!match) {
    return dateStr
  }

  const [, year, month, day] = match

  const paddedMonth = month.padStart(2, '0')
  const paddedDay = day.padStart(2, '0')

  return `${year}-${paddedMonth}-${paddedDay}`
}

export function isDateField(fieldId: string): boolean {
  const dateFieldPatterns = [
    'BirthDate',
    'birthDate',
    'Date',
    'deathDate',
    '.dob',
    '.date',
    'grantDate',
  ]
  return dateFieldPatterns.some((pattern) => fieldId.includes(pattern))
}

export function normalizeDeclarationDates(
  declaration: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!declaration) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(declaration).map(([key, value]) => {
      if (typeof value === 'string' && isDateField(key)) {
        return [key, normalizeDateString(value)]
      }
      return [key, value]
    })
  )
}
