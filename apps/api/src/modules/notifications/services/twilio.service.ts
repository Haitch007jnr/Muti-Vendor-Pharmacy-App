import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Twilio } from "twilio";
import {
  INotificationProvider,
  NotificationChannel,
  SendNotificationRequest,
  SendNotificationResponse,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

@Injectable()
export class TwilioService implements INotificationProvider {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: Twilio;
  private readonly phoneNumber: string;
  private initialized = false;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");
    this.phoneNumber =
      this.configService.get<string>("TWILIO_PHONE_NUMBER") || "";

    if (!accountSid || !authToken || !this.phoneNumber) {
      this.logger.warn(
        "Twilio credentials are not fully configured. SMS service will be unavailable.",
      );
      return;
    }

    try {
      this.client = new Twilio(accountSid, authToken);
      this.initialized = true;
      this.logger.log("Twilio service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Twilio service", error);
    }
  }

  getChannel(): NotificationChannel {
    return NotificationChannel.SMS;
  }

  async send(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResponse> {
    if (!this.initialized) {
      this.logger.error("Twilio service is not initialized");
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: "Twilio service is not initialized",
      };
    }

    const { recipient, payload } = request;

    if (!recipient.phone) {
      this.logger.error("Recipient phone number is required for SMS notifications");
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: "Recipient phone number is required",
      };
    }

    try {
      const message = await this.client.messages.create({
        body: payload.body,
        from: this.phoneNumber,
        to: recipient.phone,
      });

      // Mask phone number for logging to protect privacy
      const maskedPhone = this.maskPhoneNumber(recipient.phone);
      this.logger.log(`SMS sent successfully to ${maskedPhone}: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
        status: this.mapTwilioStatus(message.status),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${recipient.phone}`,
        error.stack,
      );

      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message || "Failed to send SMS",
      };
    }
  }

  private maskPhoneNumber(phone: string): string {
    // Mask phone number for privacy: show first 3 and last 2 digits
    if (phone.length <= 5) {
      return "***";
    }
    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 2);
    return `${start}***${end}`;
  }

  private mapTwilioStatus(status: string): NotificationStatus {
    const statusMap: Record<string, NotificationStatus> = {
      queued: NotificationStatus.PENDING,
      sending: NotificationStatus.PENDING,
      sent: NotificationStatus.SENT,
      delivered: NotificationStatus.DELIVERED,
      failed: NotificationStatus.FAILED,
      undelivered: NotificationStatus.FAILED,
    };

    return statusMap[status] || NotificationStatus.PENDING;
  }
}
