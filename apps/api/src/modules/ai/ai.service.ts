import { Injectable, BadRequestException } from '@nestjs/common';
import { aiLabRequestSchema } from '@inside/schemas';

@Injectable()
export class AiService {
  run(payload: unknown) {
    const input = aiLabRequestSchema.parse(payload);
    if (input.mode === 'provider' && !process.env.AI_PROVIDER_API_KEY) {
      throw new BadRequestException('Provedor real não configurado. Use modo simulado ou configure adapter server-side.');
    }
    const riskFlags = ['validar fontes', 'não usar dados pessoais sem consentimento', 'separar fato, hipótese e inferência'];
    return {
      mode: input.mode === 'simulated' ? '[SIMULACAO]' : 'provider-adapter',
      response: `[SIMULACAO] Rascunho educacional: defina objetivo, contexto, dados permitidos, saída esperada e pontos de aprovação humana antes de usar a resposta.`,
      riskFlags,
      stored: input.consentToStore,
    };
  }
}
