import { assertEquals } from 'jsr:@std/assert'
import { transform } from '../../helpers/transform.ts'
import { countryResolver } from '../../countryData/countryResolvers.ts'
import defaultResolvers, {
  defaultBirthResolver,
} from '../../helpers/defaultResolvers.ts'
import { buildBirthEventRegistration } from '../utils/testHelpers.ts'

const birthResolver = { ...defaultBirthResolver, ...defaultResolvers, ...countryResolver }

Deno.test('transform normalizes legacy datetime fields in action declarations', () => {
  const registration = buildBirthEventRegistration({
    history: [
      {
        date: '2025-05-29T14:30:22.000Z',
        regStatus: 'DECLARED',
        user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
        office: { id: 'office1' },
      },
      {
        date: '2025-05-29T15:10:51.000Z',
        regStatus: 'REGISTERED',
        user: { id: 'user1', role: { id: 'REGISTRAR' } },
        office: { id: 'office1' },
      },
    ],
    questionnaire: [
      {
        fieldId:
          'birth.dataMigration.dataMigration-view-group.legacyCreatedDate',
        value: '2025-05-29 14:30:22',
      },
      {
        fieldId:
          'birth.dataMigration.dataMigration-view-group.legacyAmendedDate',
        value: '2025-05-29 15:10:51',
      },
      {
        fieldId:
          'birth.dataMigration.dataMigration-view-group.legacyRegistrationDate',
        value: '2025-05-28 09:02:45',
      },
      {
        fieldId:
          'birth.dataMigration.dataMigration-view-group.migratedAt',
        value: '2025-05-30 08:36:19',
      },
    ],
  })

  const document = transform(registration, birthResolver, 'birth')
  const declarations = document.actions
    .map((action) => action.declaration)
    .filter((declaration) => declaration && Object.keys(declaration).length > 0)

  assertEquals(declarations.length > 0, true)

  for (const declaration of declarations) {
    assertEquals(
      declaration['legacyInfo.legacyCreatedDate'],
      '2025-05-29'
    )
    assertEquals(
      declaration['legacyInfo.legacyAmendedDate'],
      '2025-05-29'
    )
    assertEquals(
      declaration['legacyInfo.legacyRegistrationDate'],
      '2025-05-28'
    )
    assertEquals(declaration['legacyInfo.migratedAt'], '2025-05-30')
  }
})
