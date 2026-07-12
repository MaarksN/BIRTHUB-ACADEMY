import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

@Injectable()
export class AuthService {
  private readonly demoPasswordHash = bcrypt.hashSync('InsideSales#2026', 12);

  async login(email: string, password: string, tenantSlug: string) {
    const allowed = email === 'admin@inside.local' || email === 'aluno@inside.local';
    if (!allowed || !(await bcrypt.compare(password, this.demoPasswordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const sessionId = crypto.randomUUID();
    return {
      sessionId,
      user: {
        id: email.startsWith('admin') ? 'user-admin' : 'user-student',
        email,
        name: email.startsWith('admin') ? 'Admin Inside Sales' : 'Aluno Demonstração',
        tenantId: tenantSlug || 'default',
        roles: email.startsWith('admin') ? ['ADMIN'] : ['STUDENT'],
      },
    };
  }
}
