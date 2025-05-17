import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@food-ordering-system/configs';
import { RmqContext, RmqOptions, Transport, ClientProxy } from '@nestjs/microservices';
import { RMQServiceNames } from './rmq-service-names';

@Injectable()
export class RmqService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(RMQServiceNames.ORDER_SERVICE) private orderClient?: ClientProxy
  ) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.getRabbitmqUri()],
        queue: this.configService.getRabbitmqQueue(queue),
        noAck,
        queueOptions: {
          durable: true,
        },
      },
    };
  }

  getRpcOptions(queue: string): RmqOptions {
    const options = this.getOptions(queue, false);
    (options.options as Record<string, unknown>)['rpc'] = true;
    return options;
  }

  acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }

  emitEvent(pattern: string, data: unknown) {
    if (this.orderClient) {
      this.orderClient.emit(pattern, data);
    } else {
      console.error('Order client not available for event emission');
    }
  }
}
