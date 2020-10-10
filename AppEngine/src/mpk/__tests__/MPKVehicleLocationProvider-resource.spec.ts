import { default as nock } from 'nock';

import {
  MPKVehicleLocationProvider,
  ResourceIdRefresh
} from './../update-vehicle-locations';

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

function intercept(): nock.Interceptor {
  const host = 'https://www.wroclaw.pl';
  const path = '/open-data/dataset/lokalizacjapojazdowkomunikacjimiejskiejnatrasie_data.jsonld';
  return nock(host).get(path);
}

const resourceId = 'RESOURCE_ID';

// tslint:disable: quotemark
function createResponse(
  distributionId: string,
  distributionAccessURL: string,
  datasetDistributionId: string
): any {
  return {
    "@context": {
      "adms": "http://www.w3.org/ns/adms#",
      "dcat": "http://www.w3.org/ns/dcat#",
      "dct": "http://purl.org/dc/terms/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "gsp": "http://www.opengis.net/ont/geosparql#",
      "locn": "http://www.w3.org/ns/locn#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "schema": "http://schema.org/",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "time": "http://www.w3.org/2006/time",
      "vcard": "http://www.w3.org/2006/vcard/ns#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    },
    "@graph": [
      {
        "@id": "https://www.wroclaw.pl/open-data/organization/9f8bacb8-0463-42ba-b27f-6d4b308a6080",
        "@type": "foaf:Organization",
        "foaf:name": "ZarzÄ…d DrÃ³g i Utrzymania Miasta we WrocÅ‚awiu"
      },
      {
        "@id": distributionId,
        "@type": "dcat:Distribution",
        "dcat:accessURL": {
          "@id": distributionAccessURL
        },
        "dct:description": "BieÅ¼Ä…ce poÅ‚oÅ¼enie pojazdÃ³w komunikacji miejskiej we WrocÅ‚awiu - Autobusy i Tramwaje. Alternatywny dostÄ™p do danych takÅ¼e poprzez portal MPK WrocÅ‚aw: http://www.mpk.wroc.pl\r\n",
        "dct:format": "CSV",
        "dct:title": "Lokalizacja pojazdÃ³w komunikacji miejskiej na trasie"
      },
      {
        "@id": "https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442",
        "@type": "dcat:Dataset",
        "dcat:distribution": {
          "@id": datasetDistributionId
        },
        "dcat:keyword": [
          "komunikacja miejska",
          "autobusy",
          "tramwaje"
        ],
        "dct:description": "BieÅ¼Ä…ce poÅ‚oÅ¼enie pojazdÃ³w komunikacji miejskiej we WrocÅ‚awiu.\r\n\r\nUwaga: \r\nInformacja zwarta w kolumnie Brygada to zÅ‚Ä…czenie informacji Nr linii+ Nr brygady.\r\nPowiÄ…zanie tych danych z danymi RozkÅ‚ad jazdy transportu publicznego jest moÅ¼liwe poprzez pobranie dwÃ³ch ostatnich cyfr pola Brygada i porÃ³wnanie ich z danymi o brygadzie w pliku GTFS.",
        "dct:identifier": "93f26958-c0f3-4b27-a153-619e26080442",
        "dct:issued": {
          "@type": "xsd:dateTime",
          "@value": "2018-01-03T13:37:05.810996"
        },
        "dct:modified": {
          "@type": "xsd:dateTime",
          "@value": "2020-10-08T18:07:27.266670"
        },
        "dct:publisher": {
          "@id": "https://www.wroclaw.pl/open-data/organization/9f8bacb8-0463-42ba-b27f-6d4b308a6080"
        },
        "dct:title": "Lokalizacja pojazdÃ³w komunikacji miejskiej na trasie"
      }
    ]
  };
}
// tslint:enable: quotemark

/* ============= */
/* === Tests === */
/* ============= */

describe('getResourceId', () => {

  it('should get id from: @graph -> dcat:Distribution -> @id', async () => {
    const distributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;
    const distributionAccessURL = '';
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const now = new Date('2020-01-01 10:01:00');
    const provider = new MPKVehicleLocationProvider();
    const result = await provider.getResourceId(now);

    expect(result).toEqual(resourceId);
  });

  it('should get id from: @graph -> dcat:Distribution -> dcat:accessURL -> @id', async () => {
    const distributionId = '';
    const distributionAccessURL = `https://www.wroclaw.pl/open-data/datastore/dump/${resourceId}`;
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const now = new Date('2020-01-01 10:01:00');
    const provider = new MPKVehicleLocationProvider();
    const result = await provider.getResourceId(now);

    expect(result).toEqual(resourceId);
  });

  it('should get id from: @graph -> dcat:Dataset -> dcat:Distribution -> @id', async () => {
    const distributionId = '';
    const distributionAccessURL = '';
    const datasetDistributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const now = new Date('2020-01-01 10:01:00');
    const provider = new MPKVehicleLocationProvider();
    const result = await provider.getResourceId(now);

    expect(result).toEqual(resourceId);
  });

  it('should get id from cache', async () => {
    const distributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;
    const distributionAccessURL = '';
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const provider = new MPKVehicleLocationProvider();

    const cacheDate = new Date('2020-01-01 10:00:00');
    const networkResourceId = await provider.getResourceId(cacheDate);
    expect(networkResourceId).toEqual(resourceId);

    // nock will fake only the 1st response, so if we hit network then test will fail
    const beforeCacheExpireMilliseconds = cacheDate.getTime() + ResourceIdRefresh.cacheDuration - 5;
    const beforeCacheExpire = new Date(beforeCacheExpireMilliseconds);
    const cachedResourceId = await provider.getResourceId(beforeCacheExpire);
    expect(cachedResourceId).toEqual(resourceId);
  });

  it('should get id again if cache expired', async () => {
    const distributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;
    const distributionAccessURL = '';
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const provider = new MPKVehicleLocationProvider();

    const cacheDate = new Date('2020-01-01 10:00:00');
    const networkResourceId = await provider.getResourceId(cacheDate);
    expect(networkResourceId).toEqual(resourceId);

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const cacheExpireMilliseconds = cacheDate.getTime() + ResourceIdRefresh.cacheDuration + 5;
    const cacheExpire = new Date(cacheExpireMilliseconds);
    const networkResourceId2 = await provider.getResourceId(cacheExpire);
    expect(networkResourceId2).toEqual(resourceId);
  });

  it('should handle node error', async () => {
    intercept()
      .replyWithError('Some error...');

    expect.assertions(1);
    try {
      const now = new Date('2020-01-01 10:01:00');
      const provider = new MPKVehicleLocationProvider();
      await provider.getResourceId(now);
    } catch (e) {
      expect(e.message).toMatch('Some error...');
    }
  });

  it('should handle 404', async () => {
    intercept()
      .reply(404, {});

    expect.assertions(1);
    try {
      const now = new Date('2020-01-01 10:01:00');
      const provider = new MPKVehicleLocationProvider();
      await provider.getResourceId(now);
    } catch (e) {
      expect(e.message).toMatch('Failed to download resource description: Error: Request failed with status code 404');
    }
  });

  it('should use hard-coded value on handle json error', async () => {
    intercept()
      .reply(200, 'invalid json');

    try {
      const now = new Date('2020-01-01 10:01:00');
      const provider = new MPKVehicleLocationProvider();
      await provider.getResourceId(now);
    } catch (e) {
      expect(e.message).toMatch('17308285-3977-42f7-81b7-fdd168c210a2');
    }
  });
});
