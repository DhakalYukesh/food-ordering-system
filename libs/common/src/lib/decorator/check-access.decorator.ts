import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';

export const Roles = (...roles: string[]) => {
  return SetMetadata("roles", roles);
};

export const CheckAccess = (roles?: string[]) => {
  if (roles && roles.length > 0) {
    // If roles are provided, use the RoleGuard
    return applyDecorators(
      Roles(...roles),
      UseGuards(JwtAuthGuard, RoleGuard)
    );
  }

  return applyDecorators(UseGuards(JwtAuthGuard));
};
