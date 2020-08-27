export interface Timestamped<T> {
  readonly timestamp: string;
  readonly data: T;
}
