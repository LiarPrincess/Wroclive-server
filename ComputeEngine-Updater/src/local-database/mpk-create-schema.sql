-----------
-- Lines --
-----------

create table if not exists Lines (
  Name     text not null,
  Type     text not null,
  Subtype  text not null
);

-----------
-- Stops --
-----------

create table if not exists Stops (
  Code text not null,
  Name text not null,
  Lat  real not null,
  Lon  real not null
);

-------------------
-- Stop arrivals --
-------------------

create table if not exists StopArrivals (
  Stop        text not null,
  Line        text not null,
  LineType    text not null,
  LineSubtype text not null,
  Headsign    text not null,
  ArrivalTime integer not null,
  Sequence    integer not null,
  Monday      integer not null check (Monday    in (0, 1)),
  Tuesday     integer not null check (Tuesday   in (0, 1)),
  Wednesday   integer not null check (Wednesday in (0, 1)),
  Thursday    integer not null check (Thursday  in (0, 1)),
  Friday      integer not null check (Friday    in (0, 1)),
  Saturday    integer not null check (Saturday  in (0, 1)),
  Sunday      integer not null check (Sunday    in (0, 1))
);

create index if not exists StopArrivals_Stop
on StopArrivals (Stop, ArrivalTime)
;

------------
-- Shapes --
------------

create table if not exists Shapes (
  Line       text not null,
  TripId     text not null,
  IsMainTrip integer not null check (IsMainTrip in (0, 1)),
  Sequence   integer not null,
  Lat        real not null,
  Lon        real not null
);

create index if not exists Shapes_Line
on Shapes (Line)
;
