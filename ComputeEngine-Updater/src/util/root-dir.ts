import { join, dirname, resolve } from 'path';
import { promises as fs } from 'fs';

let cached: string | undefined = undefined;

export async function getRootDir(): Promise<string> {
  if (cached) {
    return cached;
  }

  let currentDir = resolve(__dirname);
  while (currentDir != '/') {
    const filenames = await fs.readdir(currentDir);
    const isRoot = filenames.includes('package.json');

    if (isRoot) {
      cached = currentDir;
      return currentDir;
    }

    currentDir = dirname(currentDir);
  }

  const result = resolve(join(__dirname, '..', '..'));
  cached = result;
  return result;
}
