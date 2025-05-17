import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import {
  CheckAccess,
  CurrentUser,
  HasRole,
} from '@food-ordering-system/common';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

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

  @Post('me/wallet')
  @CheckAccess()
  async createMyWallet(
    @CurrentUser('sub') userId: string,
    @Body('initialBalance') initialBalance = 0
  ) {
    return this.userManagementService.createUserWallet(userId, initialBalance);
  }

  @Post(':id/wallet')
  @CheckAccess([HasRole.ADMIN])
  async createUserWallet(
    @Param('id') userId: string,
    @Body('initialBalance') initialBalance = 0
  ) {
    return this.userManagementService.createUserWallet(userId, initialBalance);
  }
}
