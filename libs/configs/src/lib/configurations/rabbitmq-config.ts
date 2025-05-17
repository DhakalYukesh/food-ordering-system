import { registerAs } from '@nestjs/config';

export interface RabbitMQConfig {
  uri: string;
  queues: Record<string, string>;
}

export const rabbitmqConfig = registerAs('rabbitmqConfig', (): RabbitMQConfig => ({
  uri: process.env["RABBITMQ_URI"] || 'amqp://guest:guest@localhost:5672',
  queues: {
    WALLET_SERVICE: process.env["RABBITMQ_WALLET_SERVICE_QUEUE"] || 'wallet_service',
    USER_SERVICE: process.env["RABBITMQ_USER_SERVICE_QUEUE"] || 'user_service',
    ORDER_SERVICE: process.env["RABBITMQ_ORDER_SERVICE_QUEUE"] || 'order_service',
    RESTAURANT_SERVICE: process.env["RABBITMQ_RESTAURANT_SERVICE_QUEUE"] || 'restaurant_service'
  }
}));
