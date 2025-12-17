import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Asset,
  AssetStatus,
  DepreciationMethod,
} from "./entities/asset.entity";
import { AssetCategory } from "./entities/asset-category.entity";
import { AssetDepreciation } from "./entities/asset-depreciation.entity";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { QueryAssetDto } from "./dto/query-asset.dto";
import { CreateAssetCategoryDto } from "./dto/create-asset-category.dto";
import { UpdateAssetCategoryDto } from "./dto/update-asset-category.dto";

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetCategory)
    private readonly categoryRepository: Repository<AssetCategory>,
    @InjectRepository(AssetDepreciation)
    private readonly depreciationRepository: Repository<AssetDepreciation>,
  ) {}

  // Asset Category Methods
  async createCategory(
    createCategoryDto: CreateAssetCategoryDto,
  ): Promise<AssetCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(vendorId: string): Promise<AssetCategory[]> {
    return await this.categoryRepository.find({
      where: { vendorId },
      order: { createdAt: "DESC" },
    });
  }

  async findOneCategory(id: string): Promise<AssetCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["assets"],
    });

    if (!category) {
      throw new NotFoundException(`Asset category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateAssetCategoryDto,
  ): Promise<AssetCategory> {
    const category = await this.findOneCategory(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);

    // Check if category has assets
    const assetCount = await this.assetRepository.count({
      where: { categoryId: id },
    });

    if (assetCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${assetCount} asset(s)`,
      );
    }

    await this.categoryRepository.remove(category);
  }

  // Asset Methods
  private calculateDepreciation(
    purchaseCost: number,
    salvageValue: number,
    usefulLife: number,
    depreciationMethod: DepreciationMethod,
    depreciationRate?: number,
  ): { rate: number } {
    let rate: number;

    switch (depreciationMethod) {
      case DepreciationMethod.STRAIGHT_LINE:
        // Annual depreciation = (Cost - Salvage Value) / Useful Life
        const straightLineDepreciation =
          (purchaseCost - salvageValue) / usefulLife;
        rate = (straightLineDepreciation / purchaseCost) * 100;
        break;

      case DepreciationMethod.DECLINING_BALANCE:
        // Use provided rate or calculate from useful life
        rate = depreciationRate || (1 / usefulLife) * 100;
        break;

      case DepreciationMethod.DOUBLE_DECLINING_BALANCE:
        // Rate = 2 / Useful Life
        rate = (2 / usefulLife) * 100;
        break;

      case DepreciationMethod.UNITS_OF_PRODUCTION:
        // This method requires production units, default to straight line
        const unitsDepreciation = (purchaseCost - salvageValue) / usefulLife;
        rate = (unitsDepreciation / purchaseCost) * 100;
        break;

      default:
        const defaultDepreciation = (purchaseCost - salvageValue) / usefulLife;
        rate = (defaultDepreciation / purchaseCost) * 100;
    }

    return { rate };
  }

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    // Verify category exists
    await this.findOneCategory(createAssetDto.categoryId);

    // Check if asset tag already exists
    const existing = await this.assetRepository.findOne({
      where: { assetTag: createAssetDto.assetTag },
    });

    if (existing) {
      throw new BadRequestException(
        `Asset with tag ${createAssetDto.assetTag} already exists`,
      );
    }

    const salvageValue = createAssetDto.salvageValue || 0;
    const depreciationMethod =
      createAssetDto.depreciationMethod || DepreciationMethod.STRAIGHT_LINE;

    const { rate } = this.calculateDepreciation(
      createAssetDto.purchaseCost,
      salvageValue,
      createAssetDto.usefulLife,
      depreciationMethod,
      createAssetDto.depreciationRate,
    );

    const asset = this.assetRepository.create({
      ...createAssetDto,
      purchaseDate: new Date(createAssetDto.purchaseDate),
      warrantyExpiry: createAssetDto.warrantyExpiry
        ? new Date(createAssetDto.warrantyExpiry)
        : undefined,
      currentValue: createAssetDto.purchaseCost,
      salvageValue,
      depreciationMethod,
      depreciationRate: rate,
      accumulatedDepreciation: 0,
      status: AssetStatus.ACTIVE,
    });

    return await this.assetRepository.save(asset);
  }

  async findAll(
    query: QueryAssetDto,
  ): Promise<{ data: Asset[]; total: number; page: number; limit: number }> {
    const {
      vendorId,
      categoryId,
      status,
      location,
      assignedTo,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = location;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const [data, total] = await this.assetRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["category"],
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ["category", "depreciations"],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id);

    // If updating key asset parameters, recalculate depreciation
    if (
      updateAssetDto.purchaseCost ||
      updateAssetDto.salvageValue !== undefined ||
      updateAssetDto.usefulLife ||
      updateAssetDto.depreciationMethod ||
      updateAssetDto.depreciationRate
    ) {
      const purchaseCost = updateAssetDto.purchaseCost || asset.purchaseCost;
      const salvageValue =
        updateAssetDto.salvageValue !== undefined
          ? updateAssetDto.salvageValue
          : asset.salvageValue;
      const usefulLife = updateAssetDto.usefulLife || asset.usefulLife;
      const depreciationMethod =
        updateAssetDto.depreciationMethod || asset.depreciationMethod;
      const depreciationRate =
        updateAssetDto.depreciationRate || asset.depreciationRate;

      const { rate } = this.calculateDepreciation(
        purchaseCost,
        salvageValue,
        usefulLife,
        depreciationMethod,
        depreciationRate,
      );

      Object.assign(asset, updateAssetDto, {
        depreciationRate: rate,
      });
    } else {
      Object.assign(asset, updateAssetDto);
    }

    if (updateAssetDto.warrantyExpiry) {
      asset.warrantyExpiry = new Date(updateAssetDto.warrantyExpiry);
    }

    if (updateAssetDto.lastMaintenanceDate) {
      asset.lastMaintenanceDate = new Date(updateAssetDto.lastMaintenanceDate);
    }

    if (updateAssetDto.nextMaintenanceDate) {
      asset.nextMaintenanceDate = new Date(updateAssetDto.nextMaintenanceDate);
    }

    return await this.assetRepository.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }

  // Depreciation Methods
  async calculateMonthlyDepreciation(
    assetId: string,
    year: number,
    month: number,
  ): Promise<AssetDepreciation> {
    const asset = await this.findOne(assetId);

    if (
      asset.status === AssetStatus.DISPOSED ||
      asset.status === AssetStatus.SOLD
    ) {
      throw new BadRequestException(
        "Cannot calculate depreciation for disposed/sold assets",
      );
    }

    // Check if depreciation already exists for this period
    const period = `${year}-${String(month).padStart(2, "0")}`;
    const existing = await this.depreciationRepository.findOne({
      where: { assetId, period },
    });

    if (existing) {
      return existing;
    }

    // Calculate monthly depreciation (annual / 12)
    const monthlyDepreciationAmount =
      (asset.purchaseCost - asset.salvageValue) / asset.usefulLife / 12;

    const openingValue = asset.currentValue;
    const closingValue = Math.max(
      openingValue - monthlyDepreciationAmount,
      asset.salvageValue,
    );
    const actualDepreciation = openingValue - closingValue;
    const accumulatedDepreciation =
      asset.accumulatedDepreciation + actualDepreciation;

    const depreciation = this.depreciationRepository.create({
      assetId,
      year,
      month,
      period,
      openingValue,
      depreciationAmount: actualDepreciation,
      closingValue,
      accumulatedDepreciation,
    });

    const savedDepreciation =
      await this.depreciationRepository.save(depreciation);

    // Update asset
    asset.currentValue = closingValue;
    asset.accumulatedDepreciation = accumulatedDepreciation;
    await this.assetRepository.save(asset);

    return savedDepreciation;
  }

  async getDepreciationSchedule(assetId: string): Promise<AssetDepreciation[]> {
    return await this.depreciationRepository.find({
      where: { assetId },
      order: { year: "ASC", month: "ASC" },
    });
  }

  async getAssetSummary(vendorId: string): Promise<any> {
    const query = this.assetRepository
      .createQueryBuilder("asset")
      .where("asset.vendorId = :vendorId", { vendorId });

    const totalAssetsQuery = query.clone();
    const activeAssetsQuery = query
      .clone()
      .andWhere("asset.status = :status", { status: AssetStatus.ACTIVE });

    const [totalCount, activeCount] = await Promise.all([
      totalAssetsQuery.getCount(),
      activeAssetsQuery.getCount(),
    ]);

    const totalCostResult = await query
      .clone()
      .select("SUM(asset.purchaseCost)", "total")
      .getRawOne();

    const currentValueResult = await activeAssetsQuery
      .clone()
      .select("SUM(asset.currentValue)", "currentValue")
      .getRawOne();

    const depreciationResult = await activeAssetsQuery
      .clone()
      .select("SUM(asset.accumulatedDepreciation)", "depreciation")
      .getRawOne();

    return {
      totalAssets: totalCount,
      activeAssets: activeCount,
      totalCost: Number(totalCostResult?.total || 0),
      currentValue: Number(currentValueResult?.currentValue || 0),
      accumulatedDepreciation: Number(depreciationResult?.depreciation || 0),
    };
  }
}
