import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoggerService, RMQServiceNames } from '@food-ordering-system/common';

@Injectable()
export class UserCommunicate {
  constructor(
    @Inject(RMQServiceNames.USER_SERVICE) private userClient: ClientProxy,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UserCommunicate.name);
  }

  async getUser(userId: string) {
    try {
      this.logger.log(`Fetching user with ID: ${userId}`);
      return await firstValueFrom(
        this.userClient.send('get_user', { id: userId })
      );
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`);
      throw error;
    }
  }
}