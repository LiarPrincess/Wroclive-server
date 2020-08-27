// Sources:
// https://cloud.google.com/functions/docs/writing/background#function_parameters
// https://googleapis.dev/nodejs/compute/latest/Compute.html#getVMs

/**
 * The data object for the event. Its type depends on the event.
 *
 * @link https://cloud.google.com/functions/docs/writing/background#function_parameters
 */
export interface Message { }

/**
 * The context object for the event.
 *
 * @link https://cloud.google.com/functions/docs/writing/background#function_parameters
 */
export interface Context {
  /**
   * A unique ID for the event. For example: "70172329041928".
   */
  eventId?: string;
  /**
   * The date/time this event was created. For example: "2018-04-09T07:56:12.975Z"
   * This will be formatted as ISO 8601.
   */
  timestamp?: string;
  /**
   * The type of the event. For example: "google.pubsub.topic.publish".
   */
  eventType?: string;
  /**
   * The resource that emitted the event.
   */
  resource?: string;
}

export interface VM {
  id: string;
  name: string;
  url: string;
  baseUrl: string;
  zone: VMZone;
  metadata: VMMetadata;

  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface VMMetadata {
  id: string;
  name: string;
  description: string;
  zone: string;
  status: VMStatus;
  // compute#instance
  kind: string;
  // Some very long url
  machineType: string;
  creationTimestamp: string;
}

export enum VMStatus {
  Provisioning = 'PROVISIONING',
  Staging = 'STAGING',
  Running = 'RUNNING',
  Stopping = 'STOPPING',
  Suspending = 'SUSPENDING',
  Suspended = 'SUSPENDED',
  Terminated = 'TERMINATED',
}

export interface VMZone {
  id: string;
  name: string;
  baseUrl: string;
}
