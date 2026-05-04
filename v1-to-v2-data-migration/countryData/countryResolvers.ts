import {
  coerceLegacyBoolean,
  coerceLegacyOptionalInt,
  getCustomField,
  getDocument,
} from '../helpers/resolverUtils.ts'
import { EventRegistration } from '../helpers/types.ts'
import { resolveAddress } from './addressResolver.ts'
import { resolveName } from './nameResolver.ts'

export const countryResolver = {
    'child.nonTonganBirth': (data: EventRegistration) =>
        coerceLegacyBoolean(
            getCustomField(data, 'birth.child.child-view-group.nonTongan')
        ),
    'child.foreignBirth': (data: EventRegistration) =>
        coerceLegacyBoolean(
            getCustomField(data, 'birth.child.child-view-group.foreignBirth')
        ),
    'child.birthTime': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.birthTime'),
    'child.placeOfBirth': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.childPlaceOfBirth'),
    'child.nationality': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.childNationality'),
    'child.childStatus': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.childStatus'),
    'child.attendantFirstName': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.attendantFirstName'),
    'child.birthOrder': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(data, 'birth.child.child-view-group.birthOrder')
        ),
    'child.fileNumber': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.fileNumber'),
    'child.grantingOfficialId': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.grantingOfficialId'),
    'child.grantDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.grantDate'),
    'child.birthNote': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.birthDocumentNote'),


    'informant.tongaPassId': (data: EventRegistration) =>
        getCustomField(data, 'birth.informant.informant-view-group.informantTonganDigitalId'),


    'mother.tongaPassId': (data: EventRegistration) =>
        getCustomField(data, 'birth.mother.mother-view-group.motherTonganDigitalId'),
    'mother.placeOfBirth': (data: EventRegistration) =>
        getCustomField(data, 'birth.mother.mother-view-group.motherBirthPlace'),
    'mother.numberOfChildrenExcludingThisBirth': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(
                data,
                'birth.mother.mother-view-group.numberOfChildrenExcludingThisBirth'
            )
        ),


    'father.tongaPassId': (data: EventRegistration) =>
        getCustomField(data, 'birth.father.father-view-group.fatherTonganDigitalId'),
    'father.placeOfBirth': (data: EventRegistration) =>
        getCustomField(data, 'birth.father.father-view-group.fatherBirthPlace'),


    'foreignRegistration.foreignRegistrar': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.foreignRegistrar'),
    'foreignRegistration.foreignRegistrationPlace': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.foreignRegistrationPlace'),
    'foreignRegistration.foreignRegistrationDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.foreignRegistrationDate'),
    'foreignRegistration.foreignBirthNote': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.birthnotebirthnote'),
    'foreignRegistration.foreignRegistrant': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.foreignInformantName'),
    'foreignRegistration.foreignRegistrantRelation': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.foreignInformantRelationship'),
    'foreignRegistration.foreignRegistrantOccupation': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.foreignInformantOccupation'),


    'legacyInfo.legacyBrn': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legecyRegistrationNo'),
    'legacyInfo.legacyBirthPlace': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyBirthPlace'),
    'legacyInfo.legacyRegistrationDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyRegistrationDate'),
    'legacyInfo.akaFirstName': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.akaFirstName'),
    'legacyInfo.akaLastName': (data: EventRegistration) =>
        getCustomField(data, 'birth.child.child-view-group.akaLastName'),
    'legacyInfo.fatherMarriageDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.father.father-view-group.marriageDate'),
    'legacyInfo.fatherMarriagePlace': (data: EventRegistration) =>
        getCustomField(data, 'birth.father.father-view-group.marriagePlace'),
    'legacyInfo.fatherAge': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(data, 'birth.father.father-view-group.fatherAge')
        ),
    'legacyInfo.motherMarriageDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.mother.mother-view-group.marriageDate'),
    'legacyInfo.motherMarriagePlace': (data: EventRegistration) =>
        getCustomField(data, 'birth.mother.mother-view-group.marriagePlace'),
    'legacyInfo.motherAge': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(data, 'birth.mother.mother-view-group.motherAge')
        ),
    'legacyInfo.legacyRecordStatus': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyRecordStatus'),
    'legacyInfo.migratedAt': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.migratedAt'),
    'legacyInfo.migratedBy': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.migratedBy'),
    'legacyInfo.isMigrated': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.migrated'),
    'legacyInfo.legacyEventName': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyEventName'),
    'legacyInfo.legacyEnteredById': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyEnteredById'),
    'legacyInfo.legacyCreatedDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyCreatedDate'),
    'legacyInfo.legacyEventIndex': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyEventIndex'),
    'legacyInfo.legacyDraftId': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyDraftId'),
    'legacyInfo.legacyDistrictOffice': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyDistrictOffice'),
    'legacyInfo.legacyRecordTypeDescription': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyRecordTypeDescription'),
    'legacyInfo.legacyAmendedDate': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyAmendedDate'),
    'legacyInfo.legacyAmendedBy': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyAmendedBy'),
    'legacyInfo.legacyRecordTypeName': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyRecordTypeName'),
    'legacyInfo.legacyRegistrantFirstName': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyRegistrantFirstName'),
    'legacyInfo.legacyRegistrantLastName': (data: EventRegistration) =>
        getCustomField(data, 'birth.dataMigration.dataMigration-view-group.legacyRegistrantLastName'),


    'documents.proofOtherBirthDocuments': (data: EventRegistration) =>
    getDocument(data, 'OTHER'),

}

/** Tonga v1 -> v2 custom-field resolvers for death; merged after `countryResolver` in `buildDeathResolver` so event-specific paths win. */
export const deathCountryResolver = {
    'deceased.foreignDeath': (data: EventRegistration) =>
        coerceLegacyBoolean(
            getCustomField(data, 'death.deceased.deceased-view-group.foreignDeath')
        ),
    'deceased.nonTonganDeath': (data: EventRegistration) =>
        coerceLegacyBoolean(
            getCustomField(data, 'death.deceased.deceased-view-group.nonTonganDeath')
        ),
    'deceased.tongaPassId': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.deceasedTonganDigitalId'),
    'deceased.healthId': (data: EventRegistration) =>
        getCustomField(data, 'death.deceased.deceased-view-group.healthId'),
    'deceased.birthPlace': (data: EventRegistration) =>
        getCustomField(data, 'death.deceased.deceased-view-group.placeOfBirth'),
    'deceased.countryOfBirth': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.deceasedCountryOfBirth'),
    'deceased.numberOfChildren': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(data, 'death.deceased.deceased-view-group.numberOfChildren')
        ),
    'deceased.fileNumber': (data: EventRegistration) =>
        getCustomField(data, 'death.deceased.deceased-view-group.fileNumber'),
    'deceased.grantingOfficialId': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.grantingOfficialId'),
    'deceased.grantDate': (data: EventRegistration) =>
        getCustomField(data, 'death.deceased.deceased-view-group.grantDate'),
    'deceased.grantNote': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.deathDocumentNote'),

    
    'foreignRegistration.foreignRegistrar': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.registrationInfoForeignRegistrar'),
    'foreignRegistration.foreignRegistrationPlace': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.registrationInfoForeignRegistrationPlace'),
    'foreignRegistration.foreignRegistrationDate': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.registrationInfoDate'),
    'foreignRegistration.foreignDeathNote': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.registrationInfoForeignDeathNote'),
    'foreignRegistration.foreignRegistrant': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.foreignDeathInformantName'),
    'foreignRegistration.foreignRegistrantRelation': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.foreignInformantRelationship'),
    'foreignRegistration.foreignRegistrantOccupation': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.foreignDeathInformantOccupation'),


    'eventDetails.placeOfDeath': (data: EventRegistration) =>
        getCustomField(data,'death.deathEvent.deathEvent-view-group.deathPlace'),
    'eventDetails.stillBirth': (data: EventRegistration) => 
        coerceLegacyBoolean(
        getCustomField(data,'death.deathEvent.deathEvent-view-group.isStillBirth')
    ),
    'eventDetails.timeOfDeath': (data: EventRegistration) =>
        getCustomField(data,'death.deathEvent.deathEvent-view-group.stillBirthTime'),
    'eventDetails.gestationalAge': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(data,'death.deathEvent.deathEvent-view-group.deathEventGestationalAge')
        ),

    'informant.tongaPassId': (data: EventRegistration) =>
        getCustomField(data,'death.informant.informant-view-group.informantTonganDigitalId'),


    'spouse.tongaPassId': (data: EventRegistration) =>
        getCustomField(data,'death.spouse.spouse-view-group.spouseTonganDigitalId'),


    'mother.name': (data: EventRegistration) =>
        resolveName(data, data.mother?.name?.[0]),
    'mother.tongaPassId': (data: EventRegistration) =>
        getCustomField(data,'death.mother.mother-view-group.motherTonganDigitalId'),
    'mother.placeOfBirth': (data: EventRegistration) =>
        getCustomField(data,'death.mother.mother-view-group.placeOfBirth'),
    'mother.detailsNotAvailable': (data: EventRegistration) =>!data.mother?.detailsExist,
    'mother.reason': (data: EventRegistration) => data.mother?.reasonNotApplying,
    'mother.dob': (data: EventRegistration) => data.mother?.birthDate,
    'mother.dobUnknown': (data: EventRegistration) =>data.mother?.exactDateOfBirthUnknown,
    'mother.address': (data: EventRegistration) =>resolveAddress(data, data.mother?.address?.[0]),


    'father.tongaPassId': (data: EventRegistration) =>
        getCustomField(data,'death.father.father-view-group.fatherTonganDigitalId'),
    'father.name': (data: EventRegistration) =>resolveName(data, data.father?.name?.[0]),
    'father.placeOfBirth': (data: EventRegistration) =>
        getCustomField(data,'death.father.father-view-group.placeOfBirth'),
    'father.detailsNotAvailable': (data: EventRegistration) =>!data.father?.detailsExist,
    'father.reason': (data: EventRegistration) => data.father?.reasonNotApplying,
    'father.dob': (data: EventRegistration) => data.father?.birthDate,
    'father.dobUnknown': (data: EventRegistration) =>data.father?.exactDateOfBirthUnknown,
    'father.address': (data: EventRegistration) =>resolveAddress(data, data.father?.address?.[0]),
    'father.addressSameAs': (data: EventRegistration) =>
        JSON.stringify(data.father?.address?.[0]) ===JSON.stringify(data.mother?.address?.[0])? 'YES': 'NO',

    'registration.ministerFirstName': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.registrationInfomFirstName'),
    'registration.ministerLastName': (data: EventRegistration) =>
        getCustomField(data,'death.registrationInfo.registrationInfo-view-group.registrationInfomLastName'),


    'administration.comments': (data: EventRegistration) =>
        getCustomField(data,'death.administrationSection.administrationSection-view-group.administrationSectionAdminNote'),

    'legacyInfo.ageMonths': (data: EventRegistration) =>
        coerceLegacyOptionalInt(
            getCustomField(data, 'death.deceased.deceased-view-group.ageMonths')
        ),
    'legacyInfo.childrenLiving': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.childrenLiving'),
    'legacyInfo.akaFirstName': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.akaFirstName'),
    'legacyInfo.akaLastName': (data: EventRegistration) =>
        getCustomField(data,'death.deceased.deceased-view-group.akaLastName'),
    'legacyInfo.legacyDrn': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legecyRegistrationNo'),
    'legacyInfo.migratedAt': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.migratedAt'),
    'legacyInfo.migratedBy': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.migratedBy'),
    'legacyInfo.isMigrated': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.migrated'),
    'legacyInfo.legacyCreatedDate': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyCreatedDate'),
    'legacyInfo.legacyRegistrationDate': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyRegistrationDate'),
    'legacyInfo.legacyEventIndex': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyEventIndex'),
    'legacyInfo.legacyRecordStatus': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyRecordStatus'),
    'legacyInfo.legacyDraftId': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyDraftId'),
    'legacyInfo.legacyEventName': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyEventName'),
    'legacyInfo.legacyEnteredById': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyEnteredById'),
    'legacyInfo.legacyDistrictOffice': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyDistrictOffice'),
    'legacyInfo.legacyAmendedBy': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyAmendedBy'),
    'legacyInfo.legacyAmendedDate': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyAmendedDate'),
    'legacyInfo.legacyRecordTypeName': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyRecordTypeName'),
    'legacyInfo.legacyRecordTypeDescription': (data: EventRegistration) =>
        getCustomField(data,'death.dataMigration.dataMigration-view-group.legacyRecordTypeDescription'),


    'documents.proofOfOther': (data: EventRegistration) =>getDocument(data, 'OTHER'),
}

// The V1 response will populate both the informant and special informant fields
// so we need to check if the informant is a special informant to avoid duplication
export const birthSpecialInformants = ['MOTHER', 'FATHER']
export const deathSpecialInformants = ['SPOUSE']
