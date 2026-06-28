import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'api', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const excellenceCatalogItems = await this.prisma.excellenceItem.count({
        where: { tenantId: process.env.PUBLIC_EXCELLENCE_TENANT_ID ?? process.env.PUBLIC_TENANT_ID ?? 'default' },
      });
      return { status: 'ready', database: 'up', excellenceCatalogItems, timestamp: new Date().toISOString() };
    } catch {
      throw new ServiceUnavailableException({ status: 'not_ready', database: 'down' });
    }
  }
}
