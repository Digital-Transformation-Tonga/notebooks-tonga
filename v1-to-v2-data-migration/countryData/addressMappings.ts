import { Address } from './addressResolver.ts'

type AddressConfigFunction = (data: string) => Record<string, Partial<Address>>

function clearUrbanRuralValue(value: string) {
  return ['URBAN', 'RURAL'].includes(value) ? undefined : value
}

export const ADDRESS_MAPPINGS: Record<string, AddressConfigFunction> = {
  // Birth - Child Place of Birth
  'birth.child.countryPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': { country: data },
  }),
  'birth.child.statePlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      /* Ignore: Only map leaf level */
    },
  }),
  'birth.child.districtPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': { administrativeArea: data },
  }),
  'birth.child.cityPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': { streetLevelDetails: { town: data } },
  }),
  'birth.child.addressLine1Placeofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { residentialArea: data },
    },
  }),
  'birth.child.addressLine2Placeofbirth': (data: string) => ({
    'child.birthLocation.other': { streetLevelDetails: { street: data } },
  }),
  'birth.child.addressLine3Placeofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.child.postalCodePlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { zipCode: data },
    },
  }),
  'birth.child.internationalStatePlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { state: data },
    },
  }),
  'birth.child.internationalDistrictPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { district2: data },
    },
  }),
  'birth.child.internationalCityPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { cityOrTown: data },
    },
  }),
  'birth.child.internationalAddressLine1Placeofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { addressLine1: data },
    },
  }),
  'birth.child.internationalAddressLine2Placeofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { addressLine2: data },
    },
  }),
  'birth.child.internationalAddressLine3Placeofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { addressLine3: data },
    },
  }),
  'birth.child.internationalPostalCodePlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { postcodeOrZip: data },
    },
  }),

  // Birth - Child Place of Birth (Urban/Rural Options)
  'birth.child.addressLine1UrbanOptionPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { residentialArea: data },
    },
  }),
  'birth.child.addressLine2UrbanOptionPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': { streetLevelDetails: { street: data } },
  }),
  'birth.child.addressLine3UrbanOptionPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.child.addressLine1RuralOptionPlaceofbirth': (data: string) => ({
    'child.birthLocation.other': {
      streetLevelDetails: { residentialArea: data },
    },
  }),

  // Birth - Informant Address
  'birth.informant.countryPrimaryInformant': (data: string) => ({
    'informant.address': { country: data },
  }),
  'birth.informant.statePrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { state: data } },
  }),
  'birth.informant.districtPrimaryInformant': (data: string) => ({
    'informant.address': { administrativeArea: data },
  }),
  'birth.informant.cityPrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { town: data } },
  }),
  'birth.informant.addressLine1PrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'birth.informant.addressLine2PrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { street: data } },
  }),
  'birth.informant.addressLine3PrimaryInformant': (data: string) => ({
    'informant.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.informant.postalCodePrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { zipCode: data } },
  }),
  'birth.informant.internationalStatePrimaryInformant': (data: string) => ({
    'informant.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'birth.informant.internationalDistrictPrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { district2: data } },
  }),
  'birth.informant.internationalCityPrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'birth.informant.internationalAddressLine1PrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'birth.informant.internationalAddressLine2PrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'birth.informant.internationalAddressLine3PrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'birth.informant.internationalPostalCodePrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Birth - Informant Address (Urban/Rural Options)
  'birth.informant.addressLine1UrbanOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'birth.informant.addressLine2UrbanOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { street: data } },
  }),
  'birth.informant.addressLine3UrbanOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.informant.addressLine1RuralOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { residentialArea: data } },
  }),

  // Birth - Mother Address
  'birth.mother.countryPrimaryMother': (data: string) => ({
    'mother.address': { country: data },
  }),
  'birth.mother.statePrimaryMother': (data: string) => ({
    'mother.address': {
      /* Ignore: Only map leaf level */
    },
  }),
  'birth.mother.districtPrimaryMother': (data: string) => ({
    'mother.address': { administrativeArea: data },
  }),
  'birth.mother.cityPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { town: data } },
  }),
  'birth.mother.addressLine1PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'birth.mother.addressLine2PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { street: data } },
  }),
  'birth.mother.addressLine3PrimaryMother': (data: string) => ({
    'mother.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.mother.postalCodePrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { zipCode: data } },
  }),
  'birth.mother.internationalStatePrimaryMother': (data: string) => ({
    'mother.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'birth.mother.internationalDistrictPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { district2: data } },
  }),
  'birth.mother.internationalCityPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'birth.mother.internationalAddressLine1PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'birth.mother.internationalAddressLine2PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'birth.mother.internationalAddressLine3PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'birth.mother.internationalPostalCodePrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Birth - Mother Address (Urban/Rural Options)
  'birth.mother.addressLine1UrbanOptionPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'birth.mother.addressLine2UrbanOptionPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { street: data } },
  }),
  'birth.mother.addressLine3UrbanOptionPrimaryMother': (data: string) => ({
    'mother.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.mother.addressLine1RuralOptionPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { residentialArea: data } },
  }),

  // Birth - Father Address
  'birth.father.countryPrimaryFather': (data: string) => ({
    'father.address': { country: data },
  }),
  'birth.father.statePrimaryFather': (data: string) => ({
    'father.address': {
      /* Ignore: Only map leaf level */
    },
  }),
  'birth.father.districtPrimaryFather': (data: string) => ({
    'father.address': { administrativeArea: data },
  }),
  'birth.father.cityPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { town: data } },
  }),
  'birth.father.addressLine1PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'birth.father.addressLine2PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { street: data } },
  }),
  'birth.father.addressLine3PrimaryFather': (data: string) => ({
    'father.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.father.postalCodePrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { zipCode: data } },
  }),
  'birth.father.internationalStatePrimaryFather': (data: string) => ({
    'father.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'birth.father.internationalDistrictPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { district2: data } },
  }),
  'birth.father.internationalCityPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'birth.father.internationalAddressLine1PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'birth.father.internationalAddressLine2PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'birth.father.internationalAddressLine3PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'birth.father.internationalPostalCodePrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Birth - Father Address (Urban/Rural Options)
  'birth.father.addressLine1UrbanOptionPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'birth.father.addressLine2UrbanOptionPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { street: data } },
  }),
  'birth.father.addressLine3UrbanOptionPrimaryFather': (data: string) => ({
    'father.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'birth.father.addressLine1RuralOptionPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { residentialArea: data } },
  }),

  // Death - Deceased Address
  'death.deceased.countryPrimaryDeceased': (data: string) => ({
    'deceased.address': { country: data },
  }),
  'death.deceased.statePrimaryDeceased': (data: string) => ({
    'deceased.address': {
      /* Ignore: Only map leaf level */
    },
  }),
  'death.deceased.districtPrimaryDeceased': (data: string) => ({
    'deceased.address': { administrativeArea: data },
  }),
  'death.deceased.cityPrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { town: data } },
  }),
  'death.deceased.addressLine1PrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.deceased.addressLine2PrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { street: data } },
  }),
  'death.deceased.addressLine3PrimaryDeceased': (data: string) => ({
    'deceased.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.deceased.postalCodePrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { zipCode: data } },
  }),
  'death.deceased.internationalStatePrimaryDeceased': (data: string) => ({
    'deceased.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'death.deceased.internationalDistrictPrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { district2: data } },
  }),
  'death.deceased.internationalCityPrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'death.deceased.internationalAddressLine1PrimaryDeceased': (
    data: string
  ) => ({
    'deceased.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'death.deceased.internationalAddressLine2PrimaryDeceased': (
    data: string
  ) => ({
    'deceased.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'death.deceased.internationalAddressLine3PrimaryDeceased': (
    data: string
  ) => ({
    'deceased.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'death.deceased.internationalPostalCodePrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Death - Deceased Address (Urban/Rural Options)
  'death.deceased.addressLine1UrbanOptionPrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.deceased.addressLine2UrbanOptionPrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { street: data } },
  }),
  'death.deceased.addressLine3UrbanOptionPrimaryDeceased': (data: string) => ({
    'deceased.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.deceased.addressLine1RuralOptionPrimaryDeceased': (data: string) => ({
    'deceased.address': { streetLevelDetails: { residentialArea: data } },
  }),

  // Death - Death Event Details Place of Death
  'death.deathEvent.countryPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': { country: data },
  }),
  'death.deathEvent.statePlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': { streetLevelDetails: { state: data } },
  }),
  'death.deathEvent.districtPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': { administrativeArea: data },
  }),
  'death.deathEvent.cityPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': { streetLevelDetails: { town: data } },
  }),
  'death.deathEvent.addressLine1Placeofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { residentialArea: data },
    },
  }),
  'death.deathEvent.addressLine2Placeofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': { streetLevelDetails: { street: data } },
  }),
  'death.deathEvent.addressLine3Placeofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),

  'death.deathEvent.postalCodePlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { zipCode: data },
    },
  }),
  'death.deathEvent.internationalStatePlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { state: data },
    },
  }),
  'death.deathEvent.internationalDistrictPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { district2: data },
    },
  }),
  'death.deathEvent.internationalCityPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { cityOrTown: data },
    },
  }),
  'death.deathEvent.internationalAddressLine1Placeofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { addressLine1: data },
    },
  }),
  'death.deathEvent.internationalAddressLine2Placeofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { addressLine2: data },
    },
  }),
  'death.deathEvent.internationalAddressLine3Placeofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { addressLine3: data },
    },
  }),
  'death.deathEvent.internationalPostalCodePlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { postcodeOrZip: data },
    },
  }),

  // Death - Death Event Details Place of Death (Urban/Rural Options)
  'death.deathEvent.addressLine1UrbanOptionPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { residentialArea: data },
    },
  }),
  'death.deathEvent.addressLine2UrbanOptionPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': { streetLevelDetails: { street: data } },
  }),
  'death.deathEvent.addressLine3UrbanOptionPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.deathEvent.addressLine1RuralOptionPlaceofdeath': (data: string) => ({
    'eventDetails.deathLocationOther': {
      streetLevelDetails: { residentialArea: data },
    },
  }),

  // Death - Informant Address
  'death.informant.countryPrimaryInformant': (data: string) => ({
    'informant.address': { country: data },
  }),
  'death.informant.statePrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { state: data } },
  }),
  'death.informant.districtPrimaryInformant': (data: string) => ({
    'informant.address': { administrativeArea: data },
  }),
  'death.informant.cityPrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { town: data } },
  }),
  'death.informant.addressLine1PrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.informant.addressLine2PrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { street: data } },
  }),
  'death.informant.addressLine3PrimaryInformant': (data: string) => ({
    'informant.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.informant.postalCodePrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { zipCode: data } },
  }),
  'death.informant.internationalStatePrimaryInformant': (data: string) => ({
    'informant.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'death.informant.internationalDistrictPrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { district2: data } },
  }),
  'death.informant.internationalCityPrimaryInformant': (data: string) => ({
    'informant.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'death.informant.internationalAddressLine1PrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'death.informant.internationalAddressLine2PrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'death.informant.internationalAddressLine3PrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'death.informant.internationalPostalCodePrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Death - Informant Address (Urban/Rural Options)
  'death.informant.addressLine1UrbanOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.informant.addressLine2UrbanOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { street: data } },
  }),
  'death.informant.addressLine3UrbanOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.informant.addressLine1RuralOptionPrimaryInformant': (
    data: string
  ) => ({
    'informant.address': { streetLevelDetails: { residentialArea: data } },
  }),

  // Death - Spouse Address
  'death.spouse.countryPrimarySpouse': (data: string) => ({
    'spouse.address': { country: data },
  }),
  'death.spouse.statePrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { state: data } },
  }),
  'death.spouse.districtPrimarySpouse': (data: string) => ({
    'spouse.address': { administrativeArea: data },
  }),
  'death.spouse.cityPrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { town: data } },
  }),
  'death.spouse.addressLine1PrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.spouse.addressLine2PrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { street: data } },
  }),
  'death.spouse.addressLine3PrimarySpouse': (data: string) => ({
    'spouse.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.spouse.postalCodePrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { zipCode: data } },
  }),
  'death.spouse.internationalStatePrimarySpouse': (data: string) => ({
    'spouse.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'death.spouse.internationalDistrictPrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { district2: data } },
  }),
  'death.spouse.internationalCityPrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'death.spouse.internationalAddressLine1PrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'death.spouse.internationalAddressLine2PrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'death.spouse.internationalAddressLine3PrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'death.spouse.internationalPostalCodePrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Death - Spouse Address (Urban/Rural Options)
  'death.spouse.addressLine1UrbanOptionPrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.spouse.addressLine2UrbanOptionPrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { street: data } },
  }),
  'death.spouse.addressLine3UrbanOptionPrimarySpouse': (data: string) => ({
    'spouse.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.spouse.addressLine1RuralOptionPrimarySpouse': (data: string) => ({
    'spouse.address': { streetLevelDetails: { residentialArea: data } },
  }),
  

  'death.mother.countryPrimaryMother': (data: string) => ({
    'mother.address': { country: data },
  }),
  'death.mother.statePrimaryMother': (data: string) => ({
    'mother.address': {
      /* Ignore: Only map leaf level */
    },
  }),
  'death.mother.districtPrimaryMother': (data: string) => ({
    'mother.address': { administrativeArea: data },
  }),
  'death.mother.cityPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { town: data } },
  }),
  'death.mother.addressLine1PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.mother.addressLine2PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { street: data } },
  }),
  'death.mother.addressLine3PrimaryMother': (data: string) => ({
    'mother.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.mother.postalCodePrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { zipCode: data } },
  }),
  'death.mother.internationalStatePrimaryMother': (data: string) => ({
    'mother.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'death.mother.internationalDistrictPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { district2: data } },
  }),
  'death.mother.internationalCityPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'death.mother.internationalAddressLine1PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'death.mother.internationalAddressLine2PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'death.mother.internationalAddressLine3PrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'death.mother.internationalPostalCodePrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Death - Mother Address (Urban/Rural Options)
  'death.mother.addressLine1UrbanOptionPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.mother.addressLine2UrbanOptionPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { street: data } },
  }),
  'death.mother.addressLine3UrbanOptionPrimaryMother': (data: string) => ({
    'mother.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.mother.addressLine1RuralOptionPrimaryMother': (data: string) => ({
    'mother.address': { streetLevelDetails: { residentialArea: data } },
  }),

  // Birth - Father Address
  'death.father.countryPrimaryFather': (data: string) => ({
    'father.address': { country: data },
  }),
  'death.father.statePrimaryFather': (data: string) => ({
    'father.address': {
      /* Ignore: Only map leaf level */
    },
  }),
  'death.father.districtPrimaryFather': (data: string) => ({
    'father.address': { administrativeArea: data },
  }),
  'death.father.cityPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { town: data } },
  }),
  'death.father.addressLine1PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.father.addressLine2PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { street: data } },
  }),
  'death.father.addressLine3PrimaryFather': (data: string) => ({
    'father.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.father.postalCodePrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { zipCode: data } },
  }),
  'death.father.internationalStatePrimaryFather': (data: string) => ({
    'father.address': {
      streetLevelDetails: { state: data },
    },
  }),
  'death.father.internationalDistrictPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { district2: data } },
  }),
  'death.father.internationalCityPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { cityOrTown: data } },
  }),
  'death.father.internationalAddressLine1PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { addressLine1: data } },
  }),
  'death.father.internationalAddressLine2PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { addressLine2: data } },
  }),
  'death.father.internationalAddressLine3PrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { addressLine3: data } },
  }),
  'death.father.internationalPostalCodePrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { postcodeOrZip: data } },
  }),

  // Birth - Father Address (Urban/Rural Options)
  'death.father.addressLine1UrbanOptionPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { residentialArea: data } },
  }),
  'death.father.addressLine2UrbanOptionPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { street: data } },
  }),
  'death.father.addressLine3UrbanOptionPrimaryFather': (data: string) => ({
    'father.address': {
      streetLevelDetails: { number: clearUrbanRuralValue(data) },
    },
  }),
  'death.father.addressLine1RuralOptionPrimaryFather': (data: string) => ({
    'father.address': { streetLevelDetails: { residentialArea: data } },
  }),
}
