import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";
import {
  INotificationProvider,
  NotificationChannel,
  SendNotificationRequest,
  SendNotificationResponse,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

@Injectable()
export class FirebaseService implements INotificationProvider {
  private readonly logger = new Logger(FirebaseService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get<string>("FIREBASE_PROJECT_ID");
    const privateKey = this.configService
      .get<string>("FIREBASE_PRIVATE_KEY")
      ?.replace(/\\n/g, "\n");
    const clientEmail = this.configService.get<string>("FIREBASE_CLIENT_EMAIL");

    if (!projectId || !privateKey || !clientEmail) {
      this.logger.warn(
        "Firebase credentials are not fully configured. Push notification service will be unavailable.",
      );
      return;
    }

    try {
      // Check if already initialized
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });
      }

      this.initialized = true;
      this.logger.log("Firebase service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Firebase service", error);
    }
  }

  getChannel(): NotificationChannel {
    return NotificationChannel.PUSH;
  }

  async send(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResponse> {
    if (!this.initialized) {
      this.logger.error("Firebase service is not initialized");
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: "Firebase service is not initialized",
      };
    }

    const { recipient, payload } = request;

    if (!recipient.deviceToken) {
      this.logger.error(
        "Recipient device token is required for push notifications",
      );
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: "Recipient device token is required",
      };
    }

    try {
      const message: admin.messaging.Message = {
        token: recipient.deviceToken,
        notification: {
          title: payload.subject || "Notification",
          body: payload.body,
          ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
        },
        data: payload.data || {},
      };

      const messageId = await admin.messaging().send(message);

      this.logger.log(
        `Push notification sent successfully to device: ${messageId}`,
      );

      return {
        success: true,
        messageId,
        status: NotificationStatus.SENT,
      };
    } catch (error) {
      this.logger.error("Failed to send push notification", error.stack);

      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message || "Failed to send push notification",
      };
    }
  }
}
