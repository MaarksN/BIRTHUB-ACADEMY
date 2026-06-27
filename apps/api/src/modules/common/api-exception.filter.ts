import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request & { requestId?: string }>();
    const response = context.getResponse<Response>();
    const isZod = exception instanceof ZodError;
    const status = isZod
      ? HttpStatus.BAD_REQUEST
      : exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = isZod
      ? exception.flatten()
      : exception instanceof HttpException
        ? exception.getResponse()
        : undefined;
    const message = isZod
      ? 'Payload inválido'
      : exception instanceof HttpException
        ? exception.message
        : 'Erro interno';
    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status],
      message,
      details,
      path: request.originalUrl,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
    });
  }
}

