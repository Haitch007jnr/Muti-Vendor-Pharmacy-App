import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TemplateService } from "../services/template.service";
import { NotificationTemplate } from "../entities/notification-template.entity";
import { NotificationChannel } from "../interfaces/notification-provider.interface";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("TemplateService", () => {
  let service: TemplateService;
  let repository: Repository<NotificationTemplate>;

  const mockTemplate: NotificationTemplate = {
    id: "test-id",
    name: "welcome_email",
    channel: NotificationChannel.EMAIL,
    subject: "Welcome {{name}}",
    body: "Hello {{name}}, welcome to our platform!",
    variables: ["name"],
    description: "Welcome email template",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        {
          provide: getRepositoryToken(NotificationTemplate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    repository = module.get<Repository<NotificationTemplate>>(
      getRepositoryToken(NotificationTemplate),
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new template", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTemplate);
      mockRepository.save.mockResolvedValue(mockTemplate);

      const result = await service.create({
        name: "welcome_email",
        channel: NotificationChannel.EMAIL,
        subject: "Welcome {{name}}",
        body: "Hello {{name}}, welcome to our platform!",
        variables: ["name"],
      });

      expect(result).toEqual(mockTemplate);
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException if template already exists", async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);

      await expect(
        service.create({
          name: "welcome_email",
          channel: NotificationChannel.EMAIL,
          body: "Test body",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("findOne", () => {
    it("should return a template by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.findOne("test-id");

      expect(result).toEqual(mockTemplate);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
    });

    it("should throw NotFoundException if template not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("renderTemplate", () => {
    it("should render template with variables", async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.renderTemplate("test-id", {
        name: "John Doe",
      });

      expect(result).toEqual({
        subject: "Welcome John Doe",
        body: "Hello John Doe, welcome to our platform!",
      });
    });

    it("should throw ConflictException if template is not active", async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockTemplate,
        active: false,
      });

      await expect(
        service.renderTemplate("test-id", { name: "John" }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
