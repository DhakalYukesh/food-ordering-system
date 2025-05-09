import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

export const createWinstonLogger = (appName: string, nodeEnv: string) => {
  return WinstonModule.createLogger({
    level: nodeEnv === 'dev' ? 'debug' : 'info',
    format: format.combine(format.timestamp(), format.json()),
    defaultMeta: { service: appName },
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.timestamp(),
          format.printf(({ timestamp, level, message, context }) => {
            return `${timestamp} [${context || appName}] ${level}: ${message}`;
          })
        ),
      }),
    ],
  });
};