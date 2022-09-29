import { default as axios } from 'axios';
import { ResponseModel, StopData } from './response-model';
import { StopArrival } from '../models';

const baseUrl = 'https://tram.wroclaw.pl/ws/board/show/';

export class GetNextArrivalsError {
  constructor(
    public readonly kind: 'Network error' | 'Invalid response',
    public readonly message: string,
    public readonly data: any,
  ) { }
}

export type GetNextArrivalsResult =
  { kind: 'Success', arrivals: StopArrival[], invalidRecords: any[] } |
  { kind: 'Error', error: GetNextArrivalsError };

export async function getNextArrivals(stopId: string): Promise<GetNextArrivalsResult> {
  try {
    const url = baseUrl + stopId;
    const response = await axios.get(url);
    return parse(stopId, response.data);
  } catch (error) {
    const statusCode = getStatusCode(error);
    const message = statusCode ?
      `Response with status: ${statusCode}.` :
      `Unknown request error.`;

    const e = new GetNextArrivalsError('Network error', message, error);
    return { kind: 'Error', error: e };
  }
}

function parse(stopId: string, response: ResponseModel): GetNextArrivalsResult {
  function error(message: string): GetNextArrivalsResult {
    const error = new GetNextArrivalsError('Invalid response', message, response);
    return { kind: 'Error', error };
  }

  const stop = response[stopId] as StopData;
  if (stop === undefined) {
    return error(`Response does not contain stopId (${stopId}).`);
  }

  const boards = stop.board;
  if (!Array.isArray(boards)) {
    return error(`Response contains invalid 'board' definition (${typeof boards}).`);
  }

  const arrivals: StopArrival[] = [];
  const invalidRecords: any[] = [];

  for (const b of boards) {
    const line = b.line;
    const dir = b.direction;
    const time = b.minuteCount;
    const floor = b.floor;
    const ac = b.ac;

    const isValid = isString(line)
      && isString(dir)
      && isNumber(time)
      && isString(floor)
      && isBool(ac);

    if (isValid) {
      const lowFloor = floor === 'l' ? true : (floor === 'h' ? false : undefined);
      const arrival = new StopArrival(line, dir, time, ac, lowFloor);
      arrivals.push(arrival);
    } else {
      invalidRecords.push(b);
    }
  }

  return { kind: 'Success', arrivals, invalidRecords };
}

function getStatusCode(error: any): string | undefined {
  return error.statusCode || (error.response && error.response.status);
}

function isNumber(o: any): boolean {
  return Number.isFinite(o);
}

function isString(o: any): boolean {
  return typeof o === 'string' || o instanceof String;
}

function isBool(o: any): boolean {
  return typeof o === 'boolean';
}
