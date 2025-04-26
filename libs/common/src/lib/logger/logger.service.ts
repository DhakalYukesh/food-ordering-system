// import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
// import { format } from 'winston';
// import * as winston from 'winston';

// @Injectable()
// export class LoggerService implements NestLoggerService {
//   private logger: winston.Logger;
//   private context: string | undefined;

//   constructor(private configService: ConfigService) {
//     const appConfig = this.configService.getAppConfig();

//     if (!appConfig) {
//       throw new Error(
//         'App config is not defined! Please check your configuration.'
//       );
//     }

//     this.logger = winston.createLogger({
//       level: appConfig.node_env === 'dev' ? 'debug' : 'info',
//       format: format.combine(
//         format.timestamp(),
//         format.json(),
//         format.metadata()
//       ),
//       defaultMeta: {
//         service: appConfig.name,
//         version: appConfig.version,
//       },
//       transports: [
//         new winston.transports.Console({
//           format: format.combine(
//             format.colorize(),
//             format.timestamp(),
//             format.printf(({ timestamp, level, message }) => {
//               return `${timestamp} [${appConfig.name}:${
//                 this.context && this.context
//               }] ${level} : ${message}`;
//             })
//           ),
//         }),
//         // Add file transport for production
//         ...(appConfig.node_env !== 'dev'
//           ? [
//               new winston.transports.File({
//                 filename: `logs/${appConfig.name}.error.log`,
//                 level: 'error',
//               }),
//               new winston.transports.File({
//                 filename: `logs/${appConfig.name}.combined.log`,
//               }),
//             ]
//           : []),
//       ],
//     });
//   }
// }
