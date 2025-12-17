import { Update, UpdateStatus } from "../entities/update.entity";

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  updates: Update[];
}

export interface UpdateApplyResult {
  success: boolean;
  version: string;
  status: UpdateStatus;
  message: string;
  appliedAt?: Date;
  errorMessage?: string;
}

export interface UpdateInfo {
  version: string;
  releaseDate: Date;
  changelog: string;
  mandatory: boolean;
}
