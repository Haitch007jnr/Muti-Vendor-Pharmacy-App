import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ConfigValidation {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

@Injectable()
export class ConfigValidationService implements OnModuleInit {
  private readonly logger = new Logger(ConfigValidationService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.validateConfiguration();
  }

  private readonly configValidations: ConfigValidation[] = [
    // Database Configuration
    {
      key: 'DATABASE_URL',
      required: true,
      description: 'PostgreSQL database connection URL',
      validator: (value) => value.startsWith('postgresql://'),
    },
    {
      key: 'DATABASE_HOST',
      required: true,
      description: 'Database host',
    },
    {
      key: 'DATABASE_PORT',
      required: true,
      description: 'Database port',
      validator: (value) => !isNaN(parseInt(value)),
    },
    {
      key: 'DATABASE_USER',
      required: true,
      description: 'Database username',
    },
    {
      key: 'DATABASE_PASSWORD',
      required: true,
      description: 'Database password',
    },
    {
      key: 'DATABASE_NAME',
      required: true,
      description: 'Database name',
    },

    // Redis Configuration
    {
      key: 'REDIS_URL',
      required: true,
      description: 'Redis connection URL',
      validator: (value) => value.startsWith('redis://'),
    },

    // JWT Configuration
    {
      key: 'JWT_SECRET',
      required: true,
      description: 'JWT secret key',
      validator: (value) => {
        // Check minimum length
        if (value.length < 32) return false;
        
        // Check for sufficient entropy (not all same characters, not sequential)
        const uniqueChars = new Set(value).size;
        const hasVariety = uniqueChars >= 16; // At least 16 unique characters
        const notSequential = !/^(.)\1+$/.test(value); // Not all same character
        const notCommonPattern = !['12345', 'abcde', 'qwerty'].some(pattern => 
          value.toLowerCase().includes(pattern)
        );
        
        return hasVariety && notSequential && notCommonPattern;
      },
    },
    {
      key: 'JWT_EXPIRATION',
      required: true,
      description: 'JWT token expiration time',
    },

    // API Configuration
    {
      key: 'API_PORT',
      required: true,
      description: 'API server port',
      validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
    },
    {
      key: 'NODE_ENV',
      required: true,
      description: 'Node environment',
      validator: (value) =>
        ['development', 'production', 'test'].includes(value),
    },

    // Payment Gateway - Paystack
    {
      key: 'PAYSTACK_SECRET_KEY',
      required: true,
      description: 'Paystack secret key',
      validator: (value) =>
        value.startsWith('sk_test_') || value.startsWith('sk_live_'),
    },
    {
      key: 'PAYSTACK_PUBLIC_KEY',
      required: false,
      description: 'Paystack public key',
      validator: (value) =>
        value.startsWith('pk_test_') || value.startsWith('pk_live_'),
    },

    // Payment Gateway - Monnify
    {
      key: 'MONNIFY_API_KEY',
      required: true,
      description: 'Monnify API key',
    },
    {
      key: 'MONNIFY_SECRET_KEY',
      required: true,
      description: 'Monnify secret key',
    },
    {
      key: 'MONNIFY_CONTRACT_CODE',
      required: true,
      description: 'Monnify contract code',
    },
    {
      key: 'MONNIFY_BASE_URL',
      required: true,
      description: 'Monnify API base URL',
      validator: (value) => value.startsWith('https://'),
    },

    // Notification Services - SendGrid
    {
      key: 'SENDGRID_API_KEY',
      required: true,
      description: 'SendGrid API key',
      validator: (value) => value.startsWith('SG.'),
    },
    {
      key: 'SENDGRID_FROM_EMAIL',
      required: true,
      description: 'SendGrid sender email',
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    },

    // Notification Services - Twilio
    {
      key: 'TWILIO_ACCOUNT_SID',
      required: true,
      description: 'Twilio account SID',
      validator: (value) => value.startsWith('AC'),
    },
    {
      key: 'TWILIO_AUTH_TOKEN',
      required: true,
      description: 'Twilio authentication token',
    },
    {
      key: 'TWILIO_PHONE_NUMBER',
      required: true,
      description: 'Twilio phone number',
      validator: (value) => value.startsWith('+'),
    },

    // Push Notifications - Firebase
    {
      key: 'FIREBASE_PROJECT_ID',
      required: true,
      description: 'Firebase project ID',
    },
    {
      key: 'FIREBASE_PRIVATE_KEY',
      required: true,
      description: 'Firebase private key',
      validator: (value) => value.includes('BEGIN PRIVATE KEY'),
    },
    {
      key: 'FIREBASE_CLIENT_EMAIL',
      required: true,
      description: 'Firebase client email',
      validator: (value) => value.includes('@') && value.includes('.iam.'),
    },

    // File Upload - AWS S3
    {
      key: 'AWS_ACCESS_KEY_ID',
      required: false,
      description: 'AWS access key ID',
    },
    {
      key: 'AWS_SECRET_ACCESS_KEY',
      required: false,
      description: 'AWS secret access key',
    },
    {
      key: 'AWS_S3_BUCKET',
      required: false,
      description: 'AWS S3 bucket name',
    },
    {
      key: 'AWS_REGION',
      required: false,
      description: 'AWS region',
    },
  ];

  validateConfiguration(): void {
    this.logger.log('Validating environment configuration...');

    const errors: string[] = [];
    const warnings: string[] = [];

    for (const validation of this.configValidations) {
      const value = this.configService.get<string>(validation.key);

      // Check if required variable is missing
      if (validation.required && !value) {
        errors.push(
          `Missing required environment variable: ${validation.key} (${validation.description})`,
        );
        continue;
      }

      // Skip validation if optional and not provided
      if (!validation.required && !value) {
        warnings.push(
          `Optional environment variable not set: ${validation.key} (${validation.description})`,
        );
        continue;
      }

      // Run custom validator if provided
      if (value && validation.validator && !validation.validator(value)) {
        errors.push(
          `Invalid value for ${validation.key}: ${validation.description}`,
        );
      }
    }

    // Log warnings
    if (warnings.length > 0) {
      this.logger.warn('Configuration warnings:');
      warnings.forEach((warning) => this.logger.warn(`  - ${warning}`));
    }

    // Throw errors if any
    if (errors.length > 0) {
      this.logger.error('Configuration validation failed:');
      errors.forEach((error) => this.logger.error(`  - ${error}`));
      throw new Error(
        `Environment configuration validation failed. ${errors.length} error(s) found.`,
      );
    }

    // Additional security checks
    this.performSecurityChecks();

    this.logger.log('✓ Environment configuration validated successfully');
  }

  private performSecurityChecks(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    // Check for default/weak secrets in production
    if (nodeEnv === 'production') {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (
        jwtSecret === 'your-super-secret-jwt-key-change-in-production' ||
        jwtSecret === 'secret' ||
        jwtSecret === 'test'
      ) {
        throw new Error(
          'SECURITY ERROR: Default or weak JWT secret detected in production. Please use a strong, unique secret.',
        );
      }

      // Check for test API keys in production
      const paystackKey = this.configService.get<string>(
        'PAYSTACK_SECRET_KEY',
      );
      if (paystackKey && paystackKey.startsWith('sk_test_')) {
        this.logger.warn(
          'WARNING: Using Paystack test keys in production environment',
        );
      }

      const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (sendgridKey && sendgridKey === 'your_sendgrid_api_key') {
        throw new Error(
          'SECURITY ERROR: Default SendGrid API key detected in production',
        );
      }
    }

    // Check database password strength
    const dbPassword = this.configService.get<string>('DATABASE_PASSWORD');
    if (
      nodeEnv === 'production' &&
      (dbPassword === 'password' ||
        dbPassword === 'pharmacy_secure_pass' ||
        dbPassword.length < 12)
    ) {
      this.logger.warn(
        'WARNING: Weak database password detected. Consider using a stronger password.',
      );
    }
  }

  /**
   * Get a summary of the current configuration status
   */
  getConfigurationSummary(): {
    environment: string;
    database: string;
    paymentGateways: string[];
    notificationChannels: string[];
    fileStorage: boolean;
    isProductionReady: boolean;
  } {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const dbHost = this.configService.get<string>('DATABASE_HOST');
    const paystackKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const monnifyKey = this.configService.get<string>('MONNIFY_API_KEY');
    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const firebaseProject = this.configService.get<string>(
      'FIREBASE_PROJECT_ID',
    );
    const awsKey = this.configService.get<string>('AWS_ACCESS_KEY_ID');

    const paymentGateways: string[] = [];
    if (paystackKey) paymentGateways.push('Paystack');
    if (monnifyKey) paymentGateways.push('Monnify');

    const notificationChannels: string[] = [];
    if (sendgridKey) notificationChannels.push('Email (SendGrid)');
    if (twilioSid) notificationChannels.push('SMS (Twilio)');
    if (firebaseProject) notificationChannels.push('Push (Firebase)');

    const isProductionReady =
      nodeEnv === 'production' &&
      paymentGateways.length > 0 &&
      notificationChannels.length >= 2 &&
      !paystackKey?.startsWith('sk_test_');

    return {
      environment: nodeEnv || 'unknown',
      database: dbHost || 'unknown',
      paymentGateways,
      notificationChannels,
      fileStorage: !!awsKey,
      isProductionReady,
    };
  }
}
