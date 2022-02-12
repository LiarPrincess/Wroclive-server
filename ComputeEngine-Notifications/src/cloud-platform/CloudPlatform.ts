export class CloudPlatform {

  static projectId(): string {
    return 'wroclive';
  }

  /**
   * Credentials to use when writing to Firestore database.
   */
  static credentialsFile(): string {
    return './GCP-Credentials.json';
  }
}
