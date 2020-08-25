import { join, dirname } from 'path';

export class CloudPlatform {

  static projectId(): string {
    return 'wroclive';
  }

  /**
   * Credentials to use when subscribing to PubSub.
   */
  static credentialsFile(): string {
    const dir = __dirname;
    const root = dirname(dir);
    return join(root, 'GCP-Credentials.json');
  }
}
