import { Logger } from '../models';
import { subtractMilliseconds } from '../math';

// For calculating intervals.
export const second = 1000;
export const minute = 60 * second;
export const hour = 60 * minute;

type DateProvider = () => Date;

/**
 * Will report error once per 'interval' to prevent spam.
 */
export class IntervalErrorReporter {

  private readonly interval: number;
  private readonly message: string;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;
  private lastReport: Date | undefined;

  constructor(intervalInMilliseconds: number, message: string, logger: Logger, dateProvider?: DateProvider) {
    this.interval = intervalInMilliseconds;
    this.message = message;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
    this.lastReport = undefined;
  }

  report(error?: any) {
    const now = this.dateProvider();

    // If 'this.lastReport' is 'undefined' -> report.
    let hasIntervalPassedSinceLastReport = true;
    if (this.lastReport) {
      const diff = subtractMilliseconds(now, this.lastReport);
      hasIntervalPassedSinceLastReport = diff >= this.interval;
    }

    if (hasIntervalPassedSinceLastReport) {
      this.logger.error(this.message, error);
      this.lastReport = now;
    }
  }
}
