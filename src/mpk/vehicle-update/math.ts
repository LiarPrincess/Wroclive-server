/**
 * Radian to degree conversion
 */
export function radToDeg(rad: number): number {
  return (rad * (180.0 / Math.PI)) % 360.0;
}

/**
 * Degree to radian conversion
 */
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180.0);
}

/**
 * Returns the distance (in meters), between two LatLngs.
 * You can optionally specify a custom radius. The radius defaults to the radius of the Earth.
 * Source: google.maps.geometry.spherical.computeDistanceBetween(loc1, loc2, radius)
 */
export function calculateDistance(fromLat: number,
                                  fromLng: number,
                                  toLat: number,
                                  toLng: number,
                                  earthRadius?: number): number {
  const radius = earthRadius || 6378137;
  const c = degToRad(fromLat);
  const a = degToRad(fromLng);
  const d = degToRad(toLat);
  const b = degToRad(toLng);

  return 2 * radius * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((c - d) / 2), 2) +
      Math.cos(c) * Math.cos(d) *
      Math.pow(Math.sin((a - b) / 2), 2)
    )
  );
}

/**
 * Normalize angle within [-180,180) range.
 * Source google.maps.Jb (may change)
 */
function norm(angle: number, min: number, max: number): number {
  max -= min;
  return ((angle - min) % max + max) % max + min;
}

/**
 * Returns the heading from one LatLng to another LatLng.
 * Headings are expressed in degrees clockwise from North within the range [-180,180).
 * Source: google.maps.geometry.spherical.computeHeading(loc1, loc2)
 */
export function calculateHeading(fromLat: number,
                                 fromLng: number,
                                 toLat: number,
                                 toLng: number): number {
  const c = degToRad(fromLat);
  const d = degToRad(fromLng);
  const a = degToRad(toLat);
  const b = degToRad(toLng) - d;

  return norm(radToDeg(
    Math.atan2(
      Math.sin(b) * Math.cos(a),
      Math.cos(c) * Math.sin(a) - Math.sin(c) * Math.cos(a) * Math.cos(b)
    )
  ), -180, 180);
}
