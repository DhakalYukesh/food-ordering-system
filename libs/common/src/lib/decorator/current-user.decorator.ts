import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the user from the request object
 * @param data Optional property to extract from the user object
 * @param context Execution context
 * @returns The user object or a specific property of the user
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    
    if (!request.user) {
      return null;
    }

    // If data is provided, return the specified property
    if (data) {
      return request.user[data];
    }
    
    // Otherwise return the entire user object
    return request.user;
  },
);
