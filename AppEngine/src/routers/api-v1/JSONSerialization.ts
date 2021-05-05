import {
  LineCollection,
  StopCollection,
  LineLocationsCollection
} from '../../controllers';

interface CacheEntry {
  readonly timestamp: string;
  readonly json: string;
}

/**
 * A lot of our data is static (it does not change very often), we will cache
 * stringified responses to avoid re-serialization.
 */
export class JSONSerialization {

  /* ============= */
  /* === Lines === */
  /* ============= */

  private cachedLines?: CacheEntry = undefined;

  stringifyLines(lines: LineCollection): string {
    if (this.cachedLines && this.cachedLines.timestamp == lines.timestamp) {
      return this.cachedLines.json;
    }

    // 'Line' may have more properties than we should return, so first we have to narrow it.
    const data = {
      timestamp: lines.timestamp,
      data: lines.data.map(l => ({ name: l.name, type: l.type, subtype: l.subtype }))
    };

    const json = JSON.stringify(data);
    this.cachedLines = { timestamp: lines.timestamp, json: json };
    return json;
  }

  /* ============= */
  /* === Stops === */
  /* ============= */

  private cachedStops?: CacheEntry = undefined;

  stringifyStops(stops: StopCollection): string {
    if (this.cachedStops && this.cachedStops.timestamp == stops.timestamp) {
      return this.cachedStops.json;
    }

    const json = JSON.stringify(stops);
    this.cachedStops = { timestamp: stops.timestamp, json: json };
    return json;
  }

  /* ========================= */
  /* === Vehicle locations === */
  /* ========================= */

  stringifyVehicleLocations(locations: LineLocationsCollection): string {
    // Nothing to cache here
    return JSON.stringify(locations);
  }
}
