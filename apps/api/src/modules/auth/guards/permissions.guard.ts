import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../../common/entities';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Extract user permissions from roles
    const userPermissions = this.getUserPermissions(user);

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `User does not have required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private getUserPermissions(user: User): string[] {
    const permissions: string[] = [];

    if (user.userRoles) {
      for (const userRole of user.userRoles) {
        if (userRole.role && userRole.role.rolePermissions) {
          for (const rolePermission of userRole.role.rolePermissions) {
            if (rolePermission.permission) {
              permissions.push(rolePermission.permission.name);
            }
          }
        }
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  }
}
