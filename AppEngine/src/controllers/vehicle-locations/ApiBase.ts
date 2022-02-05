export class ApiBase {

  isNumber(o: any): boolean {
    return Number.isFinite(o);
  }

  isString(o: any): boolean {
    return typeof o === 'string' || o instanceof String;
  }

  parseDate(o: any): Date | undefined {
    const isString = this.isString(o);
    if (!isString) {
      return undefined;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    const millisecondsSince1970 = Date.parse(o);
    return Number.isNaN(millisecondsSince1970) ?
      undefined :
      new Date(millisecondsSince1970);
  }
}
