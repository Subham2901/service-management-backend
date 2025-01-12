import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.debug(`User Role: ${user?.role || 'undefined'}`);
    this.logger.debug(`Required Roles: ${requiredRoles}`);

    if (!user) {
      this.logger.warn('Access denied: No user found in request');
      throw new ForbiddenException('Access denied: No user found');
    }

    if (!requiredRoles.includes(user.role)) {
      this.logger.warn(`Access denied for user role: ${user.role}`);
      throw new ForbiddenException('Access denied: Insufficient role');
    }

    this.logger.log(`Access granted for user role: ${user.role}`);
    return true;
  }
}
