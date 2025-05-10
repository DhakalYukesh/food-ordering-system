import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role requirements
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false; // No user found in request
    }

    // If user is admin, automatically grant access
    if (user.role === 'admin') {
      return true;
    }

    // Check if user role matches any of the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new Error(
        `User role ${user.role} does not match required roles: ${requiredRoles}`
      );
    }

    return true;
  }
}
