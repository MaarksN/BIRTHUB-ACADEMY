import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const auth = request.auth;
    if (!auth) {
      throw new UnauthorizedException('Sessão inválida');
    }
    if (!requiredRoles.some((role) => auth.roles?.includes(role))) {
      throw new ForbiddenException('Permissão insuficiente');
    }
    return true;
  }
}
