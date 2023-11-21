export function isInDepot(lat: number, lng: number): boolean {
  return isInBorekDepot(lat, lng)
    || isInMichalczewskiDepot(lat, lng)
    || isInGajDepot(lat, lng)
    || isInOlbinDepot(lat, lng)
    || isInObornickaDepot(lat, lng);
}

export function isInBorekDepot(lat: number, lng: number): boolean {
  return (51.0778 <= lat && lat <= 51.0800)
    && (17.0025 <= lng && lng <= 17.00775);
}

export function isInMichalczewskiDepot(lat: number, lng: number): boolean {
  return (51.07565 <= lat && lat <= 51.07759)
    && (17.0688 <= lng && lng <= 17.0725);
}

export function isInGajDepot(lat: number, lng: number): boolean {
  return (51.08715 <= lat && lat <= 51.08889)
    && (17.02788 <= lng && lng <= 17.02967);
}

export function isInOlbinDepot(lat: number, lng: number): boolean {
  // Bottom:
  // - left  51.12336
  // - right 51.12408
  // We will go with average: 51.12372
  return (51.12372 <= lat && lat <= 51.1257)
    && (17.0385 <= lng && lng <= 17.0426);
}

export function isInObornickaDepot(lat: number, lng: number): boolean {
  return (51.1459 <= lat && lat <= 51.1502)
    && (17.0200 <= lng && lng <= 17.0256);
}
