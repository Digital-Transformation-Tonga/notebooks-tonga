import { API, GATEWAY } from './routes.ts'

export type ImportContext = {
  entryIds?: string[]
  trackingIds?: string[]
}

const readResponseBody = async (response: Response) => {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

const formatImportContext = (context?: ImportContext) => {
  if (!context) {
    return 'none'
  }

  const parts: string[] = []
  if (context.entryIds?.length) {
    parts.push(`entryIds=[${context.entryIds.join(', ')}]`)
  }
  if (context.trackingIds?.length) {
    parts.push(`trackingIds=[${context.trackingIds.join(', ')}]`)
  }
  return parts.join(', ') || 'none'
}

const formatImportErrorMessage = (
  response: Response,
  errorBody: unknown,
  context?: ImportContext
) => {
  const body = errorBody as Record<string, any>
  const apiMessage =
    body?.error?.json?.message ||
    body?.error?.message ||
    body?.message ||
    (typeof body?.raw === 'string' ? body.raw : undefined)

  const parts = [`${response.status} ${response.statusText}`]

  if (apiMessage) {
    parts.push(String(apiMessage))
  }

  const apiCode =
    body?.error?.json?.data?.code ||
    body?.error?.json?.code ||
    body?.error?.code

  if (apiCode) {
    parts.push(String(apiCode))
  }

  return `Event creation failed: ${parts.join(' | ')}`
}

const logImportFailure = (
  label: string,
  response: Response,
  errorBody: unknown,
  context?: ImportContext,
  payloadSizeBytes?: number
) => {
  console.error(`${label} ERROR`)
  console.error(`Status: ${response.status} ${response.statusText}`)
  if (payloadSizeBytes !== undefined) {
    console.error(
      `Payload size: ${(payloadSizeBytes / 1024 / 1024).toFixed(2)} MB`
    )
  }
  console.error(`Context: ${formatImportContext(context)}`)
  console.error('Response body:', JSON.stringify(errorBody, null, 2))
}

export const declareEvent = async (
  document: any,
  token: string,
  context?: ImportContext
) => {
  const body = JSON.stringify({
    json: document,
    meta: {
      values: {
        declaration: ['undefined'],
      },
    },
  })

  const response = await fetch(`${GATEWAY}/events/event.import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  if (!response.ok) {
    const errorBody = await readResponseBody(response)
    if (context?.entryIds?.length === 1) {
      logImportFailure('DECLARE', response, errorBody, context, body.length)
    }

    throw new Error(formatImportErrorMessage(response, errorBody, context))
  }
  return response.json()
}

export const bulkImport = async (
  documents: any[],
  token: string,
  context?: ImportContext
) => {
  const body = JSON.stringify({
    json: documents,
    meta: {
      values: {
        declaration: ['undefined'],
      },
    },
  })

  const response = await fetch(`${GATEWAY}/events/event.bulkImport`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  if (!response.ok) {
    const errorBody = await readResponseBody(response)
    if (context?.entryIds?.length === 1) {
      logImportFailure('BULK IMPORT', response, errorBody, context, body.length)
    }

    throw new Error(formatImportErrorMessage(response, errorBody, context))
  }
  return response.json()
}

export const registerSystem = async (token: string) => {
  const response = await fetch(`${GATEWAY}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      operationName: 'registerSystem',
      variables: {
        system: {
          type: 'IMPORT_EXPORT',
          name: 'Migration',
        },
      },
      query: `mutation registerSystem($system: SystemInput) {
        registerSystem(system: $system) {
          clientSecret
          system {
            _id
            clientId
            name
            shaSecret
            status
            type
            integratingSystemType
            settings {
              webhook {
                event
                permissions
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
      }`,
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }
  return response.json()
}

const GetRegistrationsList = async (
  token: string,
  event: string,
  page: number,
  pageSize: number
): Promise<any> => {
  const skip = (page - 1) * pageSize
  const searchSet =
    event === 'birth' ? 'BirthEventSearchSet' : 'DeathEventSearchSet'

  const fetchWithDynamicChunking = async (currentSkip: number, currentCount: number, attempt = 0): Promise<any> => {
    const query = JSON.stringify({
      operationName: 'GetRegistrationsListByFilter',
      query: `query GetRegistrationsListByFilter {
        searchEvents(advancedSearchParameters: { event: ${event} }, count: ${currentCount}, skip: ${currentSkip}, sortColumn: "dateOfDeclaration") {
          totalItems
          results {
            ... on ${searchSet} {
              id
            }
          }
        }
      }`,
    })

    try {
      const response = await fetch(`${GATEWAY}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: query,
      })
      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.errors && data.errors.length > 0) {
        throw new Error(`GraphQL error: ${data.errors[0].message}`)
      }
      return data
    } catch (e) {
      if (currentCount > 100) {
        // Adaptive chunking: split the request in half if it fails and count > 100
        const newCount = Math.floor(currentCount / 2)
        console.warn(`Request failed for count=${currentCount}, dynamically reducing batch to ${newCount}...`)
        
        // Fetch both halves sequentially to avoid overwhelming the server again
        const firstHalf = await fetchWithDynamicChunking(currentSkip, newCount, 0)
        const secondHalf = await fetchWithDynamicChunking(currentSkip + newCount, currentCount - newCount, 0)
        
        return {
          data: {
            searchEvents: {
              totalItems: firstHalf.data.searchEvents.totalItems,
              results: [
                ...firstHalf.data.searchEvents.results,
                ...secondHalf.data.searchEvents.results
              ]
            }
          }
        }
      } else {
        // Base exponential backoff for smaller chunks
        attempt++
        if (attempt >= 5) throw e
        console.warn(`GetRegistrationsList failed at count=${currentCount}, retrying in ${attempt * 5}s... (${e instanceof Error ? e.message : 'Unknown error'})`)
        await new Promise((res) => setTimeout(res, attempt * 5000))
        return await fetchWithDynamicChunking(currentSkip, currentCount, attempt)
      }
    }
  }

  return await fetchWithDynamicChunking(skip, pageSize)
}

export const fetchAllBirthRegistrations = async (
  token: string,
  page: number,
  pageSize: number
) => {
  return await GetRegistrationsList(token, 'birth', page, pageSize)
}

export const fetchAllDeathRegistrations = async (
  token: string,
  page: number,
  pageSize: number
) => {
  return await GetRegistrationsList(token, 'death', page, pageSize)
}

export const fetchBirthRegistration = async (
  recordId: string,
  token: string
) => {
  const response = await fetch(`${GATEWAY}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      operationName: 'fetchBirthRegistrationForReview',
      variables: {
        id: recordId,
      },
      query: `query fetchBirthRegistrationForReview($id: ID!) {
        fetchBirthRegistration(id: $id) {
          _fhirIDMap
          id
          child {
            id
            identifier {
              id
              type
              otherType
              __typename
            }
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            birthDate
            gender
            __typename
          }
          informant {
            id
            relationship
            otherRelationship
            _fhirIDPatient
            identifier {
              id
              type
              otherType
              fieldsModifiedByIdentity
              __typename
            }
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            occupation
            nationality
            birthDate
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            __typename
          }
          mother {
            id
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            multipleBirth
            birthDate
            maritalStatus
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            dateOfMarriage
            educationalAttainment
            nationality
            identifier {
              id
              type
              otherType
              fieldsModifiedByIdentity
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            telecom {
              system
              value
              __typename
            }
            __typename
          }
          father {
            id
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            birthDate
            maritalStatus
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            dateOfMarriage
            educationalAttainment
            nationality
            identifier {
              id
              type
              otherType
              fieldsModifiedByIdentity
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            telecom {
              system
              value
              __typename
            }
            __typename
          }
          registration {
            id
            informantType
            otherInformantType
            contact
            contactRelationship
            contactPhoneNumber
            contactEmail
            assignment {
              practitionerId
              firstName
              lastName
              officeName
              avatarURL
              __typename
            }
            certificates {
              hasShowedVerifiedDocument
              certificateTemplateId
              collector {
                relationship
                otherRelationship
                name {
                  use
                  firstNames
                  familyName
                  __typename
                }
                telecom {
                  system
                  value
                  use
                  __typename
                }
                identifier {
                  id
                  type
                  otherType
                  __typename
                }
                __typename
              }
              __typename
            }
            duplicates {
              compositionId
              trackingId
              __typename
            }
            informantsSignature
            attachments {
              data
              uri
              type
              contentType
              subject
              __typename
            }
            status {
              comments {
                comment
                __typename
              }
              type
              timestamp
              office {
                name
                alias
                address {
                  district
                  state
                  __typename
                }
                partOf
                __typename
              }
              __typename
            }
            type
            trackingId
            registrationNumber
            __typename
          }
          attendantAtBirth
          weightAtBirth
          birthType
          eventLocation {
            id
            type
            address {
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            __typename
          }
          questionnaire {
            fieldId
            value
            __typename
          }
          history {
            otherReason
            requester
            requesterOther
            noSupportingDocumentationRequired
            hasShowedVerifiedDocument
            certificateTemplateId
            date
            action
            regStatus
            dhis2Notification
            ipAddress
            documents {
              id
              data
              uri
              type
              __typename
            }
            payment {
              id
              type
              amount
              outcome
              date
              attachmentURL
              __typename
            }
            statusReason {
              text
              __typename
            }
            reason
            location {
              id
              name
              __typename
            }
            office {
              id
              name
              alias
              address {
                state
                district
                __typename
              }
              __typename
            }
            system {
              name
              type
              __typename
            }
            user {
              id
              role {
                id
                label {
                  id
                  defaultMessage
                  description
                  __typename
                }
                __typename
              }
              primaryOffice {
                id
                __typename
              }
              name {
                firstNames
                familyName
                use
                __typename
              }
              avatar {
                data
                type
                __typename
              }
              fullHonorificName
              __typename
            }
            signature {
              data
              type
              __typename
            }
            comments {
              user {
                id
                username
                avatar {
                  data
                  type
                  __typename
                }
                __typename
              }
              comment
              createdAt
              __typename
            }
            input {
              valueCode
              valueId
              value
              __typename
            }
            output {
              valueCode
              valueId
              value
              __typename
            }
            certificates {
              hasShowedVerifiedDocument
              certificateTemplateId
              collector {
                relationship
                otherRelationship
                name {
                  use
                  firstNames
                  familyName
                  __typename
                }
                telecom {
                  system
                  value
                  use
                  __typename
                }
                identifier {
                  id
                  type
                  otherType
                  __typename
                }
                __typename
              }
              certifier {
                name {
                  use
                  firstNames
                  familyName
                  __typename
                }
                role {
                  id
                  label {
                    id
                    defaultMessage
                    description
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
            duplicateOf
            potentialDuplicates
            __typename
          }
          __typename
        }
      }`,
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }
  return response.json()
}

export const fetchDeathRegistration = async (
  recordId: string,
  token: string
) => {
  const response = await fetch(`${GATEWAY}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      operationName: 'fetchDeathRegistrationForReview',
      variables: {
        id: recordId,
      },
      query: `query fetchDeathRegistrationForReview($id: ID!) {
        fetchDeathRegistration(id: $id) {
          _fhirIDMap
          id
          deceased {
            id
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            birthDate
            age
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            gender
            maritalStatus
            occupation
            nationality
            identifier {
              id
              type
              otherType
              __typename
            }
            gender
            deceased {
              deathDate
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            __typename
          }
          informant {
            id
            relationship
            otherRelationship
            _fhirIDPatient
            identifier {
              id
              type
              otherType
              __typename
            }
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            nationality
            occupation
            birthDate
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            telecom {
              system
              value
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            __typename
          }
          father {
            id
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            birthDate
            maritalStatus
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            dateOfMarriage
            educationalAttainment
            nationality
            identifier {
              id
              type
              otherType
              fieldsModifiedByIdentity
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            telecom {
              system
              value
              __typename
            }
            __typename
          }
          mother {
            id
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            birthDate
            maritalStatus
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            dateOfMarriage
            educationalAttainment
            nationality
            identifier {
              id
              type
              otherType
              fieldsModifiedByIdentity
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            telecom {
              system
              value
              __typename
            }
            __typename
          }
          spouse {
            id
            name {
              use
              firstNames
              middleName
              familyName
              __typename
            }
            birthDate
            maritalStatus
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            dateOfMarriage
            educationalAttainment
            nationality
            identifier {
              id
              type
              otherType
              fieldsModifiedByIdentity
              __typename
            }
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            telecom {
              system
              value
              __typename
            }
            __typename
          }
          medicalPractitioner {
            name
            qualification
            lastVisitDate
            __typename
          }
          registration {
            id
            contact
            informantType
            otherInformantType
            contactRelationship
            contactPhoneNumber
            contactEmail
            assignment {
              practitionerId
              firstName
              lastName
              officeName
              avatarURL
              __typename
            }
            certificates {
              hasShowedVerifiedDocument
              certificateTemplateId
              collector {
                relationship
                otherRelationship
                name {
                  use
                  firstNames
                  familyName
                  __typename
                }
                telecom {
                  system
                  value
                  use
                  __typename
                }
                identifier {
                  id
                  type
                  otherType
                  __typename
                }
                __typename
              }
              __typename
            }
            duplicates {
              compositionId
              trackingId
              __typename
            }
            informantsSignature
            attachments {
              data
              uri
              type
              contentType
              subject
              __typename
            }
            status {
              comments {
                comment
                __typename
              }
              type
              timestamp
              office {
                name
                alias
                address {
                  district
                  state
                  __typename
                }
                partOf
                __typename
              }
              __typename
            }
            type
            trackingId
            registrationNumber
            __typename
          }
          eventLocation {
            id
            type
            address {
              type
              line
              district
              state
              city
              postalCode
              country
              __typename
            }
            __typename
          }
          questionnaire {
            fieldId
            value
            __typename
          }
          mannerOfDeath
          causeOfDeathEstablished
          causeOfDeathMethod
          causeOfDeath
          deathDescription
          maleDependentsOfDeceased
          femaleDependentsOfDeceased
          history {
            documents {
              id
              data
              uri
              type
              __typename
            }
            payment {
              id
              type
              amount
              outcome
              date
              attachmentURL
              __typename
            }
            otherReason
            requester
            requesterOther
            hasShowedVerifiedDocument
            certificateTemplateId
            noSupportingDocumentationRequired
            date
            action
            regStatus
            dhis2Notification
            ipAddress
            statusReason {
              text
              __typename
            }
            reason
            location {
              id
              name
              __typename
            }
            office {
              id
              name
              alias
              address {
                state
                district
                __typename
              }
              __typename
            }
            system {
              name
              type
              __typename
            }
            user {
              id
              role {
                id
                label {
                  id
                  defaultMessage
                  description
                  __typename
                }
                __typename
              }
              primaryOffice {
                id
                __typename
              }
              name {
                firstNames
                familyName
                use
                __typename
              }
              avatar {
                data
                type
                __typename
              }
              fullHonorificName
              __typename
            }
            signature {
              data
              type
              __typename
            }
            comments {
              user {
                id
                username
                avatar {
                  data
                  type
                  __typename
                }
                __typename
              }
              comment
              createdAt
              __typename
            }
            input {
              valueCode
              valueId
              value
              __typename
            }
            output {
              valueCode
              valueId
              value
              __typename
            }
            certificates {
              hasShowedVerifiedDocument
              certificateTemplateId
              collector {
                relationship
                otherRelationship
                name {
                  use
                  firstNames
                  familyName
                  __typename
                }
                telecom {
                  system
                  value
                  use
                  __typename
                }
                identifier {
                  id
                  type
                  otherType
                  __typename
                }          
                __typename
              }
              certifier {
                name {
                  use
                  firstNames
                  familyName
                  __typename
                }
                role {
                  id
                  label {
                    id
                    defaultMessage
                    description
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
            duplicateOf
            potentialDuplicates
            __typename
          }
          __typename
        }
      }`,
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }
  return response.json()
}

export const syncLocations = async (token: string) => {
  const response = await fetch(`${API}/events/sync-locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Sync Locations failed: ${response.statusText}`)
  }
  return response.statusText
}

export const reindex = async (token: string) => {
  const response = await fetch(`${API}/events/events/reindex`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Reindex failed: ${response.statusText}`)
  }
  return response.statusText
}
