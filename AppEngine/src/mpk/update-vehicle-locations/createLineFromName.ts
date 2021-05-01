import { Line } from '../../controllers';

export function createLineFromName(name: string): Line {
  function createLine(type: string, subtype: string): Line {
    return { name, type, subtype };
  }

  // 'Bus - Regular' is most probable
  const defaultLineWhenNothingMatches = createLine('Bus', 'Regular');

  // Does it start with a number?
  const number = Number.parseInt(name);
  if (!Number.isNaN(number)) {
    // Examples: 4, 5, 31, 33, 70, 71
    if (number < 100) {
      return createLine('Tram', 'Regular');
    }

    // Examples: 126, 134, 143
    if (number < 200) {
      return createLine('Bus', 'Regular');
    }

    // Examples: 242, 251
    if (number < 300) {
      return createLine('Bus', 'Night');
    }

    // Examples: 319, 325
    if (number < 400) {
      return createLine('Bus', 'Regular');
    }

    // Examples: 602, 607, 609
    if (600 <= number && number < 700) {
      return createLine('Bus', 'Suburban');
    }

    // Examples: 701, 714
    if (700 <= number && number < 800) {
      return createLine('Bus', 'Temporary');
    }

    return defaultLineWhenNothingMatches;
  }

  // Now we know that 'name' start with letter

  // Special lines: E1, E2
  const isHoliday = (name.startsWith('e') || name.startsWith('E')) && name.length > 1;
  if (isHoliday) {
    return createLine('Tram', 'Regular');
  }

  // Examples: A, C, D, K, N
  if (name.length == 1) {
    return createLine('Bus', 'Express');
  }

  return defaultLineWhenNothingMatches;
}
