import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('issue')
  issue(@Body() body: { userName: string; progress: any; tenantId?: string; userId?: string; courseVersionId?: string }) {
    return this.certificateService.issue(body);
  }

  @Get('verify/:code')
  verify(@Param('code') code: string) {
    return this.certificateService.verify(code);
  }
}
