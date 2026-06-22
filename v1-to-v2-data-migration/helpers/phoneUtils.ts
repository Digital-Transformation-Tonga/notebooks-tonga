import { COUNTRY_PHONE_CODE } from '../countryData/addressResolver.ts'

const LOCAL_PHONE_DIGITS = 7

export function isPhoneField(fieldId: string): boolean {
  return fieldId.endsWith('.phoneNo')
}

/**
 * Normalizes legacy v1 phone values to v2 Tonga format: +676XXXXXXX
 * (country code +676 followed by exactly 7 digits).
 */
export function normalizePhoneNumber(
  phone: string | undefined | null
): string | undefined {
  if (phone === null || phone === undefined) {
    return undefined
  }

  const trimmed = phone.trim()
  if (trimmed === '') {
    return undefined
  }

  const countryDigits = COUNTRY_PHONE_CODE.replace('+', '')
  let digits = trimmed.replace(/\D/g, '')

  if (digits.startsWith(countryDigits)) {
    digits = digits.slice(countryDigits.length)
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  if (digits.length !== LOCAL_PHONE_DIGITS) {
    return undefined
  }

  return `${COUNTRY_PHONE_CODE}${digits}`
}
