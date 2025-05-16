import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(AllExceptionsFilter.name);
  }

  override catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    this.logger.error(`RPC Exception: ${(exception as Error)?.message || 'Unknown error'}`);
    
    // If it's already an RpcException, pass it through
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }
    
    // For any other exception, convert to a simple format that can be serialized
    let errorMessage = 'Internal server error';
    
    if (exception instanceof Error) {
      errorMessage = exception.message;
    } else if (exception instanceof HttpException) {
      errorMessage = exception.message;
    }
    
    // Create a new simple RpcException with just a string message
    return throwError(() => new RpcException(errorMessage));
  }
}
