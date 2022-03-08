import { writeFile } from 'fs/promises';

import { Event } from './Event';
import { Downtime } from './calculate-downtime';

const second = 1000.0;
const minute = 60.0 * second;
const hour = 60.0 * minute;
const day = 24.0 * hour;

export async function writeReport(events: Event[], downtimes: Downtime[], path: string) {
  let content = '# AppEngine life cycle report\n\n';

  if (events.length === 0) {
    content += 'No events.\n';
    await writeFile(path, content, 'utf-8');
  }

  const t = createTimeline(events, downtimes);

  content += '## Time range\n';
  content += `- Start date: ${formatDate_YYYYMMDD_hhmmss(t.minDate)}\n`;
  content += `- End date:   ${formatDate_YYYYMMDD_hhmmss(t.maxDate)}\n`;
  content += `- Duration:   ${formatTime_hhmmss(t.totalMilliseconds)}\n`;
  content += '\n';

  content += '## Event count\n';
  content += `- Create version: ${t.createVersionCount} (please note that downtime calculation on the update day is off)\n`;
  content += `- Start: ${t.startCount}\n`;
  content += `- Quit:  ${t.quitCount}\n`;
  content += '\n';

  content += '## Downtimes\n';
  content += `- Count: ${t.downtimeCount}\n`;
  content += `- Total: ${formatTime_hhmmss(t.downtimeTotalMilliseconds)}\n`;
  const totalTimeHuman = new HumanReadableInterval(t.totalMilliseconds);
  const dayCount = totalTimeHuman.days + 1;
  const downtimeCountPerDay = (t.downtimeCount / dayCount).toFixed(2);
  const downtimeDurationPerDay = t.downtimeTotalMilliseconds / dayCount;
  content += `- Average per day: ${formatTime_hhmmss(downtimeDurationPerDay)} (count: ${downtimeCountPerDay})\n`;
  const uptimeMilliseconds = t.totalMilliseconds - t.downtimeTotalMilliseconds;
  const uptimePercent = (uptimeMilliseconds / t.totalMilliseconds * 100).toFixed(3);
  content += `- Uptime: ${formatTime_hhmmss(uptimeMilliseconds)} (${uptimePercent}%)\n`;
  content += '\n';

  content += '## Events\n';
  for (const dailyEvents of t.events) {
    const day = formatDate_YYYYMMDD(dailyEvents.date);
    const dayDowntime = formatTime_hhmmss(dailyEvents.downtimeDurationMilliseconds);
    content += `- ${day} - ${dayDowntime}\n`;

    for (const event of dailyEvents.events) {
      switch (event.kind) {
        case 'Create version':
          content += `  - ${formatDate_hhmm(event.date)} Create version\n`;
          break;
        case 'Quit':
          // content += `  - ${formatDate_hhmm(event.date)} Quit\n`;
          break;
        case 'Start':
          // content += `  - ${formatDate_hhmm(event.date)} Start\n`;
          break;
        case 'Downtime':
          const durationAbs = Math.abs(event.durationMilliseconds);
          if (durationAbs < 30 * second) {
            // We don't care about short downtimes.
            break;
          }

          const date = event.quit;
          const time = formatDate_hhmm(date);
          const duration = formatTime_hhmmss(event.durationMilliseconds);

          const flags: string[] = [];
          if (durationAbs > 10 * minute) {
            flags.push('VERY LONG!');
          }

          const hour = date.getUTCHours();
          const morningPeak = 6 <= hour && hour < 10;
          const afterWorkPeak = 15 <= hour && hour < 18;
          if (morningPeak || afterWorkPeak) {
            flags.push('IMPORTANT HOUR!');
          }

          const flagsString = flags.length ? ' - ' + flags.join(' ') : '';
          content += `  - ${time} Downtime: ${duration}${flagsString}\n`;
          break;
      }
    }
  }
  content += '\n';

  await writeFile(path, content, 'utf-8');
}

/* ================ */
/* === Timeline === */
/* ================ */

type TimelineEvent =
  { kind: 'Downtime', quit: Date, start: Date, durationMilliseconds: number } |
  { kind: 'Create version', date: Date } |
  { kind: 'Start', date: Date } |
  { kind: 'Quit', date: Date };

class DailyEvents {
  public readonly date: Date;
  public readonly dateKey: string;
  public readonly events: TimelineEvent[] = [];
  public downtimeDurationMilliseconds = 0;

  public constructor(date: Date, key: string) {
    this.date = date;
    this.dateKey = key;
  }

  public static createKey(date: Date) {
    // Take only date part from iso
    return date.toISOString().substring(0, 10);
  }
}

class Timeline {
  public minDate = new Date(8640000000000000);
  public maxDate = new Date(-8640000000000000);

  public get totalMilliseconds(): number {
    const minTime = this.minDate.getTime();
    const maxTime = this.maxDate.getTime();
    return maxTime - minTime;
  }

  public createVersionCount = 0;
  public startCount = 0;
  public quitCount = 0;

  public downtimeCount = 0;
  public downtimeTotalMilliseconds = 0;

  public readonly events: DailyEvents[] = [];

  public appendDowntime(downtime: Downtime) {
    const quit = downtime.quit.date;
    const start = downtime.start.date;
    const durationMilliseconds = downtime.durationMilliseconds;

    this.downtimeCount++;
    this.downtimeTotalMilliseconds += Math.abs(durationMilliseconds);
    this.updateMinMaxDate(quit);
    this.updateMinMaxDate(start);

    const dailyEvents = this.getDailyEvents(quit);
    dailyEvents.downtimeDurationMilliseconds += Math.abs(durationMilliseconds);
    dailyEvents.events.push({ kind: 'Downtime', quit, start, durationMilliseconds });
  }

  public appendEvent(event: Event) {
    this.updateMinMaxDate(event.date);
    const dailyEvents = this.getDailyEvents(event.date);

    switch (event.kind) {
      case 'Create version':
        this.createVersionCount++;
        dailyEvents.events.push({ kind: 'Create version', date: event.date });
        break;
      case 'Starting app':
        this.startCount++;
        dailyEvents.events.push({ kind: 'Start', date: event.date });
        break;
      case 'Quitting on terminated signal':
        this.quitCount++;
        dailyEvents.events.push({ kind: 'Quit', date: event.date });
        break;
    }
  }

  private updateMinMaxDate(date: Date) {
    if (date < this.minDate) { this.minDate = date; }
    if (date > this.maxDate) { this.maxDate = date; }
  }

  private getDailyEvents(date: Date): DailyEvents {
    const key = DailyEvents.createKey(date);

    if (this.events.length == 0) {
      const result = new DailyEvents(date, key);
      this.events.push(result);
      return result;
    }

    const sameDayEvents = this.events[this.events.length - 1];
    if (sameDayEvents.dateKey == key) {
      return sameDayEvents;
    }

    const result = new DailyEvents(date, key);
    this.events.push(result);
    return result;
  }
}

function createTimeline(eventsArg: Event[], downtimesArg: Downtime[]): Timeline {
  const result = new Timeline();

  const events = eventsArg.sort((lhs, rhs) => lhs.date.getTime() - rhs.date.getTime());
  const downtimes = downtimesArg.sort((lhs, rhs) => lhs.quit.date.getTime() - rhs.quit.date.getTime());

  let eventIndex = 0;
  let downtimeIndex = 0;
  while (eventIndex < events.length && downtimeIndex < downtimes.length) {
    let event: Event | undefined;
    let eventTime = Infinity;

    if (eventIndex < events.length) {
      event = events[eventIndex];
      eventTime = event.date.getTime();
    }

    let downtime: Downtime | undefined;
    let downtimeTime = Infinity;

    if (downtimeIndex < downtimes.length) {
      downtime = downtimes[downtimeIndex];
      downtimeTime = downtime.quit.date.getTime();
    }

    if (!event) {
      result.appendDowntime(downtime as Downtime);
      downtimeIndex++;
    } else if (!downtime) {
      result.appendEvent(event as Event);
      eventIndex++;
    } else {
      // Downtime before entry if equal.
      if (downtimeTime <= eventTime) {
        result.appendDowntime(downtime as Downtime);
        downtimeIndex++;
      } else {
        result.appendEvent(event as Event);
        eventIndex++;
      }
    }
  }

  return result;
}

/* ============== */
/* === Format === */
/* ============== */

function formatDate_YYYYMMDD(date: Date): string {
  return date.toISOString().substring(0, 10);
}

function formatDate_hhmm(date: Date): string {
  return date.toISOString().substring(11, 16);
}

function formatDate_YYYYMMDD_hhmmss(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

class HumanReadableInterval {
  public readonly days: number;
  public readonly hours: number;
  public readonly minutes: number;
  public readonly seconds: number;

  public constructor(milliseconds: number) {
    let remaining = milliseconds;

    this.days = Math.floor(remaining / day);
    remaining = remaining % day;

    this.hours = Math.floor(remaining / hour);
    remaining = remaining % hour;

    this.minutes = Math.floor(remaining / minute);
    remaining = remaining % minute;

    this.seconds = Math.floor(remaining / second);
  }
}

function formatTime_hhmmss(milliseconds: number): string {
  const sign = milliseconds < 0 ? '-' : '';
  const interval = new HumanReadableInterval(Math.abs(milliseconds));

  let result = '';
  function append(count: number, unit: string) {
    if (result || count) {
      if (result) {
        result += ' ';
      }

      result += `${count}${unit}`;
    }
  }

  append(interval.days, 'd');
  append(interval.hours, 'h');
  append(interval.minutes, 'm');
  append(interval.seconds, 's');

  return sign + result;
}
