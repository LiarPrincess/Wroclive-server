import * as winston from 'winston';
import * as google from '@google-cloud/logging-winston';

import { isProduction } from './environment-check';

export interface Logger {
  info(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

export function createConsoleLogger(): Logger {
  return { info: console.log, error: console.error };
}

class WinstonLoggerWrapper implements Logger {
  public constructor(
    private readonly inner: winston.Logger
  ) { }
  info(message?: any, ...optionalParams: any[]): void {
    try {
      this.inner.info(message, ...optionalParams);
    } catch (error) { }
  }
  error(message?: any, ...optionalParams: any[]): void {
    try {
      this.inner.error(message, ...optionalParams);
    } catch (error) { }
  }
}

export function createLogger(serviceName: string): Logger {
  const logger = winston.createLogger({
    handleExceptions: true,
    exitOnError: true,
    level: 'silly',
    transports: []
  });

  if (isProduction) {
    logger.add(new google.LoggingWinston({
      level: 'info',
      logName: serviceName
    }));
  } else {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
      level: 'silly'
    }));
  }
  // logger.add(new winston.transports.Console({
  //   format: winston.format.simple(),
  //   level: 'silly'
  // }));
  // const wrap = new WinstonLoggerWrapper(logger);
  // return wrap;
  return logger;
}
