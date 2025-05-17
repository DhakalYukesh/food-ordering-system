import { DynamicModule, Module } from '@nestjs/common';
import { ConfigsModule, ConfigService } from '@food-ordering-system/configs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';
import { RMQServiceNames } from './rmq-service-names';

interface RmqModuleOptions {
  name: string;
}

@Module({
  imports: [
    ConfigsModule,
    ClientsModule.registerAsync([
      {
        name: RMQServiceNames.ORDER_SERVICE,
        imports: [ConfigsModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getRabbitmqUri()],
            queue: configService.getRabbitmqQueue(RMQServiceNames.ORDER_SERVICE),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
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