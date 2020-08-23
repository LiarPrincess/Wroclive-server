# Show stops on map
_base_/stops
- Code
- Name
- Lat
- Lng

# User taps stop -> show stop departures for the next 1h
_base_/stops/schedule/:code?day=mon&time=1300
TODO: what to do with time? client or server?
- Time
- Line
- Headsign

Add warning
  Information come from mpk schedule and may change according to current traffic.

# [Done] User opens 'Search' card -> list all available lines
_base_/lines
- Name
- Type
- Subtype

# [Done] Show vehicles on map
_base_/vehicles?lines=1;4;A;C
- Id
- LineName
- LineType
- LineSubType
- Lat
- Lng
- Angle

# User taps on vehicle ->
_base_/vehicles/:id
- Line name
- Line type
- Line subtype (LineType2)
- Lat
- Lng
- Headsign?
- Vehicle_low_floor?
- Shape
+ next stops

# Bikes
Station name
Bikes
Stands
