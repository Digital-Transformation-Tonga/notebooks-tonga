import { Address } from '../countryData/addressResolver.ts'

// Form-related types
export interface FormField {
  name: string
  [key: string]: any
}

export interface FormGroup {
  id: string
  fields: FormField[]
}

export interface FormSection {
  id: any
  groups: FormGroup[]
}

export interface Form {
  sections: FormSection[]
}

export interface FormCollection {
  [formName: string]: Form
}

export interface FormFieldWithId extends FormField {
  id: string
}

// Identifier types
export interface Identifier {
  id: string
  type: string
  otherType?: string
}

// Document types
export interface Document {
  uri: string
  contentType: string
  type: string
  subject?: string
}

export interface ProcessedDocumentWithOptionType {
  path: string
  originalFilename: string
  type: string
  option: string
}
export interface ProcessedDocument {
  path: string
  originalFilename: string
  type: string
}

// Address types
export interface AddressLine {
  type?: string
  line: string[]
  city?: string
  district?: string
  state?: string
  country: string
  postalCode?: string
}

// Name types
export interface Name {
  firstname?: string
  middlename?: string
  surname?: string
  firstNames?: string
  familyName?: string
  middleName?: string
}

// Person types
export interface PersonWithIdentifiers {
  identifier?: Identifier[]
  name?: Name[]
  birthDate?: string
  gender?: string
  nationality?: string[]
  address?: AddressLine[]
  detailsExist?: boolean
  reasonNotApplying?: string
  exactDateOfBirthUnknown?: boolean
  ageOfIndividualInYears?: number
  maritalStatus?: string
  educationalAttainment?: string
  occupation?: string
  multipleBirth?: number
  relationship?: string
  otherRelationship?: string
  deceased?: {
    deathDate?: string
  }
}

// Event location types
export interface EventLocation {
  type: 'HEALTH_FACILITY' | 'PRIVATE_HOME' | 'OTHER'
  id?: string
  address?: AddressLine
}

// Registration types
export interface Registration {
  trackingId: string
  registrationNumber?: string
  contactPhoneNumber?: string
  contactEmail?: string
  informantsSignature?: string
  attachments?: Document[]
  duplicates?: Array<{ compositionId: string; trackingId?: string }>
}

// History item types
export interface User {
  id: string
  role: { id: string }
}

export interface Office {
  id: string
}

export interface SystemInfo {
  type: string
}

export interface Certificate {
  [key: string]: any
}

export interface StatusReason {
  text: string
}

export interface Payment {
  amount: number
}

export interface Comment {
  comment: string
}

export interface HistoryItem {
  id?: string
  date: string
  regStatus?: string
  action?: string
  user?: User
  office?: Office
  system?: SystemInfo
  input?: Array<{
    valueCode: string
    valueId: string
    value: any
  }>
  output?: Array<{
    valueCode: string
    valueId: string
    value: any
  }>
  comments?: Comment[]
  certificates?: Certificate[]
  certificateTemplateId?: string
  statusReason?: StatusReason
  payment?: Payment
  reason?: string
  otherReason?: string
  hasShowedVerifiedDocument?: boolean
  requester?: string
  requesterOther?: string
  annotation?: Record<string, any>
  requestId?: string
}

// Resolver types
export type ResolverFunction<T = any> = (
  data: T,
  eventType: 'birth' | 'death'
) => any

export interface ResolverMap {
  [fieldId: string]: ResolverFunction
}

// Event registration types
export interface EventRegistration {
  id: string
  child?: PersonWithIdentifiers
  mother?: PersonWithIdentifiers
  father?: PersonWithIdentifiers
  deceased?: PersonWithIdentifiers
  informant?: PersonWithIdentifiers
  spouse?: PersonWithIdentifiers
  registration: Registration
  history: HistoryItem[]
  questionnaire?: Array<{
    fieldId: string
    value: any
  }>
  eventLocation?: EventLocation
  attendantAtBirth?: string
  birthType?: string
  weightAtBirth?: number
  deathDate?: string
  deathDescription?: string
  causeOfDeathEstablished?: 'true' | 'false'
  causeOfDeathMethod?: string
  mannerOfDeath?: string
}

// Action types
export type ActionType =
  | 'CREATE'
  | 'DECLARE'
  | 'REGISTER'
  | 'VALIDATE'
  | 'PRINT_CERTIFICATE'
  | 'REJECT'
  | 'ARCHIVE'
  | 'REQUEST_CORRECTION'
  | 'APPROVE_CORRECTION'
  | 'REJECT_CORRECTION'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'DUPLICATE_DETECTED'
  | 'MARK_AS_DUPLICATE'
  | 'MARK_AS_NOT_DUPLICATE'
  | 'READ'
  | 'REINSTATE'

export interface ActionContent {
  templateId?: string
  reason?: string
  duplicates?: Duplicate[]
}

export interface Duplicate {
  id: string
  trackingId?: string
}

export interface ActionAnnotation {
  [key: string]: any
}

export interface Action {
  id: string
  transactionId: string
  type: ActionType
  createdAt: string
  createdBy: string
  createdByUserType: 'user' | 'system'
  createdByRole: string
  createdAtLocation?: string
  updatedAtLocation?: string
  status: string
  declaration: Record<string, any>
  content?: ActionContent
  annotation?: ActionAnnotation
  registrationNumber?: string
  assignedTo?: string
  requestId?: string
  originalActionId?: string
}

// Document output types
export interface TransformedDocument {
  id: string
  type: 'birth' | 'death'
  createdAt: string
  updatedAt: string
  updatedAtLocation: string
  trackingId: string
  actions: Action[]
}

// Mapping types
export interface FieldMapping {
  [oldField: string]: string
}

export interface NameMapping {
  [field: string]: (value: string) => Record<string, Name>
}

export interface AddressMapping {
  [field: string]: (value: string) => Record<string, Address>
}

// Generic utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type NonNullable<T> = T extends null | undefined ? never : T
