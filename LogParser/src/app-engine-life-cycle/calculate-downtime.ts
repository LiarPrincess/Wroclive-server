import { Event } from './Event';

export class Downtime {
  public readonly durationMilliseconds: number;

  constructor(
    public readonly start: Event,
    public readonly quit: Event,
  ) {
    const startTime = start.date.getTime();
    const quitTime = quit.date.getTime();
    this.durationMilliseconds = startTime - quitTime;
  }
}

export function calculateDowntime(events: Event[]): Downtime[] {
  const result: Downtime[] = [];

  // 'Starting app' / 'Quitting on terminated signal' can arrive out of order.
  // So, for every 'quit' entry find closest 'start' entry.
  // Not perfect, but it works.

  for (let index = 0; index < events.length; index++) {
    const quitEvent = events[index];
    const quitEventTime = quitEvent.date.getTime();

    if (!isQuit(quitEvent)) {
      continue;
    }

    const searchRange = 10;
    const minIndex = Math.max(index - searchRange, 0);
    const maxIndexPlus1 = Math.min(index + searchRange, events.length);

    let startEvent: Event | undefined;
    let startEventTimestampDiff = Infinity;

    for (let i = minIndex; i < maxIndexPlus1; i++) {
      const startCandidate = events[i];
      if (!isStartEntry(startCandidate)) {
        continue;
      }

      const startEntryTime = startCandidate.date.getTime();
      const diff = Math.abs(quitEventTime - startEntryTime);
      if (diff < startEventTimestampDiff) {
        startEvent = startCandidate;
        startEventTimestampDiff = diff;
      }
    }

    if (!startEvent) {
      throw new Error(`Unable to find closest start entry for: '${quitEvent.id}'.`);
    }

    const pair = new Downtime(startEvent, quitEvent);
    result.push(pair);
  }

  return result;
}

function isStartEntry(event: Event): boolean {
  switch (event.kind) {
    case 'Starting app':
      return true;
    case 'Quitting on terminated signal':
    case 'Create version':
      return false;
  }
}

function isQuit(event: Event): boolean {
  switch (event.kind) {
    case 'Quitting on terminated signal':
      return true;
    case 'Starting app':
    case 'Create version':
      return false;
  }
}
