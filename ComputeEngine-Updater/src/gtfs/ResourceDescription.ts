/**
 * https://www.wroclaw.pl/open-data/dataset/rozkladjazdytransportupublicznegoplik_data.jsonld
 */
export interface ResourceDescription {
  '@context'?: Context;
  '@graph'?: GraphNode[];
}

export interface Context {
  adms: string;
  dcat: string;
  dct: string;
  foaf: string;
  gsp: string;
  locn: string;
  owl: string;
  rdf: string;
  rdfs: string;
  schema: string;
  skos: string;
  time: string;
  vcard: string;
  xsd: string;
}

export type GraphNode = GraphDistributionNode | GraphOrganizationNode | GraphDatasetNode;

export interface GraphDistributionNode {
  '@id': string;
  '@type': 'dcat:Distribution';
  'dcat:accessURL'?: DcatAccessURL;
  'dct:format'?: string;
  'dct:title'?: string;
}

export interface DcatAccessURL {
  '@id'?: string;
}

export interface GraphOrganizationNode {
  '@id': string;
  '@type': 'foaf:Organization';
  'foaf:name'?: string;
}

export interface GraphDatasetNode {
  '@id': string;
  '@type': 'dcat:Dataset';
  'dcat:distribution'?: DcatDistribution | DcatDistribution[];
  'dcat:keyword'?: string[];
  'dct:description'?: string;
  'dct:identifier'?: string;
  'dct:issued'?: DctIssued;
  'dct:modified'?: DctModified;
  'dct:publisher'?: DctPublisher;
  'dct:title'?: string;
}

export interface DcatDistribution {
  '@id'?: string;
}

export interface DctIssued {
  '@type'?: string;
  '@value'?: string;
}

export interface DctModified {
  '@type'?: string;
  '@value'?: string;
}

export interface DctPublisher {
  '@id'?: string;
}
