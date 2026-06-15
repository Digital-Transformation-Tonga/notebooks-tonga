/**
 * Test Runner Script
 *
 * Automatically detects the country code and runs:
 * 1. All unit tests (common tests)
 * 2. Country-specific tests for the current branch
 */

import { COUNTRY_CODE } from '../countryData/addressResolver.ts'

const TESTS_DIR = new URL('.', import.meta.url).pathname

async function runTests() {
  console.log('🧪 OpenCRVS Data Migration Test Runner\n')
  console.log(`📍 Detected Country: ${COUNTRY_CODE}`)
  console.log('━'.repeat(50))

  // Build the test command
  const testPaths = [
    'unit/', // Always run common unit tests
    `${COUNTRY_CODE}/`, // Run country-specific tests
  ]

  console.log('\n📦 Test Suites:')
  console.log(`  ✓ Common tests (unit/)`)
  console.log(`  ✓ Country-specific tests (${COUNTRY_CODE}/)`)
  console.log('━'.repeat(50) + '\n')

  // Create Deno test command
  const cmd = new Deno.Command('deno', {
    args: [
      'test',
      ...testPaths,
      '--allow-read',
      '--allow-env',
      '--allow-net',
      '--allow-write',
      '--allow-ffi',
      '--allow-sys',
    ],
    cwd: TESTS_DIR,
    stdout: 'inherit',
    stderr: 'inherit',
  })

  const { code } = await cmd.output()

  if (code === 0) {
    console.log('\n' + '━'.repeat(50))
    console.log('✅ All tests passed!')
    console.log('━'.repeat(50))
  } else {
    console.log('\n' + '━'.repeat(50))
    console.log('❌ Some tests failed')
    console.log('━'.repeat(50))
    Deno.exit(code)
  }
}

if (import.meta.main) {
  await runTests()
}
