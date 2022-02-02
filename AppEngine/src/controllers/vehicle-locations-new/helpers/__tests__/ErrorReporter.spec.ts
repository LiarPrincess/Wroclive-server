import { IntervalErrorReporter } from '../ErrorReporter';

/* ============ */
/* === Date === */
/* ============ */

const second = 1000;
const minute = 60 * second;

let currentDate: Date = new Date();

function getCurrentDateMock(): Date {
  return currentDate;
}

function createDate(milliseconds: number): Date {
  return new Date(milliseconds);
}

/* ============== */
/* === Logger === */
/* ============== */

class LogMessage {
  constructor(
    public readonly message: any,
    public readonly args: any[]
  ) { }
}

class LoggerMock {

  infoMessageCount = 0;
  errorMessageCount = 0;
  latestErrorMessage: LogMessage | undefined;

  info(message?: any, ...optionalParams: any[]) {
    this.infoMessageCount++;
  }

  error(message?: any, ...optionalParams: any[]) {
    this.errorMessageCount++;
    this.latestErrorMessage = new LogMessage(message, optionalParams);
  }
}

/* ============ */
/* === Main === */
/* ============ */

function createIntervalErrorReporter(interval: number, logger: LoggerMock) {
  return new IntervalErrorReporter(interval, 'MESSAGE', logger, getCurrentDateMock);
}

describe('IntervalErrorReporter', function () {

  it('reports a single error for the duration of interval', function () {
    const logger = new LoggerMock();
    const reporter = createIntervalErrorReporter(1 * minute, logger);

    currentDate = createDate(0 * second);
    reporter.report('ARG_1');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(1);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_1'] });

    currentDate = createDate(30 * second);
    reporter.report('ARG_2');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(1);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_1'] });

    currentDate = createDate(59 * second);
    reporter.report('ARG_3');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(1);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_1'] });
  });

  it('reports new errors after interval', function () {
    const logger = new LoggerMock();
    const reporter = createIntervalErrorReporter(1 * minute, logger);

    currentDate = createDate(0 * second);
    reporter.report('ARG_1');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(1);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_1'] });

    currentDate = createDate(1 * minute);
    reporter.report('ARG_2');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(2);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_2'] });

    currentDate = createDate(2 * minute);
    reporter.report('ARG_3');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(3);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_3'] });
  });

  it('does not report inside interval and reports after', function () {
    const logger = new LoggerMock();
    const reporter = createIntervalErrorReporter(1 * minute, logger);

    currentDate = createDate(0 * second);
    reporter.report('ARG_1');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(1);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_1'] });

    // Not reported
    currentDate = createDate(59 * second);
    reporter.report('ARG_2');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(1);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_1'] });

    // Reported
    currentDate = createDate(1 * minute);
    reporter.report('ARG_3');
    expect(logger.infoMessageCount).toEqual(0);
    expect(logger.errorMessageCount).toEqual(2);
    expect(logger.latestErrorMessage).toEqual({ message: 'MESSAGE', args: ['ARG_3'] });
  });
});
