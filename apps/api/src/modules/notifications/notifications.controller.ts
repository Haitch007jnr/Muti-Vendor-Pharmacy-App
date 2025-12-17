import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { NotificationsService } from "./services/notifications.service";
import { TemplateService } from "./services/template.service";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { CreateTemplateDto, UpdateTemplateDto } from "./dto/template.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationChannel } from "./interfaces/notification-provider.interface";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly templateService: TemplateService,
  ) {}

  @Post("send")
  @ApiOperation({ summary: "Send a notification" })
  @ApiResponse({ status: 200, description: "Notification sent successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async send(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.send(sendNotificationDto);
  }

  @Post("send/multiple")
  @ApiOperation({ summary: "Send multiple notifications" })
  @ApiResponse({
    status: 200,
    description: "Notifications sent successfully",
  })
  async sendMultiple(@Body() notifications: SendNotificationDto[]) {
    return this.notificationsService.sendMultiple(notifications);
  }

  // Template Management
  @Post("templates")
  @ApiOperation({ summary: "Create a notification template" })
  @ApiResponse({ status: 201, description: "Template created successfully" })
  @ApiResponse({ status: 409, description: "Template already exists" })
  async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templateService.create(createTemplateDto);
  }

  @Get("templates")
  @ApiOperation({ summary: "Get all notification templates" })
  @ApiResponse({ status: 200, description: "Templates retrieved successfully" })
  async getAllTemplates(@Query("channel") channel?: NotificationChannel) {
    return this.templateService.findAll(channel);
  }

  @Get("templates/:id")
  @ApiOperation({ summary: "Get a notification template by ID" })
  @ApiResponse({ status: 200, description: "Template retrieved successfully" })
  @ApiResponse({ status: 404, description: "Template not found" })
  async getTemplate(@Param("id") id: string) {
    return this.templateService.findOne(id);
  }

  @Put("templates/:id")
  @ApiOperation({ summary: "Update a notification template" })
  @ApiResponse({ status: 200, description: "Template updated successfully" })
  @ApiResponse({ status: 404, description: "Template not found" })
  async updateTemplate(
    @Param("id") id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, updateTemplateDto);
  }

  @Delete("templates/:id")
  @ApiOperation({ summary: "Delete a notification template" })
  @ApiResponse({ status: 200, description: "Template deleted successfully" })
  @ApiResponse({ status: 404, description: "Template not found" })
  async deleteTemplate(@Param("id") id: string) {
    await this.templateService.remove(id);
    return { message: "Template deleted successfully" };
  }

  @Post("templates/:id/render")
  @ApiOperation({ summary: "Render a template with variables" })
  @ApiResponse({ status: 200, description: "Template rendered successfully" })
  @ApiResponse({ status: 404, description: "Template not found" })
  async renderTemplate(
    @Param("id") id: string,
    @Body() variables: Record<string, any>,
  ) {
    return this.templateService.renderTemplate(id, variables);
  }
}
