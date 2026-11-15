export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'PUSH'

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED'

export type Role =
  | 'ADMINISTRATOR'
  | 'RECTOR'
  | 'ACADEMIC_COORDINATOR'
  | 'FACULTY_COORDINATOR'
  | 'PROGRAM_COORDINATOR'
  | 'TEACHER'
  | 'STUDENT'

export interface PublishKudoRequest {
  recipientId: string
  categoryId: string
  content: string
}

export interface NotificationResponse {
  channel: NotificationChannel
  status: NotificationStatus
}

export interface PublishKudoResponse {
  id: string
  status: 'PUBLISHED'
  createdAt: string
  notifications: NotificationResponse[]
}

export interface Recipient {
  id: string
  name: string
  email: string
  role: Role
}

export interface ListRecipientsResponse {
  items: Recipient[]
}

export interface ErrorBody {
  code: string
  message: string
}

export interface Category {
  id: string
  name: string
}

export interface ListCategoriesResponse {
  items: Category[]
}


export interface Kudo {
    id: string
    authorId: string
    authorName: string | null
    recipientId: string
    recipientName: string | null
    categoryId: string
    categoryName: string | null
    content: string
    createdAt: string
}

export interface ListKudosResponse {
  items: Kudo[]
}

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE'

export interface Profile {
    id: string
    name: string
    email: string
    phone: string | null
    phoneVerified: boolean
    role: Role
    status: UserStatus
}

export interface AttachmentInfo {
  name: string
  contentType: string
  size: number
}

export interface KudoDetail {
  id: string
  authorId: string
  authorName: string | null
  recipientId: string
  recipientName: string | null
  categoryId: string
  categoryName: string | null
  content: string
  createdAt: string
  attachments: AttachmentInfo[]
}

export type SelfRegistrationRole = "STUDENT" | "TEACHER"

export interface RegistrationRequest {
  name: string
  email: string
  phone: string
  role: SelfRegistrationRole
}

export interface RegistrationResponse {
  id: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}
