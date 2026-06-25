import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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
    const session = request.cookies?.inside_session;

    if (!session) {
      throw new UnauthorizedException('Sessão inválida');
    }

    // In a real application, we would validate the session against a database or cache
    // For this demo, we assume the admin session is always 'user-admin'
    // This is a simplification.
    const user = {
      roles: session === 'admin-session-id' ? ['ADMIN'] : ['STUDENT'],
    };

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
