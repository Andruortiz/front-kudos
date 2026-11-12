export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'PUSH'

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED'

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

export interface ErrorBody {
  code: string
  message: string
}
