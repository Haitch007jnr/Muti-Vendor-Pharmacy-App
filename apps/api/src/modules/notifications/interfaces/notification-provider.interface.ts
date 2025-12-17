export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
}

export enum NotificationPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  DELIVERED = "delivered",
}

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  deviceToken?: string;
  userId?: string;
}

export interface NotificationPayload {
  subject?: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

export interface SendNotificationRequest {
  recipient: NotificationRecipient;
  payload: NotificationPayload;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface SendNotificationResponse {
  success: boolean;
  messageId?: string;
  status: NotificationStatus;
  error?: string;
}

export interface INotificationProvider {
  send(request: SendNotificationRequest): Promise<SendNotificationResponse>;
  getChannel(): NotificationChannel;
}
