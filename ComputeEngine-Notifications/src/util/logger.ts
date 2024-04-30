import * as winston from "winston";
import * as google from "@google-cloud/logging-winston";

import { isProduction } from "./environment-check";

export interface Logger {
  info(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export class LoggerFake implements Logger {
  public infoArgs: { message: string; args: any[] }[] = [];
  public errorArgs: { message: string; args: any[] }[] = [];

  public info(message?: any, ...optionalParams: any[]): void {
    this.infoArgs.push({ message, args: optionalParams });
  }
  public error(message?: any, ...optionalParams: any[]): void {
    this.errorArgs.push({ message, args: optionalParams });
  }
}

export function createLogger(serviceName: string): Logger {
  const logger = winston.createLogger({
    handleExceptions: true,
    exitOnError: true,
    level: "silly",
    transports: [],
  });

  if (isProduction) {
    logger.add(
      new google.LoggingWinston({
        level: "info",
        logName: serviceName,
      })
    );
  } else {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
        level: "silly",
      })
    );
  }

  return logger;
}
