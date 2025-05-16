import { DynamicModule, Module } from '@nestjs/common';
import { ConfigsModule, ConfigService } from '@food-ordering-system/configs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  imports: [ConfigsModule],
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ConfigsModule,
        ClientsModule.registerAsync([
          {
            name,
            imports: [ConfigsModule],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.getRabbitmqUri()],
                queue: configService.getRabbitmqQueue(name),
                queueOptions: {
                  durable: true,
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }

  static registerRpc({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ConfigsModule,
        ClientsModule.registerAsync([
          {
            name,
            imports: [ConfigsModule],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.getRabbitmqUri()],
                queue: configService.getRabbitmqQueue(name),
                queueOptions: {
                  durable: true,
                },
                rpc: true,
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}