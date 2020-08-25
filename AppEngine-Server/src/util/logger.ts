export interface Logger {
  info(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export function createLogger(): Logger {
  return new ConsoleLogger();
}

class ConsoleLogger implements Logger {

  info(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }
}
