import { default as nock } from 'nock';

import { Api, ResourceIdRefreshInterval } from '../Api';

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

describe('OpenDataApi-getResourceId', () => {

  it('should get id from: @graph -> dcat:Distribution -> @id', async () => {
    const distributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;
    const distributionAccessURL = '';
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.getResourceId(now);

    expect(result.resourceId).toEqual(resourceId);
    expect(result.error).toBeUndefined();
  });

  it('should get id from: @graph -> dcat:Distribution -> dcat:accessURL -> @id', async () => {
    const distributionId = '';
    const distributionAccessURL = `https://www.wroclaw.pl/open-data/datastore/dump/${resourceId}`;
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.getResourceId(now);

    expect(result.resourceId).toEqual(resourceId);
    expect(result.error).toBeUndefined();
  });

  it('should get id from: @graph -> dcat:Dataset -> dcat:Distribution -> @id', async () => {
    const distributionId = '';
    const distributionAccessURL = '';
    const datasetDistributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.getResourceId(now);

    expect(result.resourceId).toEqual(resourceId);
    expect(result.error).toBeUndefined();
  });

  it('should get id from cache', async () => {
    const distributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;
    const distributionAccessURL = '';
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const api = new Api();

    const cacheDate = new Date('2020-01-01 10:00:00');
    const networkResult = await api.getResourceId(cacheDate);
    expect(networkResult.resourceId).toEqual(resourceId);
    expect(networkResult.error).toBeUndefined();

    // nock will fake only the 1st response, so if we hit network then test will fail
    const beforeCacheExpireMilliseconds = cacheDate.getTime() + ResourceIdRefreshInterval - 5;
    const beforeCacheExpire = new Date(beforeCacheExpireMilliseconds);
    const cachedResult = await api.getResourceId(beforeCacheExpire);
    expect(cachedResult.resourceId).toEqual(resourceId);
    expect(cachedResult.error).toBeUndefined();
  });

  it('should get id again if cache expired', async () => {
    const distributionId = `https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/${resourceId}`;
    const distributionAccessURL = '';
    const datasetDistributionId = '';

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const api = new Api();

    const cacheDate = new Date('2020-01-01 10:00:00');
    const networkResult0 = await api.getResourceId(cacheDate);
    expect(networkResult0.resourceId).toEqual(resourceId);
    expect(networkResult0.error).toBeUndefined();

    intercept()
      .reply(200, createResponse(distributionId, distributionAccessURL, datasetDistributionId));

    const cacheExpireMilliseconds = cacheDate.getTime() + ResourceIdRefreshInterval + 5;
    const cacheExpire = new Date(cacheExpireMilliseconds);
    const networkResult1 = await api.getResourceId(cacheExpire);
    expect(networkResult1.resourceId).toEqual(resourceId);
    expect(networkResult1.error).toBeUndefined();
  });

  it('should use hard-coded value on handle json error', async () => {
    intercept()
      .reply(200, 'invalid json'); // Well… valid, but not the one we are looking for.

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.getResourceId(now);

    expect(result.resourceId).toEqual('17308285-3977-42f7-81b7-fdd168c210a2');
    expect(result.error).toEqual({
      kind: 'Response without Id',
      message: 'Unable to get resource id from response',
      errorData: 'invalid json'
    });
  });

  it('should handle network error', async () => {
    intercept()
      .replyWithError('Some error...');

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.getResourceId(now);

    expect(result.resourceId).toEqual('17308285-3977-42f7-81b7-fdd168c210a2');
    expect(result.error?.kind).toEqual('Network error');
    expect(result.error?.message).toEqual('Unknown resource id request error.');
    expect(result.error?.errorData.message).toEqual('Some error...');
  });

  it('should handle 404', async () => {
    intercept()
      .reply(404, {});

    const now = new Date('2020-01-01 10:01:00');
    const api = new Api();
    const result = await api.getResourceId(now);

    expect(result.resourceId).toEqual('17308285-3977-42f7-81b7-fdd168c210a2');
    expect(result.error?.kind).toEqual('Network error');
    expect(result.error?.message).toEqual('Resource id response with status: 404.');
    expect(result.error?.errorData.message).toEqual('Request failed with status code 404');
  });
});
