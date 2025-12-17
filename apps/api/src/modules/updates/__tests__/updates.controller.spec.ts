import { Test, TestingModule } from "@nestjs/testing";
import { UpdatesController } from "../updates.controller";
import { UpdatesService } from "../updates.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Update, UpdateStatus, UpdateType } from "../entities/update.entity";

describe("UpdatesController", () => {
  let controller: UpdatesController;
  let service: UpdatesService;

  const mockUpdate: Update = {
    id: "test-id",
    version: "1.1.0",
    type: UpdateType.MINOR,
    title: "Test Update",
    description: "Test description",
    changelog: "- Feature 1",
    status: UpdateStatus.PENDING,
    appliedAt: null,
    appliedBy: null,
    metadata: {},
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUpdatesService = {
    checkForUpdates: jest.fn(),
    applyUpdate: jest.fn(),
    getAllUpdates: jest.fn(),
    getUpdateHistory: jest.fn(),
    getUpdateByVersion: jest.fn(),
    createUpdate: jest.fn(),
    rollbackUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdatesController],
      providers: [
        {
          provide: UpdatesService,
          useValue: mockUpdatesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UpdatesController>(UpdatesController);
    service = module.get<UpdatesService>(UpdatesService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("checkForUpdates", () => {
    it("should return update check result", async () => {
      const checkResult = {
        updateAvailable: true,
        currentVersion: "1.0.0",
        latestVersion: "1.1.0",
        updates: [mockUpdate],
      };

      mockUpdatesService.checkForUpdates.mockResolvedValue(checkResult);

      const result = await controller.checkForUpdates();

      expect(result).toEqual(checkResult);
      expect(service.checkForUpdates).toHaveBeenCalled();
    });

    it("should pass checkUpdateDto to service", async () => {
      const dto = { currentVersion: "1.0.5" };
      const checkResult = {
        updateAvailable: false,
        currentVersion: "1.0.5",
        latestVersion: "1.0.5",
        updates: [],
      };

      mockUpdatesService.checkForUpdates.mockResolvedValue(checkResult);

      await controller.checkForUpdates(dto);

      expect(service.checkForUpdates).toHaveBeenCalledWith(dto);
    });
  });

  describe("applyUpdate", () => {
    it("should apply update successfully", async () => {
      const applyDto = { version: "1.1.0", appliedBy: "admin" };
      const applyResult = {
        success: true,
        version: "1.1.0",
        status: UpdateStatus.COMPLETED,
        message: "Update applied successfully",
        appliedAt: new Date(),
      };

      mockUpdatesService.applyUpdate.mockResolvedValue(applyResult);

      const result = await controller.applyUpdate(applyDto);

      expect(result).toEqual(applyResult);
      expect(service.applyUpdate).toHaveBeenCalledWith(applyDto);
    });

    it("should handle failed update", async () => {
      const applyDto = { version: "1.1.0" };
      const applyResult = {
        success: false,
        version: "1.1.0",
        status: UpdateStatus.FAILED,
        message: "Update failed",
        errorMessage: "Error details",
      };

      mockUpdatesService.applyUpdate.mockResolvedValue(applyResult);

      const result = await controller.applyUpdate(applyDto);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe("getAllUpdates", () => {
    it("should return all updates", async () => {
      const updates = [mockUpdate, { ...mockUpdate, id: "test-id-2" }];
      mockUpdatesService.getAllUpdates.mockResolvedValue(updates);

      const result = await controller.getAllUpdates();

      expect(result).toEqual(updates);
      expect(result).toHaveLength(2);
      expect(service.getAllUpdates).toHaveBeenCalled();
    });

    it("should return empty array when no updates", async () => {
      mockUpdatesService.getAllUpdates.mockResolvedValue([]);

      const result = await controller.getAllUpdates();

      expect(result).toEqual([]);
    });
  });

  describe("getUpdateHistory", () => {
    it("should return update history", async () => {
      const history = [
        {
          ...mockUpdate,
          status: UpdateStatus.COMPLETED,
          appliedAt: new Date(),
        },
      ];
      mockUpdatesService.getUpdateHistory.mockResolvedValue(history);

      const result = await controller.getUpdateHistory();

      expect(result).toEqual(history);
      expect(service.getUpdateHistory).toHaveBeenCalled();
    });
  });

  describe("getUpdateByVersion", () => {
    it("should return update by version", async () => {
      mockUpdatesService.getUpdateByVersion.mockResolvedValue(mockUpdate);

      const result = await controller.getUpdateByVersion("1.1.0");

      expect(result).toEqual(mockUpdate);
      expect(service.getUpdateByVersion).toHaveBeenCalledWith("1.1.0");
    });
  });

  describe("createUpdate", () => {
    it("should create new update", async () => {
      const createDto = {
        version: "1.2.0",
        type: UpdateType.MINOR,
        title: "New Update",
      };
      const createdUpdate = { ...mockUpdate, ...createDto };

      mockUpdatesService.createUpdate.mockResolvedValue(createdUpdate);

      const result = await controller.createUpdate(createDto);

      expect(result).toEqual(createdUpdate);
      expect(service.createUpdate).toHaveBeenCalledWith(createDto);
    });
  });

  describe("rollbackUpdate", () => {
    it("should rollback update successfully", async () => {
      const rollbackResult = {
        success: true,
        version: "1.1.0",
        status: UpdateStatus.ROLLED_BACK,
        message: "Update rolled back successfully",
      };

      mockUpdatesService.rollbackUpdate.mockResolvedValue(rollbackResult);

      const result = await controller.rollbackUpdate("1.1.0");

      expect(result).toEqual(rollbackResult);
      expect(service.rollbackUpdate).toHaveBeenCalledWith("1.1.0");
    });

    it("should handle rollback failure", async () => {
      const rollbackResult = {
        success: false,
        version: "1.1.0",
        status: UpdateStatus.COMPLETED,
        message: "Rollback failed",
        errorMessage: "Error details",
      };

      mockUpdatesService.rollbackUpdate.mockResolvedValue(rollbackResult);

      const result = await controller.rollbackUpdate("1.1.0");

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});
