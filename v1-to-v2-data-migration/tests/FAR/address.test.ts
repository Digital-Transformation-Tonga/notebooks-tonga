import { transform } from '../../helpers/transform.ts'
import { assertEquals } from 'https://deno.land/std@0.210.0/assert/mod.ts'
import {
  buildBirthResolver,
  buildBirthEventRegistration,
  buildDeathResolver,
  buildDeathEventRegistration,
} from '../utils/testHelpers.ts'

// Construct resolvers as in migrate.ipynb
const birthResolver = buildBirthResolver()
const deathResolver = buildDeathResolver()

Deno.test('FAR address tests - birth events', async (t) => {
  await t.step(
    'should resolve child.birthLocation.privateHome for PRIVATE_HOME',
    () => {
      const registration = buildBirthEventRegistration({
        eventLocation: {
          type: 'PRIVATE_HOME',
          address: {
            line: ['123', 'Main St', 'City', '', '', 'URBAN'],
            district: 'District1',
            state: 'State1',
            city: 'City1',
            country: 'FAR',
            postalCode: '12345',
          },
        },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['child.birthLocation.privateHome']
          ?.administrativeArea,
        'District1'
      )
      assertEquals(
        declareAction?.declaration['child.birthLocation.privateHome']?.country,
        'FAR'
      )
    }
  )

  await t.step('should resolve child.birthLocation.other for OTHER', () => {
    const registration = buildBirthEventRegistration({
      eventLocation: {
        type: 'OTHER',
        address: {
          line: ['456', 'Other St', 'Town'],
          district: 'District2',
          state: 'State2',
          city: 'City2',
          country: 'FAR',
          postalCode: '54321',
        },
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(
      declareAction?.declaration['child.birthLocation.other']
        ?.administrativeArea,
      'District2'
    )
  })

  await t.step('should resolve mother.address', () => {
    const registration = buildBirthEventRegistration({
      mother: {
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['10', 'Mother St', 'City', '', '', 'URBAN'],
            country: 'FAR',
            district: 'District1',
            state: 'State1',
            city: 'City1',
            postalCode: '11111',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['mother.address']?.country, 'FAR')
    assertEquals(
      declareAction?.declaration['mother.address']?.administrativeArea,
      'District1'
    )
  })

  await t.step('should resolve father.address', () => {
    const registration = buildBirthEventRegistration({
      father: {
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['20', 'Father Ave', 'Town'],
            country: 'FAR',
            district: 'District2',
            state: 'State2',
            city: 'City2',
            postalCode: '22222',
          },
        ],
      },
    })

    const result = transform(registration, birthResolver, 'birth')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['father.address']?.country, 'FAR')
    assertEquals(
      declareAction?.declaration['father.address']?.administrativeArea,
      'District2'
    )
  })

  await t.step(
    'should resolve father.addressSameAs when addresses match',
    () => {
      const sameAddress = {
        type: 'PRIMARY_ADDRESS' as const,
        line: ['10', 'Same St', 'City'],
        country: 'FAR',
        district: 'District1',
        state: 'State1',
        city: 'City1',
        postalCode: '11111',
      }

      const registration = buildBirthEventRegistration({
        mother: { address: [sameAddress] },
        father: { address: [sameAddress] },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['father.addressSameAs'], 'YES')
    }
  )

  await t.step(
    'should resolve father.addressSameAs when addresses differ',
    () => {
      const registration = buildBirthEventRegistration({
        mother: {
          address: [
            {
              type: 'PRIMARY_ADDRESS',
              line: ['10', 'Mother St'],
              country: 'FAR',
              district: 'District1',
            },
          ],
        },
        father: {
          address: [
            {
              type: 'PRIMARY_ADDRESS',
              line: ['20', 'Father Ave'],
              country: 'FAR',
              district: 'District2',
            },
          ],
        },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['father.addressSameAs'], 'NO')
    }
  )

  await t.step(
    'should resolve informant.address for non-special informant',
    () => {
      const registration = buildBirthEventRegistration({
        informant: {
          relationship: 'GRANDFATHER',
          address: [
            {
              type: 'PRIMARY_ADDRESS',
              line: ['30', 'Informant Rd'],
              country: 'FAR',
              district: 'District3',
              state: 'State3',
              city: 'City3',
              postalCode: '33333',
            },
          ],
        },
      })

      const result = transform(registration, birthResolver, 'birth')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['informant.address']?.administrativeArea,
        'District3'
      )
    }
  )
})

Deno.test('FAR address tests - death events', async (t) => {
  await t.step('should resolve deceased.address', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['deceased.address']?.country, 'FAR')
    assertEquals(
      declareAction?.declaration['deceased.address']?.administrativeArea,
      'District1'
    )
  })

  await t.step(
    'should resolve eventDetails.deathLocationOther for OTHER',
    () => {
      const data = buildDeathEventRegistration({
        eventLocation: {
          id: 'other-location',
          type: 'OTHER',
          address: {
            line: ['999 Death St'],
            district: 'DistrictX',
            state: 'StateX',
            country: 'FAR',
          },
        },
      })
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['eventDetails.deathLocationOther']?.country,
        'FAR'
      )
    }
  )

  await t.step(
    'should resolve informant.addressSameAs when addresses match',
    () => {
      const sharedAddress = {
        type: 'PRIMARY_ADDRESS',
        line: ['Same St'],
        district: 'District1',
        state: 'State1',
        country: 'FAR',
      }
      const data = buildDeathEventRegistration({
        deceased: {
          ...buildDeathEventRegistration().deceased!,
          address: [sharedAddress],
        },
        informant: {
          ...buildDeathEventRegistration().informant!,
          address: [sharedAddress],
        },
      })
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['informant.addressSameAs'], 'YES')
    }
  )

  await t.step(
    'should resolve informant.addressSameAs when addresses differ',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['informant.addressSameAs'], 'NO')
    }
  )

  await t.step(
    'should resolve informant.address for non-special informant',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(
        declareAction?.declaration['informant.address']?.country,
        'FAR'
      )
    }
  )

  await t.step('should resolve spouse.address', () => {
    const data = buildDeathEventRegistration()
    const result = transform(data, deathResolver, 'death')
    const declareAction = result.actions.find((a) => a.type === 'DECLARE')

    assertEquals(declareAction?.declaration['spouse.address']?.country, 'FAR')
  })

  await t.step(
    'should default mother.addressSameAs to NO for death migration',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['mother.addressSameAs'], 'NO')
    }
  )

  await t.step(
    'should resolve spouse.addressSameAs when addresses match',
    () => {
      const sharedAddress = {
        type: 'PRIMARY_ADDRESS',
        line: ['Same St'],
        district: 'District1',
        state: 'State1',
        country: 'FAR',
      }
      const data = buildDeathEventRegistration({
        deceased: {
          ...buildDeathEventRegistration().deceased!,
          address: [sharedAddress],
        },
        spouse: {
          ...buildDeathEventRegistration().spouse!,
          address: [sharedAddress],
        },
      })
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['spouse.addressSameAs'], 'YES')
    }
  )

  await t.step(
    'should resolve spouse.addressSameAs when addresses differ',
    () => {
      const data = buildDeathEventRegistration()
      const result = transform(data, deathResolver, 'death')
      const declareAction = result.actions.find((a) => a.type === 'DECLARE')

      assertEquals(declareAction?.declaration['spouse.addressSameAs'], 'NO')
    }
  )
})
