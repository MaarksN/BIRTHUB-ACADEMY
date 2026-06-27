import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import crypto from 'node:crypto';
import { aiLabRequestSchema } from '@inside/schemas';
import type { AuthContext } from '../auth/auth.types';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async run(payload: unknown, auth: AuthContext) {
    const input = aiLabRequestSchema.parse(payload);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dailyUsage = await this.prisma.aIInteractionLog.count({
      where: { tenantId: auth.activeTenantId, userId: auth.userId, createdAt: { gte: dayStart } },
    });
    const dailyLimit = Number(process.env.AI_DAILY_USER_LIMIT ?? 20);
    if (dailyUsage >= dailyLimit) throw new HttpException('Limite diário de IA atingido', HttpStatus.TOO_MANY_REQUESTS);

    const response = input.mode === 'provider' ? await this.callProvider(input.prompt) : this.simulate();
    const redactedPrompt = input.consentToStore
      ? input.prompt.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[EMAIL]').slice(0, 5000)
      : '[NÃO ARMAZENADO SEM CONSENTIMENTO]';
    const log = await this.prisma.aIInteractionLog.create({
      data: {
        tenantId: auth.activeTenantId,
        userId: auth.userId,
        mode: input.mode,
        promptHash: crypto.createHash('sha256').update(input.prompt).digest('hex'),
        redactedPrompt,
        response: input.consentToStore ? response : null,
        consentToStore: input.consentToStore,
      },
    });
    return {
      id: log.id,
      mode: input.mode,
      response,
      riskFlags: ['validar fontes', 'não inserir dados pessoais sem base legal', 'manter aprovação humana'],
      stored: input.consentToStore,
      remainingToday: Math.max(0, dailyLimit - dailyUsage - 1),
    };
  }

  private simulate() {
    return '[SIMULAÇÃO] Defina objetivo, contexto, dados permitidos, saída esperada e pontos de aprovação humana.';
  }

  private async callProvider(prompt: string) {
    const apiKey = process.env.AI_PROVIDER_API_KEY;
    const url = process.env.AI_PROVIDER_URL;
    if (!apiKey || !url) throw new BadRequestException('Adapter de IA não configurado no servidor');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.AI_PROVIDER_MODEL, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new BadRequestException('Provedor de IA indisponível');
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null) throw new BadRequestException('Resposta inválida do provedor');
    const record = data as Record<string, unknown>;
    const choices = Array.isArray(record.choices) ? record.choices : [];
    const first = choices[0] as Record<string, unknown> | undefined;
    const message = first?.message as Record<string, unknown> | undefined;
    if (typeof message?.content !== 'string') throw new BadRequestException('Resposta sem conteúdo do provedor');
    return message.content;
  }
}
