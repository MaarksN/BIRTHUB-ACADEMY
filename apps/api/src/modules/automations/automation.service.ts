import { Injectable, BadRequestException } from '@nestjs/common';
import { automationTemplateData, validateAutomationFlow } from '@inside/content';
import { automationFlowSchema } from '@inside/schemas';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import type { AuthContext } from '../auth/auth.types';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  templates() {
    return automationTemplateData;
  }

  async simulate(payload: unknown, auth: AuthContext) {
    const flow = automationFlowSchema.parse(payload);
    const result = validateAutomationFlow({ ...flow, id: 'custom-flow', metrics: [], delays: [], fallbacks: [] });
    if (!result.valid) throw new BadRequestException(result.issues);
    const logs = [
      'Fluxo recebido',
      'Condições avaliadas',
      'Ações simuladas sem integração externa',
      'Aprovação humana exigida para ações de alto impacto',
    ];
    const simulation = await this.prisma.automationSimulation.create({
      data: {
        tenantId: auth.activeTenantId,
        userId: auth.userId,
        flow: flow as Prisma.InputJsonValue,
        logs,
        valid: true,
      },
    });
    return {
      id: simulation.id,
      mode: '[SIMULACAO]',
      valid: true,
      logs,
    };
  }
}
