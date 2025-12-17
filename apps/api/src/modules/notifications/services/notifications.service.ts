import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { SendGridService } from "./sendgrid.service";
import { TwilioService } from "./twilio.service";
import { FirebaseService } from "./firebase.service";
import { TemplateService } from "./template.service";
import {
  NotificationChannel,
  INotificationProvider,
  SendNotificationRequest,
  SendNotificationResponse,
} from "../interfaces/notification-provider.interface";
import { SendNotificationDto } from "../dto/send-notification.dto";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly providers: Map<NotificationChannel, INotificationProvider>;

  constructor(
    private readonly sendGridService: SendGridService,
    private readonly twilioService: TwilioService,
    private readonly firebaseService: FirebaseService,
    private readonly templateService: TemplateService,
  ) {
    this.providers = new Map<NotificationChannel, INotificationProvider>([
      [NotificationChannel.EMAIL, sendGridService],
      [NotificationChannel.SMS, twilioService],
      [NotificationChannel.PUSH, firebaseService],
    ]);
  }

  async send(
    sendNotificationDto: SendNotificationDto,
  ): Promise<SendNotificationResponse> {
    const { channel, templateId, variables } = sendNotificationDto;

    // Build the notification request
    const request: SendNotificationRequest = { ...sendNotificationDto };

    // If template is specified, render it
    if (templateId) {
      try {
        const rendered = await this.templateService.renderTemplate(
          templateId,
          variables || {},
        );

        request.payload = {
          ...request.payload,
          subject: rendered.subject || request.payload.subject,
          body: rendered.body,
        };
      } catch (error) {
        this.logger.error(`Failed to render template: ${error.message}`);
        throw new BadRequestException(`Failed to render template: ${error.message}`);
      }
    }

    // Get the appropriate provider
    const provider = this.providers.get(channel);

    if (!provider) {
      throw new BadRequestException(`Unsupported notification channel: ${channel}`);
    }

    // Send the notification
    this.logger.log(
      `Sending ${channel} notification to ${JSON.stringify(request.recipient)}`,
    );

    try {
      const response = await provider.send(request);

      if (response.success) {
        this.logger.log(
          `${channel} notification sent successfully: ${response.messageId}`,
        );
      } else {
        this.logger.error(
          `${channel} notification failed: ${response.error}`,
        );
      }

      return response;
    } catch (error) {
      this.logger.error(
        `Unexpected error sending ${channel} notification`,
        error.stack,
      );

      return {
        success: false,
        status: error.status,
        error: error.message || "Failed to send notification",
      };
    }
  }

  async sendMultiple(
    notifications: SendNotificationDto[],
  ): Promise<SendNotificationResponse[]> {
    const promises = notifications.map((notification) =>
      this.send(notification),
    );

    return Promise.all(promises);
  }

  async sendEmail(
    email: string,
    subject: string,
    body: string,
  ): Promise<SendNotificationResponse> {
    return this.send({
      recipient: { email },
      payload: { subject, body },
      channel: NotificationChannel.EMAIL,
    });
  }

  async sendSMS(
    phone: string,
    body: string,
  ): Promise<SendNotificationResponse> {
    return this.send({
      recipient: { phone },
      payload: { body },
      channel: NotificationChannel.SMS,
    });
  }

  async sendPush(
    deviceToken: string,
    subject: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<SendNotificationResponse> {
    return this.send({
      recipient: { deviceToken },
      payload: { subject, body, data },
      channel: NotificationChannel.PUSH,
    });
  }
}
