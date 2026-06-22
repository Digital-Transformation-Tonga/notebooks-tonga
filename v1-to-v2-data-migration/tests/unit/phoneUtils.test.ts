import { assertEquals } from 'jsr:@std/assert'
import {
  isPhoneField,
  normalizePhoneNumber,
} from '../../helpers/phoneUtils.ts'

Deno.test('isPhoneField matches informant phone resolver key', () => {
  assertEquals(isPhoneField('informant.phoneNo'), true)
  assertEquals(isPhoneField('informant.email'), false)
})

Deno.test('normalizePhoneNumber converts legacy international format', () => {
  assertEquals(normalizePhoneNumber('+6767712345'), '+6767712345')
})

Deno.test('normalizePhoneNumber converts legacy local format with leading zero', () => {
  assertEquals(normalizePhoneNumber('07712345'), '+6767712345')
})

Deno.test('normalizePhoneNumber converts legacy local format without prefix', () => {
  assertEquals(normalizePhoneNumber('7712345'), '+6767712345')
})

Deno.test('normalizePhoneNumber rejects invalid lengths', () => {
  assertEquals(normalizePhoneNumber('0987654321'), undefined)
  assertEquals(normalizePhoneNumber('+67677123456'), undefined)
})

Deno.test('normalizePhoneNumber returns undefined for empty values', () => {
  assertEquals(normalizePhoneNumber(''), undefined)
  assertEquals(normalizePhoneNumber(undefined), undefined)
})
