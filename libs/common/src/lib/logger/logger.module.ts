import { Global, Module } from '@nestjs/common';
import { ConfigsModule as FoodOrderConfigModule } from '@food-ordering-system/configs';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [FoodOrderConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
