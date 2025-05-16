import { registerAs } from '@nestjs/config';

export interface RabbitMQConfig {
  uri: string;
  queues: Record<string, string>;
}

export const rabbitmqConfig = registerAs('rabbitmqConfig', (): RabbitMQConfig => ({
  uri: process.env["RABBITMQ_URI"] || 'amqp://localhost:5672',
  queues: {
    WALLET_SERVICE: process.env["RABBITMQ_WALLET_SERVICE_QUEUE"] || 'wallet_service_queue',
    USER_SERVICE: process.env["RABBITMQ_USER_SERVICE_QUEUE"] || 'user_service_queue',
    ORDER_SERVICE: process.env["RABBITMQ_ORDER_SERVICE_QUEUE"] || 'order_service_queue',
  }
}));
