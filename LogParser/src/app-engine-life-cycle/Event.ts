export type EventKind =
  'Create version' |
  'Starting app' |
  'Quitting on terminated signal';

export class Event {
  public constructor(
    public readonly id: string,
    public readonly kind: EventKind,
    public readonly date: Date
  ) { }
}
