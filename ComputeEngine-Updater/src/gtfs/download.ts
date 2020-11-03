import { join } from 'path';
import { promises as fs, createWriteStream } from 'fs';
import { default as axios, AxiosRequestConfig } from 'axios';

import { Logger } from '../util';
import { ResourceDescription, DcatDistribution } from './ResourceDescription';

/**
 * Download latest GTFS file and return its path.
 */
export async function downloadGTFS(outputDir: string, logger: Logger): Promise<string> {
  logger.info('Downloading GTFS file');

  let resource: ParsedResourceDescription;
  try {
    const url = 'https://www.wroclaw.pl/open-data/dataset/rozkladjazdytransportupublicznegoplik_data.jsonld';
    const config: AxiosRequestConfig = { };

    const response = await axios.get(url, config);
    const data = response.data as ResourceDescription;
    resource = parseResourceDescription(data, logger);
  } catch (error) {
    if (error.statusCode) {
      throw new Error(`Failed to download GTFS resource description: ${error.statusCode}.`);
    }

    throw error;
  }

  const title = resource.title || 'UNDEFINED_TITLE';
  const modified = resource.modified || 'UNDEFINED_DATE';
  logger.info(`Found: '${title}' modified at '${modified}'`);

  if (!resource.fileUris.length) {
    throw new Error('Parsed resource description does not contain any GTFS file urls.');
  }

  const localFiles = await downloadGTFSFiles(outputDir, resource, logger);
  const file = await selectBestFile(localFiles);
  logger.info(`Selecting: ${file}`);

  return file;
}

/* -------------------- */
/* Resource description */
/* -------------------- */

export interface ParsedResourceDescription {
  title?: string;
  modified?: string;
  fileUris: string[];
}

export function parseResourceDescription(description: ResourceDescription, logger: Logger): ParsedResourceDescription {
  const graph = description['@graph'];

  // If we write this as 'graph && Array.isArray(graph)' then TypeScript
  // will think that 'graph' is still 'undefined'.
  if (!graph || !Array.isArray(graph)) {
    throw new Error(`Unable to parse resource description: '@graph' is not an array`);
  }

  let title: string | undefined;
  let modified: string | undefined;
  const fileUris = new Set<string>();

  for (const node of graph) {
    switch (node['@type']) {
      case 'dcat:Distribution':
        const url = node['dcat:accessURL']?.['@id'];
        if (url && isValidGTFSUri(url)) {
          fileUris.add(url);
        }

        break;

      case 'foaf:Organization':
        // Nothing to do here.
        break;

      case 'dcat:Dataset':
        title = title || node['dct:title'];
        modified = modified || node['dct:modified']?.['@value'];

        function parseDistribution(distr: DcatDistribution) {
          const url = distr['@id'];
          if (url && isValidGTFSUri(url)) {
            fileUris.add(url);
          }
        }

        const distribution = node['dcat:distribution'];
        if (Array.isArray(distribution)) {
          for (const d of distribution) {
            parseDistribution(d);
          }
        } else if (distribution) {
          parseDistribution(distribution);
        }

        break;

      default:
        logger.error(`Unknown resource description node type: '${node['@type']}'`);
        break;
    }
  }

  return { title, modified, fileUris: Array.from(fileUris) };
}

function isValidGTFSUri(url: string): boolean {
  return url.startsWith('http') && url.endsWith('.zip');
}

/* -------- */
/* Download */
/* -------- */

/**
 * Download all of the resource files and return their paths.
 */
async function downloadGTFSFiles(
  outputDir: string,
  resource: ParsedResourceDescription,
  logger: Logger
): Promise<string[]> {
  const result: string[] = [];

  for (let index = 0; index < resource.fileUris.length; index++) {
    const url = resource.fileUris[index];
    try {
      const filename = `gtfs_tmp_${index}.zip`;
      logger.info(`Downloading: ${url} -> ${filename}`);

      const path = join(outputDir, filename);
      await downloadStream(path, url);
      result.push(path);
    } catch (error) {
      logger.info(`Failed to download GTFS file: ${url}.`);
    }
  }

  if (!result.length) {
    throw new Error('Failed to download all of the GTFS files');
  }

  return result;
}

async function downloadStream(path: string, url: string): Promise<void> {
  const stream = createWriteStream(path);
  const response = await axios.get(url, { responseType: 'stream' });

  response.data.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

/* --------- */
/* Best file */
/* --------- */

async function selectBestFile(localFiles: string[]): Promise<string> {
  // If we have only 1 file -> it is trivially 'the best'.
  // This is the most common scenario.
  if (localFiles.length == 1) {
    return localFiles[0];
  }

  // If we have multiple files -> biggest is best.
  let result: string | undefined;
  let biggestSize = -1;

  for (const file of localFiles) {
    const stat = await fs.stat(file);
    const size = stat.size;

    if (size > biggestSize) {
      result = file;
      biggestSize = size;
    }
  }

  if (!result) {
    throw new Error('No local GTFS files found');
  }

  return result;
}
