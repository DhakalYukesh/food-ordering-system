import { Catch, ArgumentsHost, HttpException, HttpStatus, ExceptionFilter } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(AllExceptionsFilter.name);
  }

  override catch(exception: unknown, host: ArgumentsHost): Observable<any> | any {
    const contextType = host.getType();
    this.logger.error(`Exception caught (${contextType}): ${(exception as Error)?.message || 'Unknown error'}`);
    
    // Handle HTTP exceptions differently than RPC exceptions
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        message = exception.message;
      } else if (exception instanceof Error) {
        message = exception.message;
      }
      
      return response.status(status).json({
        success: false,
        message: message,
        statusCode: status,
      });
    }
    
    // Handle RPC exceptions
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }
    
    // For any other exception in RPC context, convert to a simple RpcException
    let errorMessage = 'Internal server error';
    
    if (exception instanceof Error) {
      errorMessage = exception.message;
    } else if (exception instanceof HttpException) {
      errorMessage = exception.message;
    }
    
    return throwError(() => new RpcException(errorMessage));
  }
}