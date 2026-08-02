import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'generated/prisma/enums';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';
import { Module } from 'src/common/permissions/module.enum';

@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModule = this.reflector.get<Module>(
      REQUIRE_MODULE_KEY,
      context.getHandler(),
    );

    // Route has no @RequireModule() — nothing to check, allow through
    if (!requiredModule) return true;

    const { user } = context.switchToHttp().getRequest();

    // SUPER_ADMIN / SCHOOL_ADMIN bypass module checks entirely
    if (user.role === Role.SUPER_ADMIN || user.role === Role.SCHOOL_ADMIN) {
      return true;
    }

    if (!user.allowedModules?.includes(requiredModule)) {
      throw new ForbiddenException(`You do not have access to this module`);
    }

    return true;
  }
}
