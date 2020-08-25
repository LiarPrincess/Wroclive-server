import { default as axios, AxiosRequestConfig } from 'axios';
import { createWriteStream } from 'fs';

import { Logger } from '../util';

export async function downloadGTFS(path: string, logger: Logger): Promise<void> {
  logger.info('Downloading GTFS file');

  let resource: ResourceDescription;
  try {
    const url = 'https://www.wroclaw.pl/open-data/dataset/rozkladjazdytransportupublicznegoplik_data.jsonld';
    const config: AxiosRequestConfig = { };

    const response = await axios.get(url, config);
    resource = parseResourceDescription(response.data);
  } catch (error) {
    if (error.statusCode) {
      throw new Error(`Failed to download GTFS resource description: ${error.statusCode}.`);
    }

    throw error;
  }

  logger.info(`Found: '${resource.title}' modified at '${resource.modified}' (uri: '${resource.url}').`);

  try {
    await downloadStream(resource.url, path);
  } catch (error) {
    if (error.statusCode) {
      throw new Error(`Failed to download GTFS file: ${error.statusCode}.`);
    }

    throw error;
  }
}

/* -------------------- */
/* Resource description */
/* -------------------- */

interface ResourceDescription {
  title: string;
  url: string;
  issued: string;
  modified: string;
}

function parseResourceDescription(description: any): ResourceDescription {
  const graph: any[] = description['@graph'];
  const dataset: any = graph.find(node => node['@type'] === 'dcat:Dataset');

  return {
    title: dataset['dct:title'],
    url: dataset['dcat:distribution']['@id'],
    issued: dataset['dct:issued']['@value'],
    modified: dataset['dct:modified']['@value'],
  };
}

/* -------- */
/* Download */
/* -------- */

async function downloadStream(url: string, path: string): Promise<void> {
  const stream = createWriteStream(path);
  const response = await axios.get(url, { responseType: 'stream' });

  response.data.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
