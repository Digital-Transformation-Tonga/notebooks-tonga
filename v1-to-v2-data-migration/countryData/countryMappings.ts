/*
    Regular Field format: 
    {v1EventName}.{section.id}{v1Field.id}: {v2Field.id}

    Custom Field format:
    {v1Field.customQuestionMappingId}: {v2Field.id}
*/

export const COUNTRY_FIELD_MAPPINGS = {
'birth.child.child-view-group.nonTongan':'child.nonTonganBirth',
'birth.child.child-view-group.foreignBirth':'child.foreignBirth',
'birth.child.child-view-group.birthTime':'child.birthTime',
'birth.child.child-view-group.childNationality':'child.nationality',
'birth.child.child-view-group.childStatus':'child.childStatus',
'birth.child.child-view-group.attendantFirstName':'child.attendantFirstName',
'birth.child.child-view-group.birthOrder':'child.birthOrder',
'birth.child.child-view-group.fileNumber':'child.fileNumber',
'birth.child.child-view-group.grantingOfficialId':'child.grantingOfficialId',
'birth.child.child-view-group.grantDate':'child.grantDate',
'birth.child.child-view-group.childPlaceOfBirth':'child.placeOfBirth',
'birth.child.child-view-group.birthDocumentNote':'child.birthNote',
'birth.child.child-view-group.foreignRegistrar':'foreignRegistration.foreignRegistrar',
'birth.child.child-view-group.foreignRegistrationPlace':'foreignRegistration.foreignRegistrationPlace',
'birth.child.child-view-group.foreignRegistrationDate':'foreignRegistration.foreignRegistrationDate',
'birth.child.child-view-group.birthnotebirthnote':'foreignRegistration.foreignBirthNote',
'birth.child.child-view-group.foreignInformantName':'foreignRegistration.foreignRegistrant',
'birth.child.child-view-group.foreignInformantRelationship':'foreignRegistration.foreignRegistrantRelation',
'birth.child.child-view-group.foreignInformantOccupation':'foreignRegistration.foreignRegistrantOccupation',
'birth.child.child-view-group.akaFirstName':'legacyInfo.akaFirstName',
'birth.child.child-view-group.akaLastName':'legacyInfo.akaLastName',

'birth.informant.informant-view-group.informantTonganDigitalId':'informant.tongaPassId',

'birth.mother.mother-view-group.motherTonganDigitalId':'mother.tongaPassId',
'birth.mother.mother-view-group.motherBirthPlace':'mother.placeOfBirth',
'birth.mother.mother-view-group.numberOfChildrenExcludingThisBirth':'mother.numberOfChildrenExcludingThisBirth',
'birth.mother.mother-view-group.marriageDate':'legacyInfo.motherMarriageDate',
'birth.mother.mother-view-group.marriagePlace':'legacyInfo.motherMarriagePlace',
'birth.mother.mother-view-group.motherAge':'legacyInfo.motherAge',

'birth.father.father-view-group.fatherTonganDigitalId':'father.tongaPassId',
'birth.father.father-view-group.fatherBirthPlace':'father.placeOfBirth',
'birth.father.father-view-group.marriageDate':'legacyInfo.fatherMarriageDate',
'birth.father.father-view-group.marriagePlace':'legacyInfo.fatherMarriagePlace',
'birth.father.father-view-group.fatherAge':'legacyInfo.fatherAge',

'birth.dataMigration.dataMigration-view-group.legecyRegistrationNo':'legacyInfo.legacyBrn',
'birth.dataMigration.dataMigration-view-group.legacyBirthPlace':'legacyInfo.legacyBirthPlace',
'birth.dataMigration.dataMigration-view-group.legacyRegistrationDate':'legacyInfo.legacyRegistrationDate',

'birth.dataMigration.dataMigration-view-group.legacyRecordStatus':'legacyInfo.legacyRecordStatus',
'birth.dataMigration.dataMigration-view-group.migratedAt':'legacyInfo.migratedAt',
'birth.dataMigration.dataMigration-view-group.migratedBy':'legacyInfo.migratedBy',
'birth.dataMigration.dataMigration-view-group.migrated':'legacyInfo.isMigrated',
'birth.dataMigration.dataMigration-view-group.legacyEventName':'legacyInfo.legacyEventName',
'birth.dataMigration.dataMigration-view-group.legacyEnteredById':'legacyInfo.legacyEnteredById',
'birth.dataMigration.dataMigration-view-group.legacyCreatedDate':'legacyInfo.legacyCreatedDate',
'birth.dataMigration.dataMigration-view-group.legacyEventIndex':'legacyInfo.legacyEventIndex',
'birth.dataMigration.dataMigration-view-group.legacyDraftId':'legacyInfo.legacyDraftId',
'birth.dataMigration.dataMigration-view-group.legacyDistrictOffice':'legacyInfo.legacyDistrictOffice',
'birth.dataMigration.dataMigration-view-group.legacyRecordTypeDescription':'legacyInfo.legacyRecordTypeDescription',
'birth.dataMigration.dataMigration-view-group.legacyAmendedDate':'legacyInfo.legacyAmendedDate',
'birth.dataMigration.dataMigration-view-group.legacyAmendedBy':'legacyInfo.legacyAmendedBy',
'birth.dataMigration.dataMigration-view-group.legacyRecordTypeName':'legacyInfo.legacyRecordTypeName',
'birth.dataMigration.dataMigration-view-group.legacyRegistrantFirstName':'legacyInfo.legacyRegistrantFirstName',
'birth.dataMigration.dataMigration-view-group.legacyRegistrantLastName':'legacyInfo.legacyRegistrantLastName',

'birth.documents.uploadDocForOtherBirthDocuments':'documents.proofOtherBirthDocuments',


'death.deceased.deceased-view-group.foreignDeath': 'deceased.foreignDeath',
'death.deceased.deceased-view-group.nonTonganDeath':'deceased.nonTonganDeath',
'death.deceased.deceased-view-group.deceasedTonganDigitalId': 'deceased.tongaPassId',
'death.deceased.deceased-view-group.placeOfBirth': 'deceased.birthPlace',
'death.deceased.deceased-view-group.deceasedCountryOfBirth': 'deceased.countryOfBirth',
'death.deceased.deceased-view-group.numberOfChildren': 'deceased.numberOfChildren',
'death.deceased.deceased-view-group.healthId':'deceased.healthId',
'death.deceased.deceased-view-group.fileNumber': 'deceased.fileNumber',
'death.deceased.deceased-view-group.grantingOfficialId':'deceased.grantingOfficialId',
'death.deceased.deceased-view-group.grantDate':'deceased.grantDate',
'death.deceased.deceased-view-group.deathDocumentNote': 'deceased.grantNote',
'death.deceased.deceased-view-group.ageMonths': 'legacyInfo.ageMonths',
'death.deceased.deceased-view-group.childrenLiving': 'legacyInfo.childrenLiving',
'death.deceased.deceased-view-group.akaFirstName': 'legacyInfo.akaFirstName',
'death.deceased.deceased-view-group.akaLastName': 'legacyInfo.akaLastName',

'death.registrationInfo.registrationInfo-view-group.registrationInfoForeignRegistrar': 'foreignRegistration.foreignRegistrar',
'death.registrationInfo.registrationInfo-view-group.registrationInfoForeignRegistrationPlace': 'foreignRegistration.foreignRegistrationPlace',
'death.registrationInfo.registrationInfo-view-group.registrationInfoDate': 'foreignRegistration.foreignRegistrationDate',
'death.registrationInfo.registrationInfo-view-group.registrationInfoForeignDeathNote': 'foreignRegistration.foreignDeathNote',
'death.registrationInfo.registrationInfo-view-group.foreignDeathInformantName': 'foreignRegistration.foreignRegistrant',
'death.registrationInfo.registrationInfo-view-group.foreignInformantRelationship': 'foreignRegistration.foreignRegistrantRelation',
'death.registrationInfo.registrationInfo-view-group.foreignDeathInformantOccupation': 'foreignRegistration.foreignRegistrantOccupation',

'death.deathEvent.deathEvent-view-group.deathPlace': 'eventDetails.placeOfDeath',
'death.deathEvent.deathEvent-view-group.isStillBirth': 'eventDetails.stillBirth',
'death.deathEvent.deathEvent-view-group.stillBirthTime': 'eventDetails.timeOfDeath',
'death.deathEvent.deathEvent-view-group.deathEventGestationalAge': 'eventDetails.gestationalAge',

'death.informant.informant-view-group.informantTonganDigitalId': 'informant.tongaPassId',

'death.spouse.spouse-view-group.spouseTonganDigitalId': 'spouse.tongaPassId',

'death.mother.mother-view-group.motherTonganDigitalId': 'mother.tongaPassId',
'death.mother.mother-view-group.placeOfBirth': 'mother.placeOfBirth',
'death.mother.detailsExist': 'mother.detailsNotAvailable',
'death.mother.reasonNotApplying': 'mother.reason',
'death.mother.motherBirthDate': 'mother.dob',
'death.mother.exactDateOfBirthUnknown': 'mother.dobUnknown',

'death.father.father-view-group.fatherTonganDigitalId': 'father.tongaPassId',
'death.father.father-view-group.placeOfBirth': 'father.placeOfBirth',
'death.father.detailsExist': 'father.detailsNotAvailable',
'death.father.reasonNotApplying': 'father.reason',
'death.father.fatherBirthDate': 'father.dob',
'death.father.exactDateOfBirthUnknown': 'father.dobUnknown',
'death.father.primaryAddressSameAsOtherPrimary': 'father.addressSameAs',

'death.registrationInfo.registrationInfo-view-group.registrationInfomFirstName': 'registration.ministerFirstName',
'death.registrationInfo.registrationInfo-view-group.registrationInfomLastName': 'registration.ministerLastName',

'death.administrationSection.administrationSection-view-group.administrationSectionAdminNote': 'administration.comments',

'death.documents.uploadDocForOtherDeathDocuments': 'documents.proofOfOther',

'death.dataMigration.dataMigration-view-group.legecyRegistrationNo': 'legacyInfo.legacyDrn',
'death.dataMigration.dataMigration-view-group.migratedAt': 'legacyInfo.migratedAt',
'death.dataMigration.dataMigration-view-group.migratedBy': 'legacyInfo.migratedBy',
'death.dataMigration.dataMigration-view-group.migrated': 'legacyInfo.isMigrated',
'death.dataMigration.dataMigration-view-group.legacyCreatedDate': 'legacyInfo.legacyCreatedDate',
'death.dataMigration.dataMigration-view-group.legacyRegistrationDate': 'legacyInfo.legacyRegistrationDate',
'death.dataMigration.dataMigration-view-group.legacyEventIndex': 'legacyInfo.legacyEventIndex',
'death.dataMigration.dataMigration-view-group.legacyRecordStatus': 'legacyInfo.legacyRecordStatus',
'death.dataMigration.dataMigration-view-group.legacyDraftId': 'legacyInfo.legacyDraftId',
'death.dataMigration.dataMigration-view-group.legacyEventName': 'legacyInfo.legacyEventName',
'death.dataMigration.dataMigration-view-group.legacyEnteredById': 'legacyInfo.legacyEnteredById',
'death.dataMigration.dataMigration-view-group.legacyDistrictOffice': 'legacyInfo.legacyDistrictOffice',
'death.dataMigration.dataMigration-view-group.legacyAmendedBy': 'legacyInfo.legacyAmendedBy',
'death.dataMigration.dataMigration-view-group.legacyAmendedDate': 'legacyInfo.legacyAmendedDate',
'death.dataMigration.dataMigration-view-group.legacyRecordTypeName': 'legacyInfo.legacyRecordTypeName',
'death.dataMigration.dataMigration-view-group.legacyRecordTypeDescription': 'legacyInfo.legacyRecordTypeDescription',
}


