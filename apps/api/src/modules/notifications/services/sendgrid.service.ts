import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";
import {
  INotificationProvider,
  NotificationChannel,
  SendNotificationRequest,
  SendNotificationResponse,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

@Injectable()
export class SendGridService implements INotificationProvider {
  private readonly logger = new Logger(SendGridService.name);
  private readonly fromEmail: string;
  private initialized = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("SENDGRID_API_KEY");
    this.fromEmail =
      this.configService.get<string>("SENDGRID_FROM_EMAIL") ||
      "noreply@pharmacy.com";

    if (!apiKey) {
      this.logger.warn("SENDGRID_API_KEY is not configured");
      return;
    }

    try {
      sgMail.setApiKey(apiKey);
      this.initialized = true;
      this.logger.log("SendGrid service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize SendGrid service", error);
    }
  }

  getChannel(): NotificationChannel {
    return NotificationChannel.EMAIL;
  }

  async send(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResponse> {
    if (!this.initialized) {
      this.logger.error("SendGrid service is not initialized");
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: "SendGrid service is not initialized",
      };
    }

    const { recipient, payload } = request;

    if (!recipient.email) {
      this.logger.error("Recipient email is required for email notifications");
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: "Recipient email is required",
      };
    }

    try {
      const msg: sgMail.MailDataRequired = {
        to: recipient.email,
        from: this.fromEmail,
        subject: payload.subject || "Notification",
        text: payload.body,
        html: this.formatHtmlBody(payload.body),
      };

      const [response] = await sgMail.send(msg);

      this.logger.log(
        `Email sent successfully to ${recipient.email}: ${response.statusCode}`,
      );

      return {
        success: true,
        messageId: response.headers["x-message-id"] as string,
        status: NotificationStatus.SENT,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${recipient.email}`,
        error.stack,
      );

      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message || "Failed to send email",
      };
    }
  }

  private formatHtmlBody(text: string): string {
    // Simple conversion: replace newlines with <br> tags
    return text.replace(/\n/g, "<br>");
  }
}
