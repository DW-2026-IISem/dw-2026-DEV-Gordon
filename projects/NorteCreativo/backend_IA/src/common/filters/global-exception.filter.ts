import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationException } from '../exceptions/application.exception.js';

interface ResolvedError {
  statusCode: number;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { statusCode, message } = this.resolve(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(`[${statusCode}] ${message}`);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof ApplicationException) {
      return { statusCode: exception.statusCode, message: exception.message };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const rawMessage = typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : (rawMessage ?? exception.message);

      return { statusCode: exception.getStatus(), message };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    };
  }
}
