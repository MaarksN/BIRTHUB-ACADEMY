import { Injectable, BadRequestException } from '@nestjs/common';
import { automationTemplateData, validateAutomationFlow } from '@inside/content';
import { automationFlowSchema } from '@inside/schemas';

@Injectable()
export class AutomationService {
  templates() {
    return automationTemplateData;
  }

  simulate(payload: unknown) {
    const flow = automationFlowSchema.parse(payload);
    const result = validateAutomationFlow({ ...flow, id: 'custom-flow', metrics: [], delays: [], fallbacks: [] });
    if (!result.valid) throw new BadRequestException(result.issues);
    return {
      mode: '[SIMULACAO]',
      valid: true,
      logs: [
        'Fluxo recebido',
        'Condições avaliadas',
        'Ações simuladas sem integração externa',
        'Aprovação humana exigida para ações de alto impacto',
      ],
    };
  }
}
