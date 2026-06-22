import { transform } from '../../helpers/transform.ts'
import { assertEquals } from 'https://deno.land/std@0.210.0/assert/mod.ts'
import {
  buildBirthResolver,
  buildBirthEventRegistration,
} from '../utils/testHelpers.ts'
import { buildPhoneNumber } from '../utils/phoneBuilder.ts'

// Construct birthResolver as in migrate.ipynb
const birthResolver = buildBirthResolver()

Deno.test('birthResolver - child fields', async (t) => {
  await t.step('should resolve child.name fields', () => {
    const registration = buildBirthEventRegistration({
      child: {
        name: [
          {
            firstNames: 'John',
            middleName: 'Paul',
            familyName: 'Smith',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.name'], {
      firstname: 'John',
      middleName: 'Paul',
      surname: 'Smith',
    })
  })

  await t.step('should resolve child.gender', () => {
    const registration = buildBirthEventRegistration({
      child: { gender: 'male' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.gender'], 'male')
  })

  await t.step('should resolve child.dob', () => {
    const registration = buildBirthEventRegistration({
      child: { birthDate: '2024-01-15' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.dob'], '2024-01-15')
  })

  await t.step('should resolve child.birthInstitution for HEALTH_FACILITY', () => {
    const registration = buildBirthEventRegistration({
      eventLocation: { type: 'HEALTH_FACILITY', id: 'facility1' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['child.birthInstitution'],
      'HEALTH_FACILITY'
    )
  })

  await t.step('should resolve child.birthLocation for HEALTH_FACILITY', () => {
    const registration = buildBirthEventRegistration({
      eventLocation: { type: 'HEALTH_FACILITY', id: 'facility1' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.birthLocation'], 'facility1')
  })

  await t.step('should resolve child.attendantAtBirth', () => {
    const registration = buildBirthEventRegistration({
      attendantAtBirth: 'PHYSICIAN',
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['child.attendantAtBirth'],
      'PHYSICIAN'
    )
  })

  await t.step('should resolve child.birthType', () => {
    const registration = buildBirthEventRegistration({
      birthType: 'TWIN',
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.birthType'], 'TWIN')
  })

  await t.step('should resolve child.weightAtBirth', () => {
    const registration = buildBirthEventRegistration({
      weightAtBirth: 3.5,
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.weightAtBirth'], 3.5)
  })

  await t.step('should resolve child.reason from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.child.child-view-group.reasonForLateRegistration',
          value: 'Late notification',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['child.reason'],
      'Late notification'
    )
  })

  await t.step('should omit child.nonTonganBirth when not explicitly true', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.child.child-view-group.nonTongan',
          value: 'false',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.nonTonganBirth'], undefined)
  })

  await t.step('should resolve child.nonTonganBirth when explicitly true', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.child.child-view-group.nonTongan',
          value: 'true',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.nonTonganBirth'], true)
  })

  await t.step('should omit child.foreignBirth when non-Tongan birth', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.child.child-view-group.nonTongan',
          value: 'true',
        },
        {
          fieldId: 'birth.child.child-view-group.foreignBirth',
          value: 'false',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.foreignBirth'], undefined)
  })

  await t.step('should resolve child.foreignBirth when Tongan birth path', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.child.child-view-group.nonTongan',
          value: 'false',
        },
        {
          fieldId: 'birth.child.child-view-group.foreignBirth',
          value: 'true',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.foreignBirth'], true)
  })

  await t.step('should resolve child.nid', () => {
    const registration = buildBirthEventRegistration({
      child: {
        identifier: [{ id: '1234567890', type: 'NATIONAL_ID' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['child.nid'], '1234567890')
  })
})

Deno.test('birthResolver - mother fields', async (t) => {
  await t.step('should omit mother.detailsNotAvailable when mother has details', () => {
    const registration = buildBirthEventRegistration({
      mother: { detailsExist: true },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['mother.detailsNotAvailable'],
      undefined
    )
  })

  await t.step('should resolve mother.detailsNotAvailable when true', () => {
    const registration = buildBirthEventRegistration({
      mother: { detailsExist: false },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.detailsNotAvailable'], true)
  })

  await t.step('should resolve mother.reason', () => {
    const registration = buildBirthEventRegistration({
      mother: { reasonNotApplying: 'Mother unknown' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.reason'], 'Mother unknown')
  })

  await t.step('should resolve mother.name', () => {
    const registration = buildBirthEventRegistration({
      mother: {
        name: [
          {
            firstNames: 'Jane',
            middleName: 'Marie',
            familyName: 'Doe',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.name'], {
      firstname: 'Jane',
      middleName: 'Marie',
      surname: 'Doe',
    })
  })

  await t.step('should resolve mother.dob', () => {
    const registration = buildBirthEventRegistration({
      mother: { birthDate: '1990-05-15' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.dob'], '1990-05-15')
  })

  await t.step('should resolve mother.dobUnknown', () => {
    const registration = buildBirthEventRegistration({
      mother: { exactDateOfBirthUnknown: true },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.dobUnknown'], true)
  })

  await t.step('should resolve mother.age with asOfDateRef', () => {
    const registration = buildBirthEventRegistration({
      mother: { ageOfIndividualInYears: 30 },
      child: { birthDate: '2024-01-15' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.age'], {
      age: 30,
      asOfDateRef: 'child.dob',
    })
  })

  await t.step('should resolve mother.nationality', () => {
    const registration = buildBirthEventRegistration({
      mother: { nationality: ['FAR'] },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.nationality'], 'FAR')
  })

  await t.step('should resolve mother.maritalStatus', () => {
    const registration = buildBirthEventRegistration({
      mother: { maritalStatus: 'MARRIED' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.maritalStatus'], 'MARRIED')
  })

  await t.step('should resolve mother.educationalAttainment', () => {
    const registration = buildBirthEventRegistration({
      mother: { educationalAttainment: 'ISCED_4' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['mother.educationalAttainment'],
      'ISCED_4'
    )
  })

  await t.step('should resolve mother.occupation', () => {
    const registration = buildBirthEventRegistration({
      mother: { occupation: 'Teacher' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.occupation'], 'Teacher')
  })

  await t.step('should resolve mother.previousBirths', () => {
    const registration = buildBirthEventRegistration({
      mother: { multipleBirth: 2 },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.previousBirths'], 2)
  })

  await t.step('should resolve mother.brn', () => {
    const registration = buildBirthEventRegistration({
      mother: {
        identifier: [{ id: 'B2020123456', type: 'BIRTH_REGISTRATION_NUMBER' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.brn'], 'B2020123456')
  })

  await t.step('should resolve mother.nid', () => {
    const registration = buildBirthEventRegistration({
      mother: {
        identifier: [{ id: '9876543210', type: 'NATIONAL_ID' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.nid'], '9876543210')
  })

  await t.step('should resolve mother.passport', () => {
    const registration = buildBirthEventRegistration({
      mother: {
        identifier: [{ id: 'P123456', type: 'PASSPORT' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.passport'], 'P123456')
  })

  await t.step('should resolve mother.idType from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.mother.mother-view-group.motherIdType',
          value: 'NATIONAL_ID',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.idType'], 'NATIONAL_ID')
  })

  await t.step('should resolve mother.verified from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.mother.mother-view-group.verified',
          value: 'verified',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.verified'], 'verified')
  })
})

Deno.test('birthResolver - father fields', async (t) => {
  await t.step('should resolve father.detailsNotAvailable when true', () => {
    const registration = buildBirthEventRegistration({
      father: { detailsExist: false },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.detailsNotAvailable'], true)
  })

  await t.step('should omit father.detailsNotAvailable when father has details', () => {
    const registration = buildBirthEventRegistration({
      father: { detailsExist: true, birthDate: '1980-01-01' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['father.detailsNotAvailable'],
      undefined
    )
  })

  await t.step('should resolve father.reason', () => {
    const registration = buildBirthEventRegistration({
      father: { reasonNotApplying: 'Father unknown' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.reason'], 'Father unknown')
  })

  await t.step('should resolve father.name', () => {
    const registration = buildBirthEventRegistration({
      father: {
        name: [
          {
            firstNames: 'Michael',
            familyName: 'Smith',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.name'], {
      firstname: 'Michael',
      middleName: undefined,
      surname: 'Smith',
    })
  })

  await t.step('should resolve father.dob', () => {
    const registration = buildBirthEventRegistration({
      father: { birthDate: '1988-03-20' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.dob'], '1988-03-20')
  })

  await t.step('should resolve father.dobUnknown', () => {
    const registration = buildBirthEventRegistration({
      father: { exactDateOfBirthUnknown: true },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.dobUnknown'], true)
  })

  await t.step('should resolve father.age', () => {
    const registration = buildBirthEventRegistration({
      father: { ageOfIndividualInYears: 35 },
      child: { birthDate: '2024-01-15' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.age'], {
      age: 35,
      asOfDateRef: 'child.dob',
    })
  })

  await t.step('should resolve father.nationality', () => {
    const registration = buildBirthEventRegistration({
      father: { nationality: ['USA'] },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.nationality'], 'USA')
  })

  await t.step('should resolve father.maritalStatus', () => {
    const registration = buildBirthEventRegistration({
      father: { maritalStatus: 'MARRIED' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.maritalStatus'], 'MARRIED')
  })

  await t.step('should resolve father.educationalAttainment', () => {
    const registration = buildBirthEventRegistration({
      father: { educationalAttainment: 'ISCED_5' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['father.educationalAttainment'],
      'ISCED_5'
    )
  })

  await t.step('should resolve father.occupation', () => {
    const registration = buildBirthEventRegistration({
      father: { occupation: 'Engineer' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.occupation'], 'Engineer')
  })

  await t.step('should resolve father.brn', () => {
    const registration = buildBirthEventRegistration({
      father: {
        identifier: [{ id: 'B2018654321', type: 'BIRTH_REGISTRATION_NUMBER' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.brn'], 'B2018654321')
  })

  await t.step('should resolve father.nid', () => {
    const registration = buildBirthEventRegistration({
      father: {
        identifier: [{ id: '1122334455', type: 'NATIONAL_ID' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.nid'], '1122334455')
  })

  await t.step('should resolve father.passport', () => {
    const registration = buildBirthEventRegistration({
      father: {
        identifier: [{ id: 'P654321', type: 'PASSPORT' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.passport'], 'P654321')
  })

  await t.step('should resolve father.idType from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.father.father-view-group.fatherIdType',
          value: 'PASSPORT',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.idType'], 'PASSPORT')
  })

  await t.step('should resolve father.verified from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.father.father-view-group.verified',
          value: 'failed',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.verified'], 'failed')
  })
})

Deno.test('birthResolver - informant fields', async (t) => {
  await t.step('should resolve informant.dob for non-special informant', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        birthDate: '1995-08-10',
        relationship: 'BROTHER',
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.dob'], '1995-08-10')
  })

  await t.step('should not resolve informant.dob for MOTHER', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        birthDate: '1995-08-10',
        relationship: 'MOTHER',
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.dob'], undefined)
  })

  await t.step(
    'should resolve informant.phoneNo in v2 international format',
    () => {
      const fullPhoneNumber = buildPhoneNumber('7712345')
      const registration = buildBirthEventRegistration({
        registration: {
          trackingId: 'B123456',
          contactPhoneNumber: fullPhoneNumber,
        },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['informant.phoneNo'],
        '+6767712345'
      )
    }
  )

  await t.step('should resolve informant.email', () => {
    const registration = buildBirthEventRegistration({
      registration: {
        trackingId: 'B123456',
        contactEmail: 'informant@test.com',
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.email'],
      'informant@test.com'
    )
  })

  await t.step('should resolve informant.relation', () => {
    const registration = buildBirthEventRegistration({
      informant: { relationship: 'SISTER' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.relation'], 'SISTER')
  })

  await t.step('should resolve informant.other.relation', () => {
    const registration = buildBirthEventRegistration({
      informant: { otherRelationship: 'Cousin' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.other.relation'],
      'Cousin'
    )
  })

  await t.step(
    'should resolve informant.name for non-special informant',
    () => {
      const registration = buildBirthEventRegistration({
        informant: {
          relationship: 'LEGAL_GUARDIAN',
          name: [
            {
              firstNames: 'Guardian',
              familyName: 'Jones',
            },
          ],
        },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['informant.name'], {
        firstname: 'Guardian',
        middleName: undefined,
        surname: 'Jones',
      })
    }
  )

  await t.step('should resolve informant.dobUnknown', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        relationship: 'GRANDFATHER',
        exactDateOfBirthUnknown: true,
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.dobUnknown'], true)
  })

  await t.step('should resolve informant.age', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        relationship: 'OTHER',
        ageOfIndividualInYears: 45,
      },
      child: { birthDate: '2024-01-15' },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.age'], {
      age: 45,
      asOfDateRef: 'child.dob',
    })
  })

  await t.step('should resolve informant.nationality', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        relationship: 'BROTHER',
        nationality: ['GBR'],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.nationality'], 'GBR')
  })

  await t.step('should resolve informant.brn', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        relationship: 'SISTER',
        identifier: [{ id: 'B2015987654', type: 'BIRTH_REGISTRATION_NUMBER' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.brn'], 'B2015987654')
  })

  await t.step('should resolve informant.nid', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        relationship: 'GRANDFATHER',
        identifier: [{ id: '5566778899', type: 'NATIONAL_ID' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.nid'], '5566778899')
  })

  await t.step('should resolve informant.passport', () => {
    const registration = buildBirthEventRegistration({
      informant: {
        relationship: 'OTHER',
        identifier: [{ id: 'P999888', type: 'PASSPORT' }],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.passport'], 'P999888')
  })

  await t.step('should resolve informant.idType from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.informant.informant-view-group.informantIdType',
          value: 'BIRTH_REGISTRATION_NUMBER',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.idType'],
      'BIRTH_REGISTRATION_NUMBER'
    )
  })

  await t.step('should resolve informant.verified from questionnaire', () => {
    const registration = buildBirthEventRegistration({
      questionnaire: [
        {
          fieldId: 'birth.informant.informant-view-group.verified',
          value: 'authenticated',
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.verified'],
      'authenticated'
    )
  })
})

Deno.test('birthResolver - documents fields', async (t) => {
  await t.step('should resolve documents.proofOfBirth', () => {
    const registration = buildBirthEventRegistration({
      registration: {
        trackingId: 'B123456',
        attachments: [
          {
            uri: '/documents/birth-cert.pdf',
            contentType: 'application/pdf',
            type: 'BIRTH_CERTIFICATE',
            subject: 'CHILD',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfBirth'], {
      path: '/documents/birth-cert.pdf',
      originalFilename: '/documents/birth-cert.pdf',
      type: 'application/pdf',
    })
  })

  await t.step('should resolve documents.proofOfMother', () => {
    const registration = buildBirthEventRegistration({
      registration: {
        trackingId: 'B123456',
        attachments: [
          {
            uri: '/documents/mother-id.pdf',
            contentType: 'application/pdf',
            type: 'NATIONAL_ID',
            subject: 'MOTHER',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfMother'], [
      {
        path: '/documents/mother-id.pdf',
        originalFilename: '/documents/mother-id.pdf',
        type: 'application/pdf',
        option: 'NATIONAL_ID',
      },
    ])
  })

  await t.step('should resolve documents.proofOfFather', () => {
    const registration = buildBirthEventRegistration({
      registration: {
        trackingId: 'B123456',
        attachments: [
          {
            uri: '/documents/father-id.pdf',
            contentType: 'application/pdf',
            type: 'PASSPORT',
            subject: 'FATHER',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfFather'], [
      {
        path: '/documents/father-id.pdf',
        originalFilename: '/documents/father-id.pdf',
        type: 'application/pdf',
        option: 'PASSPORT',
      },
    ])
  })

  await t.step('should resolve documents.proofOfInformant', () => {
    const registration = buildBirthEventRegistration({
      registration: {
        trackingId: 'B123456',
        attachments: [
          {
            uri: '/documents/informant-id.pdf',
            contentType: 'application/pdf',
            type: 'NATIONAL_ID',
            subject: 'INFORMANT_ID_PROOF',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfInformant'], [
      {
        path: '/documents/informant-id.pdf',
        originalFilename: '/documents/informant-id.pdf',
        type: 'application/pdf',
        option: 'NATIONAL_ID',
      },
    ])
  })

  await t.step(
    'should resolve documents.proofOther combining OTHER and LEGAL_GUARDIAN_PROOF',
    () => {
      const registration = buildBirthEventRegistration({
        registration: {
          trackingId: 'B123456',
          attachments: [
            {
              uri: '/documents/other1.pdf',
              contentType: 'application/pdf',
              type: 'OTHER_DOCUMENT',
              subject: 'OTHER',
            },
            {
              uri: '/documents/guardian.pdf',
              contentType: 'application/pdf',
              type: 'GUARDIAN_PROOF',
              subject: 'LEGAL_GUARDIAN_PROOF',
            },
          ],
        },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['documents.proofOther'], [
        {
          path: '/documents/other1.pdf',
          originalFilename: '/documents/other1.pdf',
          type: 'application/pdf',
          option: 'OTHER_DOCUMENT',
        },
        {
          path: '/documents/guardian.pdf',
          originalFilename: '/documents/guardian.pdf',
          type: 'application/pdf',
          option: 'GUARDIAN_PROOF',
        },
      ])
    }
  )
})
