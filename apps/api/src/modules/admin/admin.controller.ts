import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { courseData, questionData, automationTemplateData, promptTemplateData } from '@inside/content';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @Get('overview')
  overview() {
    return {
      modules: courseData.modules.length,
      cycles: courseData.modules.flatMap((module) => module.cycles).length,
      questions: questionData.length,
      automationTemplates: automationTemplateData.length,
      promptTemplates: promptTemplateData.length,
    };
  }
}
