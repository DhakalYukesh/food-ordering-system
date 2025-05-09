import { LoggerService } from '@food-ordering-system/common';

export class UserManagementController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(UserManagementController.name);
  }
}
