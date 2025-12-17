import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationTemplate } from "../entities/notification-template.entity";
import { CreateTemplateDto, UpdateTemplateDto } from "../dto/template.dto";
import { NotificationChannel } from "../interfaces/notification-provider.interface";

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
  ) {}

  async create(
    createTemplateDto: CreateTemplateDto,
  ): Promise<NotificationTemplate> {
    // Check if template with same name and channel already exists
    const existing = await this.templateRepository.findOne({
      where: {
        name: createTemplateDto.name,
        channel: createTemplateDto.channel,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Template with name '${createTemplateDto.name}' already exists for channel '${createTemplateDto.channel}'`,
      );
    }

    const template = this.templateRepository.create(createTemplateDto);
    return this.templateRepository.save(template);
  }

  async findAll(channel?: NotificationChannel): Promise<NotificationTemplate[]> {
    const query = this.templateRepository.createQueryBuilder("template");

    if (channel) {
      query.where("template.channel = :channel", { channel });
    }

    return query.orderBy("template.createdAt", "DESC").getMany();
  }

  async findOne(id: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException(`Template with ID '${id}' not found`);
    }

    return template;
  }

  async findByName(
    name: string,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { name, channel, active: true },
    });

    if (!template) {
      throw new NotFoundException(
        `Template with name '${name}' not found for channel '${channel}'`,
      );
    }

    return template;
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<NotificationTemplate> {
    const template = await this.findOne(id);

    Object.assign(template, updateTemplateDto);

    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, any>,
  ): Promise<{ subject?: string; body: string }> {
    const template = await this.findOne(templateId);

    if (!template.active) {
      throw new ConflictException(`Template '${template.name}' is not active`);
    }

    return {
      subject: template.subject
        ? this.replaceVariables(template.subject, variables)
        : undefined,
      body: this.replaceVariables(template.body, variables),
    };
  }

  private replaceVariables(
    text: string,
    variables: Record<string, any>,
  ): string {
    // Replace {{variable}} with actual values using a single regex with callback
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }
}
