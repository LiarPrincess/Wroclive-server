/**
 * Split lowercased 'input' according to 'delimiter'.
 */
export function splitLowerCase(input: string, delimiter: string): Set<string> {
  const result = new Set<string>();

  function add(value: string) {
    const trimmed = value.trim();
    if (trimmed) {
      result.add(trimmed);
    }
  }

  let current = '';

  for (const char of input) {
    if (char == delimiter) {
      add(current);
      current = '';
    } else {
      current += char.toLowerCase();
    }
  }

  add(current);
  return result;
}
