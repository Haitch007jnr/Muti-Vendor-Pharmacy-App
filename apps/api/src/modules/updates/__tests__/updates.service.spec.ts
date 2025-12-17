import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { UpdatesService } from "../updates.service";
import { Update, UpdateStatus, UpdateType } from "../entities/update.entity";

describe("UpdatesService", () => {
  let service: UpdatesService;
  let repository: Repository<Update>;
  let configService: ConfigService;

  const mockUpdate: Update = {
    id: "test-id-1",
    version: "1.1.0",
    type: UpdateType.MINOR,
    title: "Test Update",
    description: "Test update description",
    changelog: "- Feature 1\n- Bug fix 2",
    status: UpdateStatus.PENDING,
    appliedAt: null,
    appliedBy: null,
    metadata: { migrationRequired: true },
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("1.0.0"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatesService,
        {
          provide: getRepositoryToken(Update),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UpdatesService>(UpdatesService);
    repository = module.get<Repository<Update>>(getRepositoryToken(Update));
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkForUpdates", () => {
    it("should return available updates when newer versions exist", async () => {
      const updates = [
        { ...mockUpdate, version: "1.1.0" },
        { ...mockUpdate, version: "1.2.0", id: "test-id-2" },
      ];

      mockRepository.find.mockResolvedValue(updates);

      const result = await service.checkForUpdates();

      expect(result.updateAvailable).toBe(true);
      expect(result.currentVersion).toBe("1.0.0");
      expect(result.latestVersion).toBe("1.2.0");
      expect(result.updates).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: UpdateStatus.PENDING },
        order: { createdAt: "ASC" },
      });
    });

    it("should return no updates when current version is latest", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.checkForUpdates();

      expect(result.updateAvailable).toBe(false);
      expect(result.currentVersion).toBe("1.0.0");
      expect(result.latestVersion).toBe("1.0.0");
      expect(result.updates).toHaveLength(0);
    });

    it("should use provided current version for checking", async () => {
      mockRepository.find.mockResolvedValue([mockUpdate]);

      const result = await service.checkForUpdates({ currentVersion: "1.0.5" });

      expect(result.currentVersion).toBe("1.0.5");
    });

    it("should filter out older versions", async () => {
      const updates = [
        { ...mockUpdate, version: "0.9.0" },
        { ...mockUpdate, version: "1.1.0", id: "test-id-2" },
      ];

      mockRepository.find.mockResolvedValue(updates);

      const result = await service.checkForUpdates();

      expect(result.updates).toHaveLength(1);
      expect(result.updates[0].version).toBe("1.1.0");
    });
  });

  describe("applyUpdate", () => {
    it("should successfully apply a pending update", async () => {
      const pendingUpdate = { ...mockUpdate };
      mockRepository.findOne.mockResolvedValue(pendingUpdate);
      mockRepository.save.mockResolvedValue({
        ...pendingUpdate,
        status: UpdateStatus.COMPLETED,
        appliedAt: new Date(),
        appliedBy: "admin",
      });

      const result = await service.applyUpdate({
        version: "1.1.0",
        appliedBy: "admin",
      });

      expect(result.success).toBe(true);
      expect(result.version).toBe("1.1.0");
      expect(result.status).toBe(UpdateStatus.COMPLETED);
      expect(mockRepository.save).toHaveBeenCalledTimes(2); // In progress + completed
    });

    it("should throw NotFoundException when update not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.applyUpdate({ version: "9.9.9" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException when update already completed", async () => {
      const completedUpdate = {
        ...mockUpdate,
        status: UpdateStatus.COMPLETED,
      };
      mockRepository.findOne.mockResolvedValue(completedUpdate);

      await expect(
        service.applyUpdate({ version: "1.1.0" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException when update is in progress", async () => {
      const inProgressUpdate = {
        ...mockUpdate,
        status: UpdateStatus.IN_PROGRESS,
      };
      mockRepository.findOne.mockResolvedValue(inProgressUpdate);

      await expect(
        service.applyUpdate({ version: "1.1.0" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should handle update failure and mark as failed", async () => {
      const pendingUpdate = { ...mockUpdate };
      mockRepository.findOne.mockResolvedValue(pendingUpdate);
      mockRepository.save
        .mockResolvedValueOnce({ ...pendingUpdate, status: UpdateStatus.IN_PROGRESS })
        .mockRejectedValueOnce(new Error("Update failed"));

      const result = await service.applyUpdate({ version: "1.1.0" });

      expect(result.success).toBe(false);
      expect(result.status).toBe(UpdateStatus.FAILED);
      expect(result.errorMessage).toBeDefined();
    });

    it("should use 'system' as default appliedBy when not provided", async () => {
      const pendingUpdate = { ...mockUpdate };
      mockRepository.findOne.mockResolvedValue(pendingUpdate);
      mockRepository.save.mockResolvedValue({
        ...pendingUpdate,
        status: UpdateStatus.COMPLETED,
        appliedBy: "system",
      });

      const result = await service.applyUpdate({ version: "1.1.0" });

      expect(result.success).toBe(true);
    });
  });

  describe("getAllUpdates", () => {
    it("should return all updates ordered by created date", async () => {
      const updates = [mockUpdate, { ...mockUpdate, id: "test-id-2" }];
      mockRepository.find.mockResolvedValue(updates);

      const result = await service.getAllUpdates();

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
      });
    });

    it("should return empty array when no updates exist", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getAllUpdates();

      expect(result).toHaveLength(0);
    });
  });

  describe("getUpdateByVersion", () => {
    it("should return update when found", async () => {
      mockRepository.findOne.mockResolvedValue(mockUpdate);

      const result = await service.getUpdateByVersion("1.1.0");

      expect(result).toEqual(mockUpdate);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { version: "1.1.0" },
      });
    });

    it("should throw NotFoundException when update not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getUpdateByVersion("9.9.9")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getUpdateHistory", () => {
    it("should return only completed updates", async () => {
      const completedUpdates = [
        {
          ...mockUpdate,
          status: UpdateStatus.COMPLETED,
          appliedAt: new Date(),
        },
      ];
      mockRepository.find.mockResolvedValue(completedUpdates);

      const result = await service.getUpdateHistory();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(UpdateStatus.COMPLETED);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: UpdateStatus.COMPLETED },
        order: { appliedAt: "DESC" },
      });
    });

    it("should return empty array when no completed updates", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getUpdateHistory();

      expect(result).toHaveLength(0);
    });
  });

  describe("createUpdate", () => {
    it("should create a new update successfully", async () => {
      const createDto = {
        version: "1.2.0",
        type: UpdateType.MINOR,
        title: "New Update",
        description: "Description",
        changelog: "Changes",
        metadata: {},
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...mockUpdate, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockUpdate, ...createDto });

      const result = await service.createUpdate(createDto);

      expect(result.version).toBe("1.2.0");
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException when version already exists", async () => {
      mockRepository.findOne.mockResolvedValue(mockUpdate);

      const createDto = {
        version: "1.1.0",
        type: UpdateType.MINOR,
        title: "Duplicate",
      };

      await expect(service.createUpdate(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("rollbackUpdate", () => {
    it("should successfully rollback a completed update", async () => {
      const completedUpdate = {
        ...mockUpdate,
        status: UpdateStatus.COMPLETED,
        appliedAt: new Date(),
      };
      mockRepository.findOne.mockResolvedValue(completedUpdate);
      mockRepository.save.mockResolvedValue({
        ...completedUpdate,
        status: UpdateStatus.ROLLED_BACK,
      });

      const result = await service.rollbackUpdate("1.1.0");

      expect(result.success).toBe(true);
      expect(result.status).toBe(UpdateStatus.ROLLED_BACK);
    });

    it("should throw NotFoundException when update not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.rollbackUpdate("9.9.9")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when update is not completed", async () => {
      const pendingUpdate = { ...mockUpdate, status: UpdateStatus.PENDING };
      mockRepository.findOne.mockResolvedValue(pendingUpdate);

      await expect(service.rollbackUpdate("1.1.0")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should handle rollback failure gracefully", async () => {
      const completedUpdate = {
        ...mockUpdate,
        status: UpdateStatus.COMPLETED,
      };
      mockRepository.findOne.mockResolvedValue(completedUpdate);
      mockRepository.save.mockRejectedValue(new Error("Rollback failed"));

      const result = await service.rollbackUpdate("1.1.0");

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});
