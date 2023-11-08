import { LineCollection } from '../../controllers/lines';
import { StopCollection } from '../../controllers/stops';
import { LineLocationCollection } from '../../controllers/vehicle-locations';
import { NotificationCollection } from '../../controllers/notifications';

interface CacheEntry {
  readonly timestamp: string;
  readonly json: string;
}

/**
 * A lot of our data is static (it does not change very often), we will cache
 * stringified responses to avoid re-serialization.
 */
export class JSONCache {

  /* ============= */
  /* === Lines === */
  /* ============= */

  private cachedLines?: CacheEntry = undefined;

  public getLines(lines: LineCollection): string {
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

  public getStops(stops: StopCollection): string {
    if (this.cachedStops && this.cachedStops.timestamp == stops.timestamp) {
      return this.cachedStops.json;
    }

    const json = JSON.stringify(stops);
    this.cachedStops = { timestamp: stops.timestamp, json: json };
    return json;
  }
}
