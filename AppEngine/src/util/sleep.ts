export async function sleep(milliseconds: number) {
  return new Promise(fulfill => setTimeout(fulfill, milliseconds));
}
