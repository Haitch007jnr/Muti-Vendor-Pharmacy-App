# Updates Module

The Updates Module provides a comprehensive system for managing application updates, including version checking, update application, and rollback functionality.

## Features

- **Update Checking**: Check for available updates based on current version
- **Update Application**: Apply updates with proper status tracking
- **Update History**: Track all applied updates with timestamps and user info
- **Rollback Support**: Ability to rollback completed updates
- **Version Comparison**: Smart version comparison for determining update availability
- **Status Management**: Track update lifecycle (pending, in-progress, completed, failed, rolled-back)

## API Endpoints

### Public Endpoints

#### Check for Updates
```
GET /updates/check?currentVersion=1.0.0
```
Check if new updates are available.

**Query Parameters (Optional):**
- `currentVersion`: Version string (e.g., "1.0.0")

**Response:**
```json
{
  "updateAvailable": true,
  "currentVersion": "1.0.0",
  "latestVersion": "1.2.0",
  "updates": [
    {
      "id": "uuid",
      "version": "1.1.0",
      "type": "minor",
      "title": "New Features",
      "description": "Added new features",
      "changelog": "- Feature 1\n- Feature 2",
      "status": "pending",
      "metadata": {}
    }
  ]
}
```

#### Get Update by Version
```
GET /updates/:version
```
Get details of a specific update by version number.

### Protected Endpoints (Require Authentication)

#### Apply Update
```
POST /updates/apply
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "version": "1.1.0",
  "appliedBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "version": "1.1.0",
  "status": "completed",
  "message": "Update 1.1.0 applied successfully",
  "appliedAt": "2024-01-15T10:30:00Z"
}
```

#### Get All Updates
```
GET /updates
Authorization: Bearer <token>
```
Returns all updates in the system.

#### Get Update History
```
GET /updates/history
Authorization: Bearer <token>
```
Returns only completed updates ordered by application date.

#### Create Update
```
POST /updates/create
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "version": "1.2.0",
  "type": "minor",
  "title": "New Features and Improvements",
  "description": "This update includes new features and bug fixes",
  "changelog": "- Added feature X\n- Fixed bug Y\n- Improved performance",
  "metadata": {
    "migrationRequired": true,
    "backupRecommended": true
  }
}
```

#### Rollback Update
```
POST /updates/rollback/:version
Authorization: Bearer <token>
```
Rollback a previously applied update.

## Update Types

- **PATCH**: Bug fixes and minor improvements (e.g., 1.0.1)
- **MINOR**: New features, backward compatible (e.g., 1.1.0)
- **MAJOR**: Breaking changes (e.g., 2.0.0)
- **HOTFIX**: Critical bug fixes requiring immediate deployment

## Update Status Lifecycle

1. **PENDING**: Update is available but not yet applied
2. **IN_PROGRESS**: Update is currently being applied
3. **COMPLETED**: Update was successfully applied
4. **FAILED**: Update application failed
5. **ROLLED_BACK**: Update was rolled back to previous version

## Usage Examples

### Checking for Updates

```typescript
// Check with default version
const result = await updatesService.checkForUpdates();

// Check with specific version
const result = await updatesService.checkForUpdates({ 
  currentVersion: "1.0.5" 
});
```

### Applying an Update

```typescript
const result = await updatesService.applyUpdate({
  version: "1.1.0",
  appliedBy: "admin-user"
});

if (result.success) {
  console.log("Update applied successfully");
} else {
  console.error("Update failed:", result.errorMessage);
}
```

### Creating an Update Entry

```typescript
const update = await updatesService.createUpdate({
  version: "1.2.0",
  type: UpdateType.MINOR,
  title: "New Features",
  description: "Added new features",
  changelog: "- Feature 1\n- Feature 2",
  metadata: { 
    migrationRequired: true 
  }
});
```

### Rollback

```typescript
const result = await updatesService.rollbackUpdate("1.1.0");

if (result.success) {
  console.log("Update rolled back successfully");
}
```

## Database Schema

The module uses the `updates` table with the following structure:

```sql
CREATE TABLE updates (
  id UUID PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  type ENUM('patch', 'minor', 'major', 'hotfix') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  changelog TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'failed', 'rolled_back') DEFAULT 'pending',
  appliedAt TIMESTAMP,
  appliedBy VARCHAR(255),
  metadata JSON,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Implementation Details

### Version Comparison

The service includes a smart version comparison algorithm that:
- Parses semantic version numbers (e.g., 1.2.3)
- Compares major, minor, and patch versions in order
- Handles versions with different lengths
- Filters out non-numeric characters

### Update Application Process

When applying an update, the service:
1. Validates the update exists and is in pending state
2. Marks the update as in-progress
3. Executes update steps (migrations, configuration, deployment)
4. On success: marks as completed with timestamp and user
5. On failure: marks as failed with error message

### Rollback Process

When rolling back an update:
1. Validates the update is in completed state
2. Executes rollback steps (restore backup, revert migrations)
3. Marks as rolled back
4. Logs the rollback action

## Configuration

Add to your `.env` file:

```env
APP_VERSION=1.0.0
# Optional: Set simulation delay for testing/development (in milliseconds, 0 in production)
UPDATE_SIMULATION_DELAY=0
```

## Testing

Run the tests:

```bash
# Unit tests
npm test updates.service.spec.ts

# Controller tests
npm test updates.controller.spec.ts

# All updates module tests
npm test -- updates
```

## Future Enhancements

- Scheduled updates
- Automatic update checks
- Update notifications
- Backup management
- Update dependencies tracking
- Staged rollouts
- Update verification checksums
