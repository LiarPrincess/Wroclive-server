import { splitLowerCase } from '../helpers';

describe('splitLowerCase', () => {

  it('splits with delimiter', async () => {
    const input = 'A;c;123;5';
    const result = splitLowerCase(input, ';');

    const expected = new Set(['a', 'c', '123', '5']);
    expect(result).toEqual(expected);
  });

  it('handles empty input', async () => {
    const input = '';
    const result = splitLowerCase(input, ';');

    const expected = new Set();
    expect(result).toEqual(expected);
  });

  it('handles empty group', async () => {
    const input = 'A;c;;123;5';
    const result = splitLowerCase(input, ';');

    const expected = new Set(['a', 'c', '123', '5']);
    expect(result).toEqual(expected);
  });

  it('handles prefix delimiter', async () => {
    const input = ';A;c;123;5';
    const result = splitLowerCase(input, ';');

    const expected = new Set(['a', 'c', '123', '5']);
    expect(result).toEqual(expected);
  });

  it('handles suffix delimiter', async () => {
    const input = 'A;c;123;5;';
    const result = splitLowerCase(input, ';');

    const expected = new Set(['a', 'c', '123', '5']);
    expect(result).toEqual(expected);
  });
});
