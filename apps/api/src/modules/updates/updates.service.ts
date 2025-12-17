import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Update, UpdateStatus, UpdateType } from "./entities/update.entity";
import {
  CheckUpdateDto,
  ApplyUpdateDto,
  CreateUpdateDto,
} from "./dto/update.dto";
import {
  UpdateCheckResult,
  UpdateApplyResult,
} from "./interfaces/update.interface";

@Injectable()
export class UpdatesService {
  private readonly logger = new Logger(UpdatesService.name);
  private readonly currentVersion: string;
  private readonly simulationDelay: number;

  constructor(
    @InjectRepository(Update)
    private readonly updatesRepository: Repository<Update>,
    private readonly configService: ConfigService,
  ) {
    this.currentVersion = this.configService.get<string>("APP_VERSION", "1.0.0");
    // Allow configuring simulation delay for testing/development (0 in production)
    this.simulationDelay = this.configService.get<number>("UPDATE_SIMULATION_DELAY", 0);
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(
    checkUpdateDto?: CheckUpdateDto,
  ): Promise<UpdateCheckResult> {
    const currentVersion =
      checkUpdateDto?.currentVersion || this.currentVersion;

    this.logger.log(`Checking for updates from version: ${currentVersion}`);

    // Get all pending updates
    const availableUpdates = await this.updatesRepository.find({
      where: { status: UpdateStatus.PENDING },
      order: { createdAt: "ASC" },
    });

    // Filter updates that are newer than current version
    const applicableUpdates = availableUpdates.filter((update) =>
      this.isNewerVersion(update.version, currentVersion),
    );

    const latestVersion =
      applicableUpdates.length > 0
        ? applicableUpdates[applicableUpdates.length - 1].version
        : currentVersion;

    return {
      updateAvailable: applicableUpdates.length > 0,
      currentVersion,
      latestVersion,
      updates: applicableUpdates,
    };
  }

  /**
   * Apply an update
   */
  async applyUpdate(
    applyUpdateDto: ApplyUpdateDto,
  ): Promise<UpdateApplyResult> {
    const { version, appliedBy } = applyUpdateDto;

    this.logger.log(`Attempting to apply update version: ${version}`);

    // Find the update
    const update = await this.updatesRepository.findOne({
      where: { version },
    });

    if (!update) {
      throw new NotFoundException(`Update version ${version} not found`);
    }

    if (update.status === UpdateStatus.COMPLETED) {
      throw new ConflictException(`Update ${version} has already been applied`);
    }

    if (update.status === UpdateStatus.IN_PROGRESS) {
      throw new ConflictException(
        `Update ${version} is currently being applied`,
      );
    }

    try {
      // Mark update as in progress
      update.status = UpdateStatus.IN_PROGRESS;
      await this.updatesRepository.save(update);

      // Simulate update application process
      // In a real implementation, this would execute migration scripts,
      // update configurations, restart services, etc.
      await this.performUpdateSteps(update);

      // Mark update as completed
      update.status = UpdateStatus.COMPLETED;
      update.appliedAt = new Date();
      update.appliedBy = appliedBy || "system";
      await this.updatesRepository.save(update);

      this.logger.log(`Successfully applied update version: ${version}`);

      return {
        success: true,
        version,
        status: UpdateStatus.COMPLETED,
        message: `Update ${version} applied successfully`,
        appliedAt: update.appliedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to apply update ${version}: ${error.message}`);

      // Mark update as failed
      update.status = UpdateStatus.FAILED;
      update.errorMessage = error.message;
      await this.updatesRepository.save(update);

      return {
        success: false,
        version,
        status: UpdateStatus.FAILED,
        message: `Failed to apply update ${version}`,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Get all updates
   */
  async getAllUpdates(): Promise<Update[]> {
    return this.updatesRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get update by version
   */
  async getUpdateByVersion(version: string): Promise<Update> {
    const update = await this.updatesRepository.findOne({
      where: { version },
    });

    if (!update) {
      throw new NotFoundException(`Update version ${version} not found`);
    }

    return update;
  }

  /**
   * Get update history
   */
  async getUpdateHistory(): Promise<Update[]> {
    return this.updatesRepository.find({
      where: { status: UpdateStatus.COMPLETED },
      order: { appliedAt: "DESC" },
    });
  }

  /**
   * Create a new update entry
   */
  async createUpdate(createUpdateDto: CreateUpdateDto): Promise<Update> {
    // Check if update with this version already exists
    const existingUpdate = await this.updatesRepository.findOne({
      where: { version: createUpdateDto.version },
    });

    if (existingUpdate) {
      throw new ConflictException(
        `Update version ${createUpdateDto.version} already exists`,
      );
    }

    const update = this.updatesRepository.create({
      ...createUpdateDto,
      status: UpdateStatus.PENDING,
    });

    await this.updatesRepository.save(update);

    this.logger.log(`Created new update entry: ${update.version}`);

    return update;
  }

  /**
   * Rollback an update
   */
  async rollbackUpdate(version: string): Promise<UpdateApplyResult> {
    this.logger.log(`Attempting to rollback update version: ${version}`);

    const update = await this.updatesRepository.findOne({
      where: { version },
    });

    if (!update) {
      throw new NotFoundException(`Update version ${version} not found`);
    }

    if (update.status !== UpdateStatus.COMPLETED) {
      throw new BadRequestException(
        `Can only rollback completed updates. Current status: ${update.status}`,
      );
    }

    try {
      // Perform rollback steps
      await this.performRollbackSteps(update);

      // Mark as rolled back
      update.status = UpdateStatus.ROLLED_BACK;
      await this.updatesRepository.save(update);

      this.logger.log(`Successfully rolled back update version: ${version}`);

      return {
        success: true,
        version,
        status: UpdateStatus.ROLLED_BACK,
        message: `Update ${version} rolled back successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to rollback update ${version}: ${error.message}`,
      );

      return {
        success: false,
        version,
        status: update.status,
        message: `Failed to rollback update ${version}`,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Helper method to compare version numbers
   * Note: This is a basic semantic version comparator for simple versions (e.g., 1.2.3)
   * For production use with complex versioning (pre-release, build metadata),
   * consider using a library like 'semver' for more robust comparison
   */
  private isNewerVersion(versionA: string, versionB: string): boolean {
    const parseVersion = (version: string): number[] => {
      // Remove non-numeric characters for basic comparison
      // This works for simple versions like "1.2.3" but not "1.0.0-beta"
      return version.split(".").map((v) => parseInt(v.replace(/\D/g, ""), 10) || 0);
    };

    const a = parseVersion(versionA);
    const b = parseVersion(versionB);

    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const numA = a[i] || 0;
      const numB = b[i] || 0;

      if (numA > numB) return true;
      if (numA < numB) return false;
    }

    return false;
  }

  /**
   * Simulate performing update steps
   */
  private async performUpdateSteps(update: Update): Promise<void> {
    this.logger.log(`Performing update steps for version: ${update.version}`);

    // In a real implementation, this would:
    // 1. Backup current state
    // 2. Run database migrations
    // 3. Update configuration files
    // 4. Deploy new code
    // 5. Restart services
    // 6. Verify update success

    // Simulate work (configurable delay, 0 by default in production)
    if (this.simulationDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulationDelay));
    }

    this.logger.log(`Update steps completed for version: ${update.version}`);
  }

  /**
   * Simulate performing rollback steps
   */
  private async performRollbackSteps(update: Update): Promise<void> {
    this.logger.log(`Performing rollback steps for version: ${update.version}`);

    // In a real implementation, this would:
    // 1. Restore from backup
    // 2. Revert database migrations
    // 3. Restore configuration files
    // 4. Deploy previous code version
    // 5. Restart services
    // 6. Verify rollback success

    // Simulate work (configurable delay, 0 by default in production)
    if (this.simulationDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulationDelay));
    }

    this.logger.log(`Rollback steps completed for version: ${update.version}`);
  }
}
