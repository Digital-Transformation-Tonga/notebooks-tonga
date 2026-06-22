import { transform } from '../../helpers/transform.ts'
import {
  buildBirthResolver,
  buildDeathResolver,
  buildBirthEventRegistration,
  buildDeathEventRegistration,
} from '../utils/testHelpers.ts'
import { assertEquals } from 'https://deno.land/std@0.210.0/assert/mod.ts'

Deno.test('Corrections - Birth', async (t) => {
  const birthResolver = buildBirthResolver()

  await t.step(
    'should transform scalar field corrections with input and output',
    () => {
      const registration = buildBirthEventRegistration({
        history: [
          {
            date: '2024-01-01T10:00:00Z',
            regStatus: 'DECLARED',
            user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
            office: { id: 'office1' },
          },
          {
            date: '2024-01-02T12:00:00Z',
            action: 'REQUESTED_CORRECTION',
            user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
            office: { id: 'office1' },
            input: [
              {
                valueCode: 'informant',
                valueId: 'registrationPhone',
                value: '7888888',
              },
            ],
            output: [
              {
                valueCode: 'informant',
                valueId: 'registrationPhone',
                value: '7999999',
              },
            ],
          },
        ],
      })

      const result = transform(registration, birthResolver, 'birth')
      const correctionAction = result.actions.find(
        (a) => a.type === 'REQUEST_CORRECTION'
      )

      assertEquals(correctionAction !== undefined, true)
      assertEquals(correctionAction?.declaration, {
        'informant.phoneNo': '+6767999999',
      })
      assertEquals(
        correctionAction?.annotation?.['informant.phoneNo'],
        '+6767888888'
      )
    }
  )

  await t.step('should transform custom field corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'informant',
              valueId: 'informantIdType',
              value: 'PASSPORT',
            },
            {
              valueCode: 'informant',
              valueId: 'informantNationalId',
              value: '',
            },
          ],
          output: [
            {
              valueCode: 'informant',
              valueId: 'informantIdType',
              value: 'NATIONAL_ID',
            },
            {
              valueCode: 'informant',
              valueId: 'informantNationalId',
              value: 'NEW456',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'informant.idType': 'NATIONAL_ID',
      'informant.nid': 'NEW456',
    })
    assertEquals(correctionAction?.annotation?.['informant.idType'], 'PASSPORT')
    assertEquals(correctionAction?.annotation?.['informant.nid'], '')
  })

  await t.step('should transform name field corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'child',
              valueId: 'firstNamesEng',
              value: 'OldFirstName',
            },
            {
              valueCode: 'child',
              valueId: 'familyNameEng',
              value: 'OldLastName',
            },
          ],
          output: [
            {
              valueCode: 'child',
              valueId: 'firstNamesEng',
              value: 'NewFirstName',
            },
            {
              valueCode: 'child',
              valueId: 'familyNameEng',
              value: 'NewLastName',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'child.name': {
        firstname: 'NewFirstName',
        surname: 'NewLastName',
      },
    })
    assertEquals(correctionAction?.annotation?.['child.name'], {
      firstname: 'OldFirstName',
      surname: 'OldLastName',
    })
  })

  await t.step('should transform multiple person field corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'mother',
              valueId: 'nationality',
              value: 'USA',
            },
            {
              valueCode: 'father',
              valueId: 'nationality',
              value: 'CAN',
            },
          ],
          output: [
            {
              valueCode: 'mother',
              valueId: 'nationality',
              value: 'GBR',
            },
            {
              valueCode: 'father',
              valueId: 'nationality',
              value: 'FRA',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'mother.nationality': 'GBR',
      'father.nationality': 'FRA',
    })
    assertEquals(correctionAction?.annotation?.['mother.nationality'], 'USA')
    assertEquals(correctionAction?.annotation?.['father.nationality'], 'CAN')
  })

  await t.step('should transform age field corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'mother',
              valueId: 'ageOfIndividualInYears',
              value: '25',
            },
          ],
          output: [
            {
              valueCode: 'mother',
              valueId: 'ageOfIndividualInYears',
              value: '26',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration?.['mother.age'], {
      age: '26',
      asOfDateRef: 'child.dob',
    })
    assertEquals(correctionAction?.annotation?.['mother.age'], {
      age: '25',
      asOfDateRef: 'child.dob',
    })
  })

  await t.step('should transform child birth details corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'child',
              valueId: 'childBirthDate',
              value: '2024-01-01',
            },
            {
              valueCode: 'child',
              valueId: 'placeOfBirth',
              value: 'HEALTH_FACILITY',
            },
            {
              valueCode: 'child',
              valueId: 'attendantAtBirth',
              value: 'PHYSICIAN',
            },
            {
              valueCode: 'child',
              valueId: 'birthType',
              value: 'SINGLE',
            },
            {
              valueCode: 'child',
              valueId: 'weightAtBirth',
              value: '3.5',
            },
          ],
          output: [
            {
              valueCode: 'child',
              valueId: 'childBirthDate',
              value: '2024-01-05',
            },
            {
              valueCode: 'child',
              valueId: 'placeOfBirth',
              value: 'PRIVATE_HOME',
            },
            {
              valueCode: 'child',
              valueId: 'attendantAtBirth',
              value: 'NURSE',
            },
            {
              valueCode: 'child',
              valueId: 'birthType',
              value: 'TWIN',
            },
            {
              valueCode: 'child',
              valueId: 'weightAtBirth',
              value: '3.8',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'child.dob': '2024-01-05',
      'child.placeOfBirth': 'PRIVATE_HOME',
      'child.attendantAtBirth': 'NURSE',
      'child.birthType': 'TWIN',
      'child.weightAtBirth': '3.8',
    })
    assertEquals(correctionAction?.annotation?.['child.dob'], '2024-01-01')
    assertEquals(
      correctionAction?.annotation?.['child.placeOfBirth'],
      'HEALTH_FACILITY'
    )
    assertEquals(
      correctionAction?.annotation?.['child.attendantAtBirth'],
      'PHYSICIAN'
    )
    assertEquals(correctionAction?.annotation?.['child.birthType'], 'SINGLE')
    assertEquals(correctionAction?.annotation?.['child.weightAtBirth'], '3.5')
  })

  await t.step('should transform mother detailed corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'mother',
              valueId: 'motherBirthDate',
              value: '1990-01-01',
            },
            {
              valueCode: 'mother',
              valueId: 'exactDateOfBirthUnknown',
              value: 'false',
            },
            {
              valueCode: 'mother',
              valueId: 'maritalStatus',
              value: 'MARRIED',
            },
            {
              valueCode: 'mother',
              valueId: 'educationalAttainment',
              value: 'UPPER_SECONDARY_ISCED_3',
            },
            {
              valueCode: 'mother',
              valueId: 'occupation',
              value: 'Teacher',
            },
            {
              valueCode: 'mother',
              valueId: 'multipleBirth',
              value: '2',
            },
          ],
          output: [
            {
              valueCode: 'mother',
              valueId: 'motherBirthDate',
              value: '1990-05-15',
            },
            {
              valueCode: 'mother',
              valueId: 'exactDateOfBirthUnknown',
              value: 'true',
            },
            {
              valueCode: 'mother',
              valueId: 'maritalStatus',
              value: 'SINGLE',
            },
            {
              valueCode: 'mother',
              valueId: 'educationalAttainment',
              value: 'POST_SECONDARY_ISCED_4',
            },
            {
              valueCode: 'mother',
              valueId: 'occupation',
              value: 'Doctor',
            },
            {
              valueCode: 'mother',
              valueId: 'multipleBirth',
              value: '3',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'mother.dob': '1990-05-15',
      'mother.dobUnknown': 'true',
      'mother.maritalStatus': 'SINGLE',
      'mother.educationalAttainment': 'POST_SECONDARY_ISCED_4',
      'mother.occupation': 'Doctor',
      'mother.previousBirths': '3',
    })
    assertEquals(correctionAction?.annotation?.['mother.dob'], '1990-01-01')
    assertEquals(correctionAction?.annotation?.['mother.dobUnknown'], 'false')
    assertEquals(
      correctionAction?.annotation?.['mother.maritalStatus'],
      'MARRIED'
    )
    assertEquals(
      correctionAction?.annotation?.['mother.educationalAttainment'],
      'UPPER_SECONDARY_ISCED_3'
    )
    assertEquals(correctionAction?.annotation?.['mother.occupation'], 'Teacher')
    assertEquals(correctionAction?.annotation?.['mother.previousBirths'], '2')
  })

  await t.step('should transform father identification corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'father',
              valueId: 'fatherNationalId',
              value: 'OLD123',
            },
            {
              valueCode: 'father',
              valueId: 'fatherBirthRegistrationNumber',
              value: 'BRN-OLD',
            },
            {
              valueCode: 'father',
              valueId: 'fatherBirthDate',
              value: '1985-01-01',
            },
            {
              valueCode: 'father',
              valueId: 'maritalStatus',
              value: 'MARRIED',
            },
            {
              valueCode: 'father',
              valueId: 'educationalAttainment',
              value: 'PRIMARY_ISCED_1',
            },
            {
              valueCode: 'father',
              valueId: 'occupation',
              value: 'Engineer',
            },
          ],
          output: [
            {
              valueCode: 'father',
              valueId: 'fatherNationalId',
              value: 'NEW456',
            },
            {
              valueCode: 'father',
              valueId: 'fatherBirthRegistrationNumber',
              value: 'BRN-NEW',
            },
            {
              valueCode: 'father',
              valueId: 'fatherBirthDate',
              value: '1985-06-15',
            },
            {
              valueCode: 'father',
              valueId: 'maritalStatus',
              value: 'WIDOWED',
            },
            {
              valueCode: 'father',
              valueId: 'educationalAttainment',
              value: 'LOWER_SECONDARY_ISCED_2',
            },
            {
              valueCode: 'father',
              valueId: 'occupation',
              value: 'Architect',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'father.nid': 'NEW456',
      'father.brn': 'BRN-NEW',
      'father.dob': '1985-06-15',
      'father.maritalStatus': 'WIDOWED',
      'father.educationalAttainment': 'LOWER_SECONDARY_ISCED_2',
      'father.occupation': 'Architect',
    })
    assertEquals(correctionAction?.annotation?.['father.nid'], 'OLD123')
    assertEquals(correctionAction?.annotation?.['father.brn'], 'BRN-OLD')
    assertEquals(correctionAction?.annotation?.['father.dob'], '1985-01-01')
    assertEquals(
      correctionAction?.annotation?.['father.maritalStatus'],
      'MARRIED'
    )
    assertEquals(
      correctionAction?.annotation?.['father.educationalAttainment'],
      'PRIMARY_ISCED_1'
    )
    assertEquals(
      correctionAction?.annotation?.['father.occupation'],
      'Engineer'
    )
  })

  await t.step('should transform informant details corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'informant',
              valueId: 'informantBirthDate',
              value: '1980-01-01',
            },
            {
              valueCode: 'informant',
              valueId: 'exactDateOfBirthUnknown',
              value: 'false',
            },
            {
              valueCode: 'informant',
              valueId: 'informantType',
              value: 'FATHER',
            },
            {
              valueCode: 'informant',
              valueId: 'otherInformantType',
              value: '',
            },
            {
              valueCode: 'informant',
              valueId: 'registrationEmail',
              value: 'old@example.com',
            },
            {
              valueCode: 'informant',
              valueId: 'nationality',
              value: 'USA',
            },
          ],
          output: [
            {
              valueCode: 'informant',
              valueId: 'informantBirthDate',
              value: '1980-05-15',
            },
            {
              valueCode: 'informant',
              valueId: 'exactDateOfBirthUnknown',
              value: 'true',
            },
            {
              valueCode: 'informant',
              valueId: 'informantType',
              value: 'OTHER',
            },
            {
              valueCode: 'informant',
              valueId: 'otherInformantType',
              value: 'LEGAL_GUARDIAN',
            },
            {
              valueCode: 'informant',
              valueId: 'registrationEmail',
              value: 'new@example.com',
            },
            {
              valueCode: 'informant',
              valueId: 'nationality',
              value: 'GBR',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'informant.dob': '1980-05-15',
      'informant.dobUnknown': 'true',
      'informant.relation': 'OTHER',
      'informant.other.relation': 'LEGAL_GUARDIAN',
      'informant.email': 'new@example.com',
      'informant.nationality': 'GBR',
    })
    assertEquals(correctionAction?.annotation?.['informant.dob'], '1980-01-01')
    assertEquals(
      correctionAction?.annotation?.['informant.dobUnknown'],
      'false'
    )
    assertEquals(correctionAction?.annotation?.['informant.relation'], 'FATHER')
    assertEquals(correctionAction?.annotation?.['informant.other.relation'], '')
    assertEquals(
      correctionAction?.annotation?.['informant.email'],
      'old@example.com'
    )
    assertEquals(correctionAction?.annotation?.['informant.nationality'], 'USA')
  })

  await t.step('should transform verified field corrections', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'mother',
              valueId: 'verified',
              value: 'false',
            },
            {
              valueCode: 'father',
              valueId: 'verified',
              value: 'false',
            },
            {
              valueCode: 'informant',
              valueId: 'verified',
              value: 'true',
            },
          ],
          output: [
            {
              valueCode: 'mother',
              valueId: 'verified',
              value: 'true',
            },
            {
              valueCode: 'father',
              valueId: 'verified',
              value: 'true',
            },
            {
              valueCode: 'informant',
              valueId: 'verified',
              value: 'false',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'mother.verified': 'true',
      'father.verified': 'true',
      'informant.verified': 'false',
    })
    assertEquals(correctionAction?.annotation?.['mother.verified'], 'false')
    assertEquals(correctionAction?.annotation?.['father.verified'], 'false')
    assertEquals(correctionAction?.annotation?.['informant.verified'], 'true')
  })

  await t.step('should handle corrections without input (output-only)', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          output: [
            {
              valueCode: 'child',
              valueId: 'gender',
              value: 'male',
            },
          ],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'child.gender': 'male',
    })
  })
})

Deno.test('Corrections - Death', async (t) => {
  const deathResolver = buildDeathResolver()

  await t.step('should transform deceased field corrections', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'deceased',
              valueId: 'gender',
              value: 'male',
            },
            {
              valueCode: 'deceased',
              valueId: 'nationality',
              value: 'USA',
            },
          ],
          output: [
            {
              valueCode: 'deceased',
              valueId: 'gender',
              value: 'female',
            },
            {
              valueCode: 'deceased',
              valueId: 'nationality',
              value: 'GBR',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'deceased.gender': 'female',
      'deceased.nationality': 'GBR',
    })
    assertEquals(correctionAction?.annotation?.['deceased.gender'], 'male')
    assertEquals(correctionAction?.annotation?.['deceased.nationality'], 'USA')
  })

  await t.step('should transform deceased detailed field corrections', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'deceased',
              valueId: 'deceasedBirthDate',
              value: '1950-01-01',
            },
            {
              valueCode: 'deceased',
              valueId: 'exactDateOfBirthUnknown',
              value: 'false',
            },
            {
              valueCode: 'deceased',
              valueId: 'maritalStatus',
              value: 'MARRIED',
            },
            {
              valueCode: 'deceased',
              valueId: 'deceasedBirthRegistrationNumber',
              value: 'BRN-OLD',
            },
          ],
          output: [
            {
              valueCode: 'deceased',
              valueId: 'deceasedBirthDate',
              value: '1950-06-15',
            },
            {
              valueCode: 'deceased',
              valueId: 'exactDateOfBirthUnknown',
              value: 'true',
            },
            {
              valueCode: 'deceased',
              valueId: 'maritalStatus',
              value: 'WIDOWED',
            },
            {
              valueCode: 'deceased',
              valueId: 'deceasedBirthRegistrationNumber',
              value: 'BRN-NEW',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'deceased.dob': '1950-06-15',
      'deceased.dobUnknown': 'true',
      'deceased.maritalStatus': 'WIDOWED',
      'deceased.brn': 'BRN-NEW',
    })
    assertEquals(correctionAction?.annotation?.['deceased.dob'], '1950-01-01')
    assertEquals(correctionAction?.annotation?.['deceased.dobUnknown'], 'false')
    assertEquals(
      correctionAction?.annotation?.['deceased.maritalStatus'],
      'MARRIED'
    )
    assertEquals(correctionAction?.annotation?.['deceased.brn'], 'BRN-OLD')
  })

  await t.step('should transform death event details corrections', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'deathEvent',
              valueId: 'deathDate',
              value: '2024-01-01',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'mannerOfDeath',
              value: 'NATURAL_CAUSES',
            },
          ],
          output: [
            {
              valueCode: 'deathEvent',
              valueId: 'deathDate',
              value: '2024-01-05',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'mannerOfDeath',
              value: 'ACCIDENT',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'eventDetails.date': '2024-01-05',
      'eventDetails.mannerOfDeath': 'ACCIDENT',
    })
    assertEquals(
      correctionAction?.annotation?.['eventDetails.date'],
      '2024-01-01'
    )
    assertEquals(
      correctionAction?.annotation?.['eventDetails.mannerOfDeath'],
      'NATURAL_CAUSES'
    )
  })

  await t.step('should transform death event comprehensive corrections', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'deathEvent',
              valueId: 'placeOfDeath',
              value: 'HEALTH_FACILITY',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'causeOfDeathEstablished',
              value: 'true',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'causeOfDeathMethod',
              value: 'PHYSICIAN',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'deathDescription',
              value: 'Old description',
            },
          ],
          output: [
            {
              valueCode: 'deathEvent',
              valueId: 'placeOfDeath',
              value: 'OTHER',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'causeOfDeathEstablished',
              value: 'false',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'causeOfDeathMethod',
              value: 'VERBAL_AUTOPSY',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'deathDescription',
              value: 'New description',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'eventDetails.placeOfDeath': 'OTHER',
      'eventDetails.causeOfDeathEstablished': 'false',
      'eventDetails.sourceCauseDeath': 'VERBAL_AUTOPSY',
      'eventDetails.description': 'New description',
    })
    assertEquals(
      correctionAction?.annotation?.['eventDetails.placeOfDeath'],
      'HEALTH_FACILITY'
    )
    assertEquals(
      correctionAction?.annotation?.['eventDetails.causeOfDeathEstablished'],
      'true'
    )
    assertEquals(
      correctionAction?.annotation?.['eventDetails.sourceCauseDeath'],
      'PHYSICIAN'
    )
    assertEquals(
      correctionAction?.annotation?.['eventDetails.description'],
      'Old description'
    )
  })

  await t.step('should transform spouse field corrections', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'spouse',
              valueId: 'firstNamesEng',
              value: 'OldName',
            },
            {
              valueCode: 'spouse',
              valueId: 'nationality',
              value: 'USA',
            },
          ],
          output: [
            {
              valueCode: 'spouse',
              valueId: 'firstNamesEng',
              value: 'NewName',
            },
            {
              valueCode: 'spouse',
              valueId: 'nationality',
              value: 'GBR',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration?.['spouse.name'], {
      firstname: 'NewName',
    })
    assertEquals(correctionAction?.declaration?.['spouse.nationality'], 'GBR')
    assertEquals(correctionAction?.annotation?.['spouse.name'], {
      firstname: 'OldName',
    })
    assertEquals(correctionAction?.annotation?.['spouse.nationality'], 'USA')
  })

  await t.step('should transform spouse detailed corrections', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'spouse',
              valueId: 'spouseBirthDate',
              value: '1952-01-01',
            },
            {
              valueCode: 'spouse',
              valueId: 'exactDateOfBirthUnknown',
              value: 'false',
            },
            {
              valueCode: 'spouse',
              valueId: 'spouseNationalId',
              value: 'OLD-NID',
            },
            {
              valueCode: 'spouse',
              valueId: 'spouseBirthRegistrationNumber',
              value: 'OLD-BRN',
            },
            {
              valueCode: 'spouse',
              valueId: 'ageOfIndividualInYears',
              value: '70',
            },
          ],
          output: [
            {
              valueCode: 'spouse',
              valueId: 'spouseBirthDate',
              value: '1952-06-15',
            },
            {
              valueCode: 'spouse',
              valueId: 'exactDateOfBirthUnknown',
              value: 'true',
            },
            {
              valueCode: 'spouse',
              valueId: 'spouseNationalId',
              value: 'NEW-NID',
            },
            {
              valueCode: 'spouse',
              valueId: 'spouseBirthRegistrationNumber',
              value: 'NEW-BRN',
            },
            {
              valueCode: 'spouse',
              valueId: 'ageOfIndividualInYears',
              value: '71',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    // Note: AGE_MAPPINGS transforms age into an object, not a string
    assertEquals(correctionAction?.declaration?.['spouse.dob'], '1952-06-15')
    assertEquals(correctionAction?.declaration?.['spouse.dobUnknown'], 'true')
    assertEquals(correctionAction?.declaration?.['spouse.nid'], 'NEW-NID')
    assertEquals(correctionAction?.declaration?.['spouse.brn'], 'NEW-BRN')
    // AGE_MAPPINGS transforms age values
    assertEquals(correctionAction?.declaration?.['spouse.age']?.age, '71')
    assertEquals(
      correctionAction?.declaration?.['spouse.age']?.asOfDateRef,
      'eventDetails.date'
    )

    assertEquals(correctionAction?.annotation?.['spouse.dob'], '1952-01-01')
    assertEquals(correctionAction?.annotation?.['spouse.dobUnknown'], 'false')
    assertEquals(correctionAction?.annotation?.['spouse.nid'], 'OLD-NID')
    assertEquals(correctionAction?.annotation?.['spouse.brn'], 'OLD-BRN')
    // AGE_MAPPINGS transforms age into an object for both input and output
    assertEquals(correctionAction?.annotation?.['spouse.age']?.age, '70')
    assertEquals(
      correctionAction?.annotation?.['spouse.age']?.asOfDateRef,
      'eventDetails.date'
    )
  })

  await t.step('should transform informant corrections in death', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'informant',
              valueId: 'informantType',
              value: 'SON',
            },
            {
              valueCode: 'informant',
              valueId: 'registrationPhone',
              value: '7888888',
            },
          ],
          output: [
            {
              valueCode: 'informant',
              valueId: 'informantType',
              value: 'DAUGHTER',
            },
            {
              valueCode: 'informant',
              valueId: 'registrationPhone',
              value: '7999999',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'informant.relation': 'DAUGHTER',
      'informant.phoneNo': '+6767999999',
    })
    assertEquals(correctionAction?.annotation?.['informant.relation'], 'SON')
    assertEquals(
      correctionAction?.annotation?.['informant.phoneNo'],
      '+6767888888'
    )
  })

  await t.step('should transform custom field corrections in death', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'deceased',
              valueId: 'deceasedIdType',
              value: 'PASSPORT',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'reasonForLateRegistration',
              value: 'Out of country',
            },
          ],
          output: [
            {
              valueCode: 'deceased',
              valueId: 'deceasedIdType',
              value: 'NATIONAL_ID',
            },
            {
              valueCode: 'deathEvent',
              valueId: 'reasonForLateRegistration',
              value: 'Missing in action',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'deceased.idType': 'NATIONAL_ID',
      'eventDetails.reasonForLateRegistration': 'Missing in action',
    })
    assertEquals(correctionAction?.annotation?.['deceased.idType'], 'PASSPORT')
    assertEquals(
      correctionAction?.annotation?.['eventDetails.reasonForLateRegistration'],
      'Out of country'
    )
  })

  await t.step('should transform verified fields in death', () => {
    const registration = buildDeathEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [
            {
              valueCode: 'deceased',
              valueId: 'verified',
              value: 'false',
            },
            {
              valueCode: 'informant',
              valueId: 'verified',
              value: 'true',
            },
            {
              valueCode: 'spouse',
              valueId: 'verified',
              value: 'false',
            },
          ],
          output: [
            {
              valueCode: 'deceased',
              valueId: 'verified',
              value: 'true',
            },
            {
              valueCode: 'informant',
              valueId: 'verified',
              value: 'false',
            },
            {
              valueCode: 'spouse',
              valueId: 'verified',
              value: 'true',
            },
          ],
        },
      ],
    })

    const result = transform(registration, deathResolver, 'death')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {
      'deceased.verified': 'true',
      'informant.verified': 'false',
      'spouse.verified': 'true',
    })
    assertEquals(correctionAction?.annotation?.['deceased.verified'], 'false')
    assertEquals(correctionAction?.annotation?.['informant.verified'], 'true')
    assertEquals(correctionAction?.annotation?.['spouse.verified'], 'false')
  })
})

Deno.test('Corrections - Edge Cases', async (t) => {
  const birthResolver = buildBirthResolver()

  await t.step('should handle empty input and output arrays', () => {
    const registration = buildBirthEventRegistration({
      history: [
        {
          date: '2024-01-01T10:00:00Z',
          regStatus: 'DECLARED',
          user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
          office: { id: 'office1' },
        },
        {
          date: '2024-01-02T12:00:00Z',
          action: 'REQUESTED_CORRECTION',
          user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
          office: { id: 'office1' },
          input: [],
          output: [],
        },
      ],
    })

    const result = transform(registration, birthResolver, 'birth')
    const correctionAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )

    assertEquals(correctionAction?.declaration, {})
  })

  await t.step(
    'should handle mixed field type corrections in one request',
    () => {
      const registration = buildBirthEventRegistration({
        history: [
          {
            date: '2024-01-01T10:00:00Z',
            regStatus: 'DECLARED',
            user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
            office: { id: 'office1' },
          },
          {
            date: '2024-01-02T12:00:00Z',
            action: 'REQUESTED_CORRECTION',
            user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
            office: { id: 'office1' },
            input: [
              {
                valueCode: 'child',
                valueId: 'gender',
                value: 'male',
              },
              {
                valueCode: 'mother',
                valueId: 'firstNamesEng',
                value: 'OldName',
              },
              {
                valueCode: 'informant',
                valueId: 'registrationPhone',
                value: '7888888',
              },
            ],
            output: [
              {
                valueCode: 'child',
                valueId: 'gender',
                value: 'female',
              },
              {
                valueCode: 'mother',
                valueId: 'firstNamesEng',
                value: 'NewName',
              },
              {
                valueCode: 'informant',
                valueId: 'registrationPhone',
                value: '7999999',
              },
            ],
          },
        ],
      })

      const result = transform(registration, birthResolver, 'birth')
      const correctionAction = result.actions.find(
        (a) => a.type === 'REQUEST_CORRECTION'
      )

      assertEquals(correctionAction?.declaration, {
        'child.gender': 'female',
        'mother.name': { firstname: 'NewName' },
        'informant.phoneNo': '+6767999999',
      })
      assertEquals(correctionAction?.annotation?.['child.gender'], 'male')
      assertEquals(correctionAction?.annotation?.['mother.name'], {
        firstname: 'OldName',
      })
      assertEquals(
        correctionAction?.annotation?.['informant.phoneNo'],
        '+6767888888'
      )
    }
  )
})

Deno.test('Corrections - with incorrectly formatted dates', async (t) => {
  const birthResolver = buildBirthResolver()

  await t.step(
    'for birth should zero pad months and days with one character',
    () => {
      const registration = buildBirthEventRegistration({
        history: [
          {
            date: '2024-01-01T10:00:00Z',
            regStatus: 'DECLARED',
            user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
            office: { id: 'office1' },
          },
          {
            date: '2024-01-02T12:00:00Z',
            action: 'CORRECTED',
            user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
            office: { id: 'office1' },
            input: [],
            output: [
              {
                valueCode: 'child',
                valueId: 'childBirthDate',
                value: '2025-3-3',
              },
              {
                valueCode: 'mother',
                valueId: 'motherBirthDate',
                value: '1971-1-1',
              },
              {
                valueCode: 'father',
                valueId: 'fatherBirthDate',
                value: '1970-6-6',
              },
              {
                valueCode: 'informant',
                valueId: 'informantBirthDate',
                value: '1966-6-6',
              },
              {
                valueCode: 'informant',
                valueId: 'exactDateOfBirthUnknown',
                value: true,
              },
            ],
          },
        ],
      })

      const result = transform(registration, birthResolver, 'birth')
      const correctionAction = result.actions.find(
        (a) => a.type === 'REQUEST_CORRECTION'
      )

      assertEquals(correctionAction?.declaration, {
        'child.dob': '2025-03-03',
        'mother.dob': '1971-01-01',
        'father.dob': '1970-06-06',
        'informant.dob': '1966-06-06',
        'informant.dobUnknown': true,
      })
    }
  )

  await t.step(
    'for death should zero pad months and days with one character',
    () => {
      const registration = buildDeathEventRegistration({
        history: [
          {
            date: '2024-01-01T10:00:00Z',
            regStatus: 'DECLARED',
            user: { id: 'user1', role: { id: 'FIELD_AGENT' } },
            office: { id: 'office1' },
          },
          {
            date: '2024-01-02T12:00:00Z',
            action: 'REQUESTED_CORRECTION',
            user: { id: 'user2', role: { id: 'REGISTRATION_AGENT' } },
            office: { id: 'office1' },
            input: [],
            output: [
              {
                valueCode: 'deceased',
                valueId: 'deceasedBirthDate',
                value: '2025-3-3',
              },
              {
                valueCode: 'deathEvent',
                valueId: 'deathDate',
                value: '1971-1-1',
              },
              {
                valueCode: 'spouse',
                valueId: 'spouseBirthDate',
                value: '1970-6-6',
              },
              {
                valueCode: 'informant',
                valueId: 'informantBirthDate',
                value: '1966-6-6',
              },
              {
                valueCode: 'informant',
                valueId: 'exactDateOfBirthUnknown',
                value: false,
              },
            ],
          },
        ],
      })

      const result = transform(registration, birthResolver, 'death')
      const correctionAction = result.actions.find(
        (a) => a.type === 'REQUEST_CORRECTION'
      )
      assertEquals(correctionAction?.declaration, {
        'deceased.dob': '2025-03-03',
        'eventDetails.date': '1971-01-01',
        'spouse.dob': '1970-06-06',
        'informant.dob': '1966-06-06',
        'informant.dobUnknown': false,
      })
    }
  )
})
