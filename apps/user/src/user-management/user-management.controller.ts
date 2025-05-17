import { Controller, Get, Param } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import {
  CheckAccess,
  CurrentUser,
  HasRole,
  LoggerService,
  UserMessagePatterns,
} from '@food-ordering-system/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UserManagementController {
  constructor(
    private readonly logger: LoggerService,
    private readonly userManagementService: UserManagementService
  ) {
    this.logger.setContext(UserManagementController.name);
  }

  @Get('me/profile')
  @CheckAccess()
  async getMyProfile(@CurrentUser('sub') userId: string) {
    return this.userManagementService.getUserWithWallet(userId);
  }

  @Get(':id/profile')
  @CheckAccess([HasRole.ADMIN])
  async getUserProfile(@Param('id') userId: string) {
    return this.userManagementService.getUserWithWallet(userId);
  }

  // RPC endpoint to get user
  // This endpoint is called by the order service when a user places an order
  @MessagePattern(UserMessagePatterns.GET_USER)
  async handleGetUser(@Payload() data: { id: string }) {
    this.logger.log(`RPC: Fetching user with ID ${data.id}`);
    try {
      const user = await this.userManagementService.getUserWithWallet(data.id);
      return user;
    } catch (error) {
      this.logger.error(`RPC: Error fetching user: ${error.message}`);
      return null;
    }
  }
}
