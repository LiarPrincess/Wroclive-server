import { ApiType, ApiResult } from "./ApiType";

export class ApiMock implements ApiType {
  public results: ApiResult[] = [];
  private resultIndex = 0;

  getVehicleLocations(): Promise<ApiResult> {
    if (this.resultIndex < this.results.length) {
      const result = this.results[this.resultIndex];
      this.resultIndex++;
      return Promise.resolve(result);
    }

    throw new Error("Forgot to define api result?");
  }
}
