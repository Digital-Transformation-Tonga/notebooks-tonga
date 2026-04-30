import { AddressLine, EventRegistration } from '../helpers/types.ts'

export const COUNTRY_CODE = 'TON' //Replace with actual country code
export const COUNTRY_PHONE_CODE = '+676' //Replace with actual country phone code

// Required to handle 2:1 mapping of birth location fields in corrections
export const BIRTH_LOCATION_PRIVATE_HOME_KEY = 'birth.birthLocation.privateHome'
export const BIRTH_LOCATION_OTHER_HOME_KEY = 'birth.birthLocation.otherHome'

// Set up street level details as they are in your country config
// src/form/street-address-configuration.ts
export interface Address {
  addressType: 'INTERNATIONAL' | 'DOMESTIC'
  country: string
  administrativeArea?: string
  streetLevelDetails: StreetLevelDetails
}

export interface StreetLevelDetails {
  state?: string
  district2?: string
  cityOrTown?: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  postcodeOrZip?: string
  village?: string
  number?: string
  street?: string
  residentialArea?: string
  zipCode?: string
}

export function resolveAddress(
  data: EventRegistration,
  address: AddressLine | undefined
): Address | null {
  if (!address) {
    return null
  }
  const lines = address.line
    .filter(Boolean)
    .filter((line) => !['URBAN', 'RURAL'].includes(line))
  const international = address.country !== COUNTRY_CODE
  if (international) {
    return {
      addressType: 'INTERNATIONAL',
      country: address.country,
      streetLevelDetails: {
        state: address.state,
        district2: address.district,
        cityOrTown: address.city,
        addressLine1: lines[0],
        addressLine2: lines[1],
        addressLine3: lines.slice(2).join(', '),
        postcodeOrZip: address.postalCode,
        /* For potential custom field
        kebele: getCustomField(data, 'birth.child.address.kebele'),
         */
      },
    }
  }

  return {
    addressType: 'DOMESTIC',
    country: address.country,
    administrativeArea: address.district,
    streetLevelDetails: {
      village: address.city,
      number: lines[0],
      street: lines[1],
      residentialArea: lines[2],
      zipCode: address.postalCode,
    },
  }
}
