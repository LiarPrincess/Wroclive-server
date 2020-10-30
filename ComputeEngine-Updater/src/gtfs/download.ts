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
  const url = getGTFSUrlFromResourceDescriptionDataset(dataset);

  return {
    title: dataset['dct:title'],
    url,
    issued: dataset['dct:issued']['@value'],
    modified: dataset['dct:modified']['@value'],
  };
}

function getGTFSUrlFromResourceDescriptionDataset(dataset: any): string {
  const distribution = dataset['dcat:distribution'];

  // 'distribution' may be an array, or just a single resource.
  if (distribution.length) {
    // Try to find 'canonical' GTFS file.
    // Example of other possible urls: '/AAOtwartyWroclaw_rozklad_jazdy_GTFS.zip'.
    for (const dist of distribution) {
      const url = dist['@id'];
      if (url && url.includes('/OtwartyWroclaw_rozklad_jazdy_GTFS.zip')) {
        return url;
      }
    }

    // The 1st one is the correct one?
    const url = distribution[0]['@id'];
    if (url) {
      return url;
    }
  }

  return distribution['@id'];
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
