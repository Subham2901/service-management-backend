import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 * 
 * Attaches roles metadata to a route or controller.
 * Used in combination with RolesGuard to enforce role-based access control.
 *
 * @param roles - Array of roles allowed to access the route or controller
 * @returns A custom decorator that sets roles metadata
 *
 * Example Usage:
 * @Roles('admin', 'user')
 * @Controller('example')
 * export class ExampleController {}
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
