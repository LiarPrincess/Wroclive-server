import { default as nock } from 'nock';

import { Api, RemoveVehiclesOlderThan } from '../Api';

/* ============ */
/* === Nock === */
/* ============ */

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

const resourceId = 'resource_id';

function intercept(): nock.Interceptor {
  const host = 'https://www.wroclaw.pl';
  const path = '/open-data/api/action/datastore_search';
  const query = `?resource_id=${resourceId}&limit=99999&fields=Nr_Boczny&fields=Nazwa_Linii&fields=Ostatnia_Pozycja_Szerokosc&fields=Ostatnia_Pozycja_Dlugosc&fields=Data_Aktualizacji`;
  return nock(host).get(path + query);
}

interface VehicleResponse {
  Ostatnia_Pozycja_Dlugosc: number;
  Nr_Boczny: string;
  Ostatnia_Pozycja_Szerokosc?: number;
  Data_Aktualizacji: string;
  Nazwa_Linii: string;
}

function createResponse(vehicles: VehicleResponse[]): any {
  return {
    help: '...',
    result: { records: vehicles },
    success: true
  };
}

function createResponseError(type: string, message: string): any {
  return {
    help: '...',
    error: { __type: type, message },
    success: false
  };
}

/* ============= */
/* === Tests === */
/* ============= */

describe('OpenDataApi-queryVehicleLocations', () => {

  it('returns no vehicles when response is empty array', async () => {
    intercept()
      .reply(200, []);

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();

    const result = await api.queryVehicleLocations(resourceId, now);
    expect(result).toEqual({
      kind: 'Error',
      error: {
        'kind': 'No records',
        'message': 'Response does not contain any records.',
        'data': []
      }
    });
  });

  it('returns vehicles when response contains valid vehicles', async () => {
    intercept()
      .reply(200, createResponse([
        {
          Ostatnia_Pozycja_Dlugosc: 17.0230979919434,
          Nr_Boczny: '5319',
          Ostatnia_Pozycja_Szerokosc: 51.1475257873535,
          Data_Aktualizacji: '2020-01-01 10:00:00',
          Nazwa_Linii: '128'
        },
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          Ostatnia_Pozycja_Szerokosc: 51.1354217529297,
          Data_Aktualizacji: '2020-01-01 10:00:23',
          Nazwa_Linii: '141'
        }
      ]));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();

    const result = await api.queryVehicleLocations(resourceId, now);
    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [],
      vehicles: [
        { id: '1285319', lat: 51.1475257873535, line: '128', lng: 17.0230979919434 },
        { id: '1415322', lat: 51.1354217529297, line: '141', lng: 17.0692462921143 }
      ]
    });
  });

  it('returns invalid records when response contains invalid entries', async () => {
    intercept()
      .reply(200, createResponse([
        {
          Ostatnia_Pozycja_Dlugosc: 17.0230979919434,
          Nr_Boczny: '5319',
          Ostatnia_Pozycja_Szerokosc: 51.1475257873535,
          Data_Aktualizacji: '2020-01-01 10:00:00',
          Nazwa_Linii: '128'
        },
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          // Ostatnia_Pozycja_Szerokosc: 51.1354217529297, // Missing
          Data_Aktualizacji: '2020-01-01 10:00:23',
          Nazwa_Linii: '141'
        }
      ]));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();

    const result = await api.queryVehicleLocations(resourceId, now);
    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          Data_Aktualizacji: '2020-01-01 10:00:23',
          Nazwa_Linii: '141'
        }
      ],
      vehicles: [
        { id: '1285319', lat: 51.1475257873535, line: '128', lng: 17.0230979919434 }
      ]
    });
  });

  it('return invalid record on un-parseable date', async () => {
    intercept()
      .reply(200, createResponse([
        {
          Ostatnia_Pozycja_Dlugosc: 17.0230979919434,
          Nr_Boczny: '5319',
          Ostatnia_Pozycja_Szerokosc: 51.1475257873535,
          Data_Aktualizacji: '2020-01-01 10:00:00',
          Nazwa_Linii: '128'
        },
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          Ostatnia_Pozycja_Szerokosc: 51.1354217529297,
          Data_Aktualizacji: '2020-XX-YY 10:00:23',
          Nazwa_Linii: '141'
        }
      ]));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();

    const result = await api.queryVehicleLocations(resourceId, now);
    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          Ostatnia_Pozycja_Szerokosc: 51.1354217529297,
          Data_Aktualizacji: '2020-XX-YY 10:00:23',
          Nazwa_Linii: '141'
        }
      ],
      vehicles: [
        { id: '1285319', lat: 51.1475257873535, line: '128', lng: 17.0230979919434 }
      ]
    });
  });

  it('skips \'None\' lines', async () => {
    intercept()
      .reply(200, createResponse([
        {
          Ostatnia_Pozycja_Dlugosc: 17.0230979919434,
          Nr_Boczny: '5319',
          Ostatnia_Pozycja_Szerokosc: 51.1475257873535,
          Data_Aktualizacji: '2020-01-01 10:00:00',
          Nazwa_Linii: '128'
        },
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          Ostatnia_Pozycja_Szerokosc: 51.1354217529297,
          Data_Aktualizacji: '2020-01-01 10:00:23',
          Nazwa_Linii: 'None'
        }
      ]));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();

    const result = await api.queryVehicleLocations(resourceId, now);
    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [],
      vehicles: [
        { id: '1285319', lat: 51.1475257873535, line: '128', lng: 17.0230979919434 }
      ]
    });
  });

  it('removes old vehicles', async () => {
    const now = new Date('2020-01-01 10:01:00');
    const oldMilliseconds = now.getTime() - RemoveVehiclesOlderThan - 5;
    const old = new Date(oldMilliseconds);

    intercept()
      .reply(200, createResponse([
        {
          Ostatnia_Pozycja_Dlugosc: 17.0230979919434,
          Nr_Boczny: '5319',
          Ostatnia_Pozycja_Szerokosc: 51.1475257873535,
          Data_Aktualizacji: '2020-01-01 10:00:00',
          Nazwa_Linii: '128'
        },
        {
          Ostatnia_Pozycja_Dlugosc: 17.0692462921143,
          Nr_Boczny: '5322',
          Ostatnia_Pozycja_Szerokosc: 51.1354217529297,
          Data_Aktualizacji: old.toISOString(),
          Nazwa_Linii: '141'
        }
      ]));

    const api = new Api();
    const result = await api.queryVehicleLocations(resourceId, now);

    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [],
      vehicles: [
        { id: '1285319', lat: 51.1475257873535, line: '128', lng: 17.0230979919434 }
      ]
    });
  });

  it('returns error on response without records', async () => {
    const error = { empty: '' };
    intercept()
      .reply(200, error);

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.queryVehicleLocations(resourceId, now);

    expect(result).toEqual({
      kind: 'Error',
      error: {
        kind: 'No records',
        message: 'Response does not contain any records.',
        data: error
      }
    });
  });

  it('returns error on response with error', async () => {
    const error = createResponseError('Authorization Error', 'Access denied');
    intercept()
      .reply(200, error);

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.queryVehicleLocations(resourceId, now);

    expect(result).toEqual({
      kind: 'Error',
      error: {
        kind: 'Response with error',
        message: 'Response contains error field.',
        data: error
      }
    });
  });

  it('returns error on network error', async () => {
    intercept()
      .replyWithError('Some error...');

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.queryVehicleLocations(resourceId, now);

    expect(result.kind).toEqual('Error');
    switch (result.kind) {
      case 'Success':
        expect(true).toBeFalsy();
        break;
      case 'Error':
        expect(result.error.kind).toEqual('Network error');
        expect(result.error.message).toEqual('Unknown request error.');
        expect(result.error.data.message).toEqual('Some error...');
        break;
    }
  });

  it('returns error on 404', async () => {
    intercept()
      .reply(404, {});

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.queryVehicleLocations(resourceId, now);

    expect(result.kind).toEqual('Error');
    switch (result.kind) {
      case 'Success':
        expect(true).toBeFalsy();
        break;
      case 'Error':
        expect(result.error.kind).toEqual('Network error');
        expect(result.error.message).toEqual('Response with status: 404.');
        expect(result.error.data.message).toEqual('Request failed with status code 404');
        break;
    }
  });

  it('returns error on json parsing error', async () => {
    intercept()
      .reply(200, 'invalid json');

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.queryVehicleLocations(resourceId, now);

    expect(result).toEqual({
      kind: 'Error',
      error: {
        kind: 'No records',
        message: 'Response does not contain any records.',
        data: 'invalid json'
      }
    });
  });
});
