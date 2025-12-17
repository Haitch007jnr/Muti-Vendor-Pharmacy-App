import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  }

  getVersion(): object {
    return {
      version: "1.0.0",
      apiVersion: "v1",
      name: "Multi-Vendor Pharmacy API",
    };
  }
}
