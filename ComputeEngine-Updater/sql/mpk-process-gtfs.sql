--------------------------------------------------------------------------------
--------------------------------- Helper views ---------------------------------
--------------------------------------------------------------------------------

---------------
-- gtfs_base --
---------------

drop view if exists gtfs_base;

create view if not exists gtfs_base
as
select
-- route
  route.route_id
, trim(route.route_short_name) as route_name
, case route.route_type
    when 0 then 'Tram'
    else 'Bus' end as route_type
, case routeType.route_type2_name
    when 'Normalna autobusowa'   then 'Regular'
    when 'Normalna tramwajowa'   then 'Regular'
    when 'Podmiejska autobusowa' then 'Suburban'
    when 'Pospieszna autobusowa' then 'Express'
    when 'Strefowa autobusowa'   then 'Zone'
    when 'Nocna autobusowa'      then 'Night'
    when 'Okresowa autobusowa'   then 'Temporary' -- Add to Client
    else 'Regular' end as route_subtype
-- agency
, agency.agency_id
, agency.agency_name
-- trip
, trip.trip_id
, trip.trip_headsign
, trip.direction_id
, trip.shape_id
-- calendar
, calendar.monday
, calendar.tuesday
, calendar.wednesday
, calendar.thursday
, calendar.friday
, calendar.saturday
, calendar.sunday
-- variant
, variant.is_main
from gtfs_agency              agency
inner join gtfs_routes        route     on route.agency_id = agency.agency_id
inner join gtfs_route_types   routeType on routeType.route_type2_id = route.route_type2_id
inner join gtfs_trips         trip      on trip.route_id = route.route_id
inner join gtfs_variants      variant   on variant.variant_id = trip.variant_id
inner join gtfs_calendar      calendar  on calendar.service_id = trip.service_id
where agency.agency_name in ('MPK Tramwaje', 'MPK Autobusy')
  and route.route_type in (0, 3)
;

------------------------
-- gtfs_stop_schedule --
------------------------

drop view if exists gtfs_stop_schedule;

create view if not exists gtfs_stop_schedule
as
select
  stop.stop_code
, stop.stop_name
, stop.stop_lat
, stop.stop_lon
, base.route_name
, base.route_type
, base.route_subtype
, base.trip_headsign
, stopTime.arrival_time
, stopTime.stop_sequence
, base.monday
, base.tuesday
, base.wednesday
, base.thursday
, base.friday
, base.saturday
, base.sunday
from gtfs_base             base
inner join gtfs_stop_times stopTime on stopTime.trip_id = base.trip_id
inner join gtfs_stops      stop     on stop.stop_id = stopTime.stop_id
;

--------------------------------------------------------------------------------
--------------------------------- Fill tables ----------------------------------
--------------------------------------------------------------------------------

-----------
-- Lines --
-----------

delete from Lines;

insert into Lines (Name, Type, Subtype)
select distinct
  route_name
, route_type
, route_subtype
from gtfs_base
order by route_type desc
,        route_name asc
;

-----------
-- Stops --
-----------

delete from Stops;

insert into Stops (Code, Name, Lat, Lon)
select distinct
  stop_code
, stop_name
, stop_lat
, stop_lon
from gtfs_stop_schedule
order by stop_code
;

-------------------
-- Stop arrivals --
-------------------

delete from StopArrivals;

-- insert into StopArrivals (Stop, Line, LineType, LineSubtype, Headsign, ArrivalTime, Sequence, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
-- select distinct
--   stop_code
-- , route_name
-- , route_type
-- , route_subtype
-- , trip_headsign
-- -- we store 8:40 as 840, because it is easier to use
-- , 100 * cast(substr(arrival_time, 1, 2) as integer)
--       + cast(substr(arrival_time, 4, 2) as integer) as ArrivalTime
-- , cast(stop_sequence as integer) as Sequence
-- , monday
-- , tuesday
-- , wednesday
-- , thursday
-- , friday
-- , saturday
-- , sunday
-- from gtfs_stop_schedule
-- order by stop_code, arrival_time
-- ;

------------
-- Shapes --
------------

delete from Shapes;

-- with cte_ShapesWithoutDuplicates
-- as
-- (
--   -- window functions (https://www.sqlite.org/windowfunctions.html)
--   -- are supported from 3.25.0 (2018-09-15), but I'm too lazy to upgrade
--   select
--     route_name
--   , shape_id
--   , is_main
--   , min(trip_id) as trip_id
--   from gtfs_base
--   group by route_name, is_main, shape_id
-- )
-- insert into Shapes (Line, TripId, IsMainTrip, Sequence, Lat, Lon)
-- select
--   cte.route_name
-- , cte.trip_id
-- , cte.is_main
-- , shape_pt_sequence
-- , shape_pt_lat
-- , shape_pt_lon
-- from cte_ShapesWithoutDuplicates cte
-- inner join gtfs_shapes           shape on shape.shape_id = cte.shape_id
-- order by cte.route_name, cte.is_main desc, cte.shape_id
-- ;
