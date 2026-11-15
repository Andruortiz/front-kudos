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
    recipientId: string
    categoryId: string
    content: string
    createdAt: string
}

export interface ListKudosResponse {
  items: Kudo[]
}
