import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    const userRoles = [] as string[];
    if (Array.isArray(user.roles)) {
      userRoles.push(...user.roles);
    }
    if (user.role && !userRoles.includes(user.role)) {
      userRoles.push(user.role);
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
