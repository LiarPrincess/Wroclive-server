import { join } from 'path';

import { SQLiteDatabase, Query } from './SQLiteDatabase';
import { Logger, getRootDir } from '../util';

/* ============= */
/* === Types === */
/* ============= */

export interface Line {
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
  readonly stopArrivalTimes?: { min: number, max: number };
}

export interface LineShapePoint {
  readonly tripId: string;
  readonly isTripMain: string; // TODO: integer?
  readonly sequence: string; // TODO: integer?
  readonly lat: number;
  readonly lon: number;
}

export interface Stop {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export enum Day {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

type StopArrivalsColumnNames = {
  today: string,
  tomorrow: string
};

export interface StopArrival {
  readonly line: string;
  readonly type: string;
  readonly subtype: string;
  readonly headsign: string;
  readonly time: number;
}

/* ====================== */
/* === Local database === */
/* ====================== */

export class LocalDatabase {

  private db: SQLiteDatabase;

  constructor(path: string, logger: Logger) {
    this.db = new SQLiteDatabase(path, logger);
  }

  /* ============== */
  /* === Schema === */
  /* ============== */

  async dropTable(tableName: string): Promise<void> {
    const query: Query = {
      sql: `drop table if exists ${tableName};`,
      params: undefined
    };

    await this.db.exec(query);
  }

  async executeMpkCreateSchemaScript(): Promise<void> {
    const rootDir = await getRootDir();
    const scriptPath = join(rootDir, 'sql/mpk-create-schema.sql');
    await this.db.execFile(scriptPath);
  }

  async executeMpkProcessGTFSScript(): Promise<void> {
    const rootDir = await getRootDir();
    const scriptPath = join(rootDir, 'sql/mpk-process-gtfs.sql');
    await this.db.execFile(scriptPath);
  }

  /* ============= */
  /* === Lines === */
  /* ============= */

  async getAllLines(): Promise<Line[]> {
    const query: Query = {
      sql: `
  select
  line.Name       as name
, line.Type       as type
, line.Subtype    as subtype
, stopArrival.min as minStopArrivalTime
, stopArrival.max as maxStopArrivalTime
from Lines line
left join (
  select
    Line as line
  , min(ArrivalTime) as min
  , max(ArrivalTime) as max
  from StopArrivals
  group by Line
) stopArrival on stopArrival.line = line.name`,
      params: undefined
    };

    const rows = await this.db.all(query);
    const lines: Line[] = rows.map(row => {
      const stopArrivalTimes = (row.minStopArrivalTime && row.maxStopArrivalTime) ? {
        min: row.minStopArrivalTime,
        max: row.maxStopArrivalTime
      } : undefined;

      return {
        name: row.name,
        type: row.type,
        subtype: row.subtype,
        stopArrivalTimes
      };
    });

    return lines;
  }

  async insertLinesSkippingDuplicates(lines: Line[]) {
    for (const line of lines) {
      const query: Query = {
        sql: `
insert into Lines (Name, Type, Subtype)
select ?, ?, ?
where not exists(
  select 1
  from Lines
  where Name = ?
);
`,
        params: [line.name, line.type, line.subtype, line.name]
      };

      await this.db.exec(query);
    }
  }

  async getShapePointsByLineName(lineName: string): Promise<LineShapePoint[]> {
    const query: Query = {
      sql: `
select
  TripId     as tripId
, IsTripMain as isTripMain
, Sequence   as sequence
, Lat        as lat
, Lon        as lon
from Shapes
where Line = ?`,
      params: lineName
    };

    const rows = await this.db.all(query);
    return rows as LineShapePoint[];
  }

  /* ============= */
  /* === Stops === */
  /* ============= */

  async getAllStops(): Promise<Stop[]> {
    const query: Query = {
      sql: `
select
  Code as code
, Name as name
, Lat  as lat
, Lon  as lon
from Stops`,
      params: undefined
    };

    const rows = await this.db.all(query);
    return rows as Stop[];
  }

  async getStopArrivals(stopCode: string, day: Day, time: number): Promise<StopArrival[]> {
    const columnNames = this.getStopArrivalsColumnNames(day);
    const query: Query = {
      sql: `
with cte_Arrivals
as
(
  select Stop, Line, LineType, LineSubtype, Headsign, ArrivalTime
  from StopArrivals
  where ${columnNames.today} = 1

  union all

  select Stop, Line, LineType, LineSubtype, Headsign, ArrivalTime + 2400
  from StopArrivals
  where ${columnNames.tomorrow} = 1
)
select
  Line        as line
, LineType    as type
, LineSubtype as subtype
, Headsign    as headsign
, ArrivalTime as time
from cte_Arrivals
where Stop = ?
  and ArrivalTime >= ?
order by ArrivalTime
limit 15`,
      params: [stopCode, Math.trunc(time)],
    };

    const rows = await this.db.all(query);
    return rows as StopArrival[];
  }

  private getStopArrivalsColumnNames(day: Day): StopArrivalsColumnNames {
    switch (day) {
      case Day.Monday: return { today: 'Monday', tomorrow: 'Tuesday' };
      case Day.Tuesday: return { today: 'Tuesday', tomorrow: 'Wednesday' };
      case Day.Wednesday: return { today: 'Wednesday', tomorrow: 'Thursday' };
      case Day.Thursday: return { today: 'Thursday', tomorrow: 'Friday' };
      case Day.Friday: return { today: 'Friday', tomorrow: 'Saturday' };
      case Day.Saturday: return { today: 'Saturday', tomorrow: 'Sunday' };
      case Day.Sunday: return { today: 'Sunday', tomorrow: 'Monday' };
    }
  }

  /* ============= */
  /* === Other === */
  /* ============= */

  async importCsv(csvPath: string, table: string): Promise<void> {
    await this.db.importCsv(csvPath, table);
  }

  close(): Promise<void> {
    return this.db.close();
  }
}
