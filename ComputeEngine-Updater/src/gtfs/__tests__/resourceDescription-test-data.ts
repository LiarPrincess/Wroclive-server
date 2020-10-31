const context = `
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
}
`;


export const standard = `
{
  ${context},
  "@graph": [
    {
      "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip",
      "@type": "dcat:Distribution",
      "dcat:accessURL": {
        "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
      },
      "dct:format": "ZIP",
      "dct:title": "OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
    },
    {
      "@id": "https://www.wroclaw.pl/open-data/organization/1efc0216-2c0d-45ec-8525-9e78e629ccbd",
      "@type": "foaf:Organization",
      "foaf:name": "UM - WydziaÅ‚ Transportu"
    },
    {
      "@id": "https://www.wroclaw.pl/open-data/dataset/ad52e8db-fc11-4cf0-9b45-3bf4f682c713",
      "@type": "dcat:Dataset",
      "dcat:distribution": {
        "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
      },
      "dcat:keyword": [
        "transport",
        "rozkÅ‚ad jazdy",
        "przystanki",
        "MPK",
        "autobusy",
        "komunikacja miejska",
        "tramwaje"
      ],
      "dct:description": "Aktualny rozkÅ‚ad jazdy transportu publicznego we WrocÅ‚awiu - linie autobusowe i tramwajowe.\\r\\n\\r\\nRozkÅ‚ady jazdy transportu publicznego publikowane sÄ… w formacie GTFS, dokumentacja dostÄ™pna pod adresem https://developers.google.com/transit/gtfs/reference",
      "dct:identifier": "ad52e8db-fc11-4cf0-9b45-3bf4f682c713",
      "dct:issued": {
        "@type": "xsd:dateTime",
        "@value": "2019-06-28T07:35:20.197559"
      },
      "dct:modified": {
        "@type": "xsd:dateTime",
        "@value": "2020-10-31T11:19:49.701389"
      },
      "dct:publisher": {
        "@id": "https://www.wroclaw.pl/open-data/organization/1efc0216-2c0d-45ec-8525-9e78e629ccbd"
      },
      "dct:title": "RozkÅ‚ad jazdy transportu publicznego"
    }
  ]
}
`;

export const multipleDatasetDistributions = `
{
  ${context},
  "@graph": [
    {
      "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip",
      "@type": "dcat:Distribution",
      "dcat:accessURL": {
        "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
      },
      "dct:format": "ZIP",
      "dct:title": "OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
    },
    {
      "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/AAOtwartyWroclaw_rozklad_jazdy_GTFS.zip",
      "@type": "dcat:Distribution",
      "dcat:accessURL": {
        "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/AAOtwartyWroclaw_rozklad_jazdy_GTFS.zip"
      },
      "dct:format": "ZIP",
      "dct:title": "AAOtwartyWroclaw_rozklad_jazdy_GTFS.zip"
    },
    {
      "@id": "https://www.wroclaw.pl/open-data/organization/1efc0216-2c0d-45ec-8525-9e78e629ccbd",
      "@type": "foaf:Organization",
      "foaf:name": "UM - WydziaÅ‚ Transportu"
    },
    {
      "@id": "https://www.wroclaw.pl/open-data/dataset/ad52e8db-fc11-4cf0-9b45-3bf4f682c713",
      "@type": "dcat:Dataset",
      "dcat:distribution": [
        {
          "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/AAOtwartyWroclaw_rozklad_jazdy_GTFS.zip"
        },
        {
          "@id": "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
        }
      ],
      "dcat:keyword": [
        "transport",
        "rozkÅ‚ad jazdy",
        "przystanki",
        "MPK",
        "autobusy",
        "komunikacja miejska",
        "tramwaje"
      ],
      "dct:description": "Aktualny rozkÅ‚ad jazdy transportu publicznego we WrocÅ‚awiu - linie autobusowe i tramwajowe.\\r\\n\\r\\nRozkÅ‚ady jazdy transportu publicznego publikowane sÄ… w formacie GTFS, dokumentacja dostÄ™pna pod adresem https://developers.google.com/transit/gtfs/reference",
      "dct:identifier": "ad52e8db-fc11-4cf0-9b45-3bf4f682c713",
      "dct:issued": {
        "@type": "xsd:dateTime",
        "@value": "2019-06-28T07:35:20.197559"
      },
      "dct:modified": {
        "@type": "xsd:dateTime",
        "@value": "2020-10-31T11:19:49.701389"
      },
      "dct:publisher": {
        "@id": "https://www.wroclaw.pl/open-data/organization/1efc0216-2c0d-45ec-8525-9e78e629ccbd"
      },
      "dct:title": "RozkÅ‚ad jazdy transportu publicznego"
    }
  ]
}
`;
