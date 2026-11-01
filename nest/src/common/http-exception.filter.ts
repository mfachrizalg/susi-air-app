import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    let statusCode = 500;
    let message = 'Internal server error';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const raw =
          (body as { message?: string | string[] }).message ??
          exception.message;
        if (Array.isArray(raw)) {
          message = 'Validation failed';
          errors = raw;
        } else {
          message = raw;
        }
      }
    } else {
      this.logger.error(exception);
    }

    res.status(statusCode).json({
      status: 'error',
      code: statusCode,
      message,
      errors: errors ?? null,
    });
  }
}
