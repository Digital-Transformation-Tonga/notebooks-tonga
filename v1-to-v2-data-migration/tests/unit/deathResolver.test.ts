import { assertEquals } from 'jsr:@std/assert'
import { transform } from '../../helpers/transform.ts'
import {
  buildDeathResolver,
  buildDeathEventRegistration,
} from '../utils/testHelpers.ts'
import { COUNTRY_CODE } from '../../countryData/addressResolver.ts'

// Construct deathResolver as in migrate.ipynb
const deathResolver = buildDeathResolver()

Deno.test('deathResolver - deceased fields', async (t) => {
  await t.step('should resolve deceased.name', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.name'], {
      firstname: 'John',
      middleName: undefined,
      surname: 'Doe',
    })
  })

  await t.step('should resolve deceased.gender', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.gender'], 'male')
  })

  await t.step('should resolve deceased.dob', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.dob'], '1950-01-01')
  })

  await t.step('should resolve deceased.dobUnknown', () => {
    const data = buildDeathEventRegistration({
      deceased: {
        ...buildDeathEventRegistration().deceased!,
        exactDateOfBirthUnknown: true,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.dobUnknown'], true)
  })

  await t.step('should resolve deceased.age with asOfDateRef', () => {
    const data = buildDeathEventRegistration({
      deceased: {
        ...buildDeathEventRegistration().deceased!,
        ageOfIndividualInYears: 74,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.age'], {
      age: 74,
      asOfDateRef: 'eventDetails.date',
    })
  })

  await t.step('should resolve deceased.nationality', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['deceased.nationality'],
      COUNTRY_CODE
    )
  })

  await t.step('should resolve deceased.idType from questionnaire', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.deceased.deceased-view-group.deceasedIdType',
          value: 'NATIONAL_ID',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.idType'], 'NATIONAL_ID')
  })

  await t.step('should omit deceased.nonTonganDeath when not explicitly true', () => {
    const base = buildDeathEventRegistration()
    const data = buildDeathEventRegistration({
      questionnaire: [
        ...(base.questionnaire ?? []),
        {
          fieldId: 'death.deceased.deceased-view-group.nonTonganDeath',
          value: 'false',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.nonTonganDeath'], undefined)
  })

  await t.step('should resolve deceased.nonTonganDeath when explicitly true', () => {
    const base = buildDeathEventRegistration()
    const data = buildDeathEventRegistration({
      questionnaire: [
        ...(base.questionnaire ?? []),
        {
          fieldId: 'death.deceased.deceased-view-group.nonTonganDeath',
          value: 'true',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.nonTonganDeath'], true)
  })

  await t.step('should omit deceased.foreignDeath when non-Tongan death', () => {
    const base = buildDeathEventRegistration()
    const data = buildDeathEventRegistration({
      questionnaire: [
        ...(base.questionnaire ?? []),
        {
          fieldId: 'death.deceased.deceased-view-group.nonTonganDeath',
          value: 'true',
        },
        {
          fieldId: 'death.deceased.deceased-view-group.foreignDeath',
          value: 'false',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.foreignDeath'], undefined)
  })

  await t.step('should resolve deceased.foreignDeath when Tongan path and set', () => {
    const base = buildDeathEventRegistration()
    const data = buildDeathEventRegistration({
      questionnaire: [
        ...(base.questionnaire ?? []),
        {
          fieldId: 'death.deceased.deceased-view-group.nonTonganDeath',
          value: 'false',
        },
        {
          fieldId: 'death.deceased.deceased-view-group.foreignDeath',
          value: 'true',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.foreignDeath'], true)
  })

  await t.step('should resolve deceased.nid', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.nid'], 'DEC123456')
  })

  await t.step('should resolve deceased.passport', () => {
    const data = buildDeathEventRegistration({
      deceased: {
        ...buildDeathEventRegistration().deceased!,
        identifier: [{ type: 'PASSPORT', id: 'P123456' }],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.passport'], 'P123456')
  })

  await t.step('should resolve deceased.brn', () => {
    const data = buildDeathEventRegistration({
      deceased: {
        ...buildDeathEventRegistration().deceased!,
        identifier: [{ type: 'BIRTH_REGISTRATION_NUMBER', id: 'B123456' }],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.brn'], 'B123456')
  })

  await t.step('should resolve deceased.maritalStatus', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['deceased.maritalStatus'],
      'MARRIED'
    )
  })

  await t.step('should resolve deceased.numberOfDependants', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.deceased.deceased-view-group.numberOfDependants',
          value: '3',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.numberOfDependants'], 3)
  })

  await t.step('should resolve deceased.verified from questionnaire', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.deceased.deceased-view-group.verified',
          value: 'verified',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.verified'], 'verified')
  })
})

Deno.test('deathResolver - eventDetails fields', async (t) => {
  await t.step(
    'should resolve eventDetails.date from deceased.deceased.deathDate',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['eventDetails.date'],
        '2024-01-01'
      )
    }
  )

  await t.step(
    'should resolve eventDetails.date from deathDate fallback',
    () => {
      const data = buildDeathEventRegistration({
        deceased: {
          ...buildDeathEventRegistration().deceased!,
          deceased: undefined,
        },
      })
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['eventDetails.date'],
        '2024-01-01'
      )
    }
  )

  await t.step('should resolve eventDetails.description', () => {
    const data = buildDeathEventRegistration({
      deathDescription: 'Natural causes',
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.description'],
      'Natural causes'
    )
  })

  await t.step('should resolve eventDetails.reasonForLateRegistration', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId:
            'death.deathEvent.death-event-details.reasonForLateRegistration',
          value: 'Travel delays',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.reasonForLateRegistration'],
      'Travel delays'
    )
  })

  await t.step('should resolve eventDetails.causeOfDeathEstablished', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.causeOfDeathEstablished'],
      true
    )
  })

  await t.step('should resolve eventDetails.sourceCauseDeath', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.sourceCauseDeath'],
      'PHYSICIAN'
    )
  })

  await t.step('should resolve eventDetails.mannerOfDeath', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.mannerOfDeath'],
      'MANNER_NATURAL'
    )
  })

  await t.step('should map ACCIDENT to MANNER_ACCIDENT', () => {
    const data = buildDeathEventRegistration({
      mannerOfDeath: 'ACCIDENT',
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.mannerOfDeath'],
      'MANNER_ACCIDENT'
    )
  })

  await t.step('should resolve eventDetails.placeOfDeath', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['eventDetails.placeOfDeath'],
      'HEALTH_FACILITY'
    )
  })

  await t.step(
    'should resolve eventDetails.deathLocation for HEALTH_FACILITY',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['eventDetails.deathLocation'],
        'location-id'
      )
    }
  )
})

Deno.test('deathResolver - informant fields', async (t) => {
  await t.step('should resolve informant.idType from questionnaire', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.informant.informant-view-group.informantIdType',
          value: 'PASSPORT',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.idType'], 'PASSPORT')
  })

  await t.step('should resolve informant.dob for non-special informant', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.dob'], '1980-01-01')
  })

  await t.step('should not resolve informant.dob for SPOUSE', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        relationship: 'SPOUSE',
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.dob'], undefined)
  })

  await t.step(
    'should resolve informant.phoneNo in v2 international format',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['informant.phoneNo'],
        '+6767712345'
      )
    }
  )

  await t.step('should resolve informant.email', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.email'],
      'contact@example.com'
    )
  })

  await t.step('should resolve informant.relation', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.relation'], 'SON')
  })

  await t.step('should resolve informant.other.relation', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        relationship: 'OTHER',
        otherRelationship: 'Caregiver',
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.other.relation'],
      'Caregiver'
    )
  })

  await t.step(
    'should resolve informant.name for non-special informant',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['informant.name'], {
        firstname: 'Jane',
        middleName: undefined,
        surname: 'Doe',
      })
    }
  )

  await t.step('should resolve informant.dobUnknown', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        birthDate: undefined,
        exactDateOfBirthUnknown: true,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.dobUnknown'], true)
  })

  await t.step('should resolve informant.age', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        birthDate: undefined,
        ageOfIndividualInYears: 44,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.age'], {
      age: 44,
      asOfDateRef: 'eventDetails.date',
    })
  })

  await t.step('should resolve informant.nationality', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        nationality: ['USA'],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.nationality'], 'USA')
  })

  await t.step('should resolve informant.brn', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        identifier: [{ type: 'BIRTH_REGISTRATION_NUMBER', id: 'BRN123' }],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.brn'], 'BRN123')
  })

  await t.step('should resolve informant.nid', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.nid'], 'INF789')
  })

  await t.step('should resolve informant.passport', () => {
    const data = buildDeathEventRegistration({
      informant: {
        ...buildDeathEventRegistration().informant!,
        identifier: [{ type: 'PASSPORT', id: 'P789' }],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['informant.passport'], 'P789')
  })

  await t.step('should resolve informant.verified from questionnaire', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.informant.informant-view-group.verified',
          value: 'authenticated',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['informant.verified'],
      'authenticated'
    )
  })
})

Deno.test('deathResolver - spouse fields', async (t) => {
  await t.step(
    'should omit spouse.detailsNotAvailable when spouse details exist',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['spouse.detailsNotAvailable'],
        undefined
      )
    }
  )

  await t.step(
    'should omit spouse fields when deceased is not married',
    () => {
      const data = buildDeathEventRegistration({
        deceased: {
          ...buildDeathEventRegistration().deceased!,
          maritalStatus: 'SINGLE',
        },
        spouse: {
          detailsExist: false,
        },
      })
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['spouse.detailsNotAvailable'],
        undefined
      )
      assertEquals(
        declareAction?.declaration['spouse.addressSameAs'],
        undefined
      )
    }
  )

  await t.step('should resolve spouse.detailsNotAvailable when true', () => {
    const data = buildDeathEventRegistration({
      spouse: {
        ...buildDeathEventRegistration().spouse!,
        detailsExist: false,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.detailsNotAvailable'], true)
  })

  await t.step('should resolve spouse.reason', () => {
    const data = buildDeathEventRegistration({
      spouse: {
        ...buildDeathEventRegistration().spouse!,
        reasonNotApplying: 'Divorced',
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.reason'], 'Divorced')
  })

  await t.step('should resolve spouse.name', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.name'], {
      firstname: 'Mary',
      middleName: undefined,
      surname: 'Smith',
    })
  })

  await t.step('should resolve spouse.dob', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.dob'], '1952-01-01')
  })

  await t.step('should resolve spouse.dobUnknown', () => {
    const data = buildDeathEventRegistration({
      spouse: {
        ...buildDeathEventRegistration().spouse!,
        exactDateOfBirthUnknown: true,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.dobUnknown'], true)
  })

  await t.step('should resolve spouse.age', () => {
    const data = buildDeathEventRegistration({
      spouse: {
        ...buildDeathEventRegistration().spouse!,
        ageOfIndividualInYears: 72,
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.age'], {
      age: 72,
      asOfDateRef: 'eventDetails.date',
    })
  })

  await t.step('should resolve spouse.nationality', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.nationality'], COUNTRY_CODE)
  })

  await t.step('should resolve spouse.idType from questionnaire', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.spouse.spouse-view-group.spouseIdType',
          value: 'NATIONAL_ID',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.idType'], 'NATIONAL_ID')
  })

  await t.step('should resolve spouse.nid', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.nid'], 'SPO456')
  })

  await t.step('should resolve spouse.passport', () => {
    const data = buildDeathEventRegistration({
      spouse: {
        ...buildDeathEventRegistration().spouse!,
        identifier: [{ type: 'PASSPORT', id: 'P456' }],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.passport'], 'P456')
  })

  await t.step('should resolve spouse.brn', () => {
    const data = buildDeathEventRegistration({
      spouse: {
        ...buildDeathEventRegistration().spouse!,
        identifier: [{ type: 'BIRTH_REGISTRATION_NUMBER', id: 'B456' }],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.brn'], 'B456')
  })

  await t.step('should resolve spouse.verified from questionnaire', () => {
    const data = buildDeathEventRegistration({
      questionnaire: [
        {
          fieldId: 'death.spouse.spouse-view-group.verified',
          value: 'verified',
        },
      ],
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.verified'], 'verified')
  })
})

Deno.test('deathResolver - documents fields', async (t) => {
  await t.step('should resolve documents.proofOfDeceased', () => {
    const data = buildDeathEventRegistration({
      registration: {
        trackingId: 'DW12345',
        attachments: [
          {
            uri: '/path/to/doc1.pdf',
            contentType: 'application/pdf',
            type: 'DECEASED_ID_PROOF',
            subject: 'DECEASED_ID_PROOF',
          },
        ],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfDeceased'], [
      {
        path: '/path/to/doc1.pdf',
        originalFilename: '/path/to/doc1.pdf',
        type: 'application/pdf',
        option: 'DECEASED_ID_PROOF',
      },
    ])
  })

  await t.step('should resolve documents.proofOfDeath', () => {
    const data = buildDeathEventRegistration({
      registration: {
        trackingId: 'DW12345',
        attachments: [
          {
            uri: '/path/to/doc2.pdf',
            contentType: 'application/pdf',
            type: 'DECEASED_DEATH_PROOF',
            subject: 'DECEASED_DEATH_PROOF',
          },
        ],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfDeath'], [
      {
        path: '/path/to/doc2.pdf',
        originalFilename: '/path/to/doc2.pdf',
        type: 'application/pdf',
        option: 'DECEASED_DEATH_PROOF',
      },
    ])
  })

  await t.step('should resolve documents.proofOfCauseOfDeath', () => {
    const data = buildDeathEventRegistration({
      registration: {
        trackingId: 'DW12345',
        attachments: [
          {
            uri: '/path/to/doc3.pdf',
            contentType: 'application/pdf',
            type: 'DECEASED_DEATH_CAUSE_PROOF',
            subject: 'DECEASED_DEATH_CAUSE_PROOF',
          },
        ],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfCauseOfDeath'], [
      {
        path: '/path/to/doc3.pdf',
        originalFilename: '/path/to/doc3.pdf',
        type: 'application/pdf',
        option: 'DECEASED_DEATH_CAUSE_PROOF',
      },
    ])
  })

  await t.step('should resolve documents.proofOfInformant', () => {
    const data = buildDeathEventRegistration({
      registration: {
        trackingId: 'DW12345',
        attachments: [
          {
            uri: '/path/to/doc4.pdf',
            contentType: 'application/pdf',
            type: 'INFORMANT_ID_PROOF',
            subject: 'INFORMANT_ID_PROOF',
          },
        ],
      },
    })
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['documents.proofOfInformant'], [
      {
        path: '/path/to/doc4.pdf',
        originalFilename: '/path/to/doc4.pdf',
        type: 'application/pdf',
        option: 'INFORMANT_ID_PROOF',
      },
    ])
  })

  await t.step(
    'should resolve documents.proofOther combining OTHER and LEGAL_GUARDIAN_PROOF',
    () => {
      const data = buildDeathEventRegistration({
        registration: {
          trackingId: 'DW12345',
          attachments: [
            {
              uri: '/path/to/doc5.pdf',
              contentType: 'application/pdf',
              type: 'OTHER',
              subject: 'OTHER',
            },
            {
              uri: '/path/to/doc6.pdf',
              contentType: 'application/pdf',
              type: 'LEGAL_GUARDIAN_PROOF',
              subject: 'LEGAL_GUARDIAN_PROOF',
            },
          ],
        },
      })
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['documents.proofOther'], [
        {
          path: '/path/to/doc5.pdf',
          originalFilename: '/path/to/doc5.pdf',
          type: 'application/pdf',
          option: 'OTHER',
        },
        {
          path: '/path/to/doc6.pdf',
          originalFilename: '/path/to/doc6.pdf',
          type: 'application/pdf',
          option: 'LEGAL_GUARDIAN_PROOF',
        },
      ])
    }
  )
})
