import * as cheerio from 'cheerio';
import { default as axios } from 'axios';

import { Line } from '../local-database';
import { createLineFromName } from './createLineFromName';

export async function getAvailableLines(): Promise<Line[]> {
  const url = 'https://www.wroclaw.pl/rozklady-jazdy';
  const response = await axios.get(url);

  const html = response.data as string;
  return getAvailableLinesFromHtml(html);
}

export function getAvailableLinesFromHtml(html: string): Line[] {
  const result: Line[] = [];

  const $ = cheerio.load(html);
  const lineNodes = $('.table-schedule a');

  lineNodes.each((index, node) => {
    const href: string | undefined = node.attribs.href;
    const isLineHref = href?.startsWith('/linia') || false;

    if (isLineHref) {
      const lineName = $(node).text();

      // We do not support '9XX' lines
      if (lineName.length == 3 && lineName[0] == '9') {
        return;
      }

      const line = createLineFromName(lineName);
      result.push(line);
    }
  });

  return result;
}
