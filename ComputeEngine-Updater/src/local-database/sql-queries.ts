import { join } from 'path';

import { Day } from '../models';
import { Query } from './LocalDatabase';

export function dropTable(tableName: string): Query {
  return {
    sql: `drop table if exists ${tableName};`,
    params: undefined,
  };
}

export const getAllStops: Query = {
  sql: `
select
  Code as code
, Name as name
, Lat  as lat
, Lon  as lon
from Stops`,
  params: undefined,
};

export function getStopArrivals(stopCode: string, day: Day, time: number): Query {
  const columnNames = getStopArrivalsColumnNames(day);
  return {
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
}

type StopArrivalsColumnNames = { today: string, tomorrow: string };

function getStopArrivalsColumnNames(day: Day): StopArrivalsColumnNames {
  switch (day) {
    case Day.Monday:    return { today: 'Monday',    tomorrow: 'Tuesday'   };
    case Day.Tuesday:   return { today: 'Tuesday',   tomorrow: 'Wednesday' };
    case Day.Wednesday: return { today: 'Wednesday', tomorrow: 'Thursday'  };
    case Day.Thursday:  return { today: 'Thursday',  tomorrow: 'Friday'    };
    case Day.Friday:    return { today: 'Friday',    tomorrow: 'Saturday'  };
    case Day.Saturday:  return { today: 'Saturday',  tomorrow: 'Sunday'    };
    case Day.Sunday:    return { today: 'Sunday',    tomorrow: 'Monday'    };
  }
}

export const getAllLines: Query = {
  sql: `
select
  Name    as name
, Type    as type
, Subtype as subtype
from Lines`,
  params: undefined,
};

export function getShapePointsByLineName(lineName: string): Query {
  return {
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
}

export const createMpkTablesScriptPath = './sql/mpk-create-schema.sql';
export const fillMpkTablesScriptPath = './sql/mpk-process-gtfs.sql';
