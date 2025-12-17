import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./services/notifications.service";
import { SendGridService } from "./services/sendgrid.service";
import { TwilioService } from "./services/twilio.service";
import { FirebaseService } from "./services/firebase.service";
import { TemplateService } from "./services/template.service";
import { NotificationTemplate } from "./entities/notification-template.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate]), AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    SendGridService,
    TwilioService,
    FirebaseService,
    TemplateService,
  ],
  exports: [NotificationsService, TemplateService],
})
export class NotificationsModule {}
