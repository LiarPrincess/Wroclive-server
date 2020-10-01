# Wroclive - Real-time public transport in Wrocław

This repository contains sources of server part of [Wroclive iOS app](https://www.wroclive.app).

(Psst… the app itself is also [open-sourced](https://github.com/LiarPrincess/Wroclive-client)!)

## Organization and configuration

We use [Google Cloud](https://cloud.google.com/) for hosting.

We extensively use their [free tier](https://cloud.google.com/free), to keep our hosting costs low. The only thing that we actually pay for is storage for [App Engine](https://cloud.google.com/appengine) instances, but this is about 0.05 zł per month (only the instances in US are free and we chose Frankfurt because of [GDPR](https://ec.europa.eu/info/law/law-topic/data-protection/eu-data-protection-rules_en) and latency).

Anyway, this is how it works:

- [App Engine](https://cloud.google.com/appengine)
  - handles all traffic to [wroclive.app](https://wroclive.app/) and [wroclive.app/api](https://wroclive.app/api)
  - runs code from [AppEngine](AppEngine) directory
  - every 1h it fetches MPK data (for example available lines and stop locations) from `Firestore`
  - every 5 seconds it fetches new vehicle locations from [wroclaw.pl/open-data](https://www.wroclaw.pl/open-data/)
  - if you want to deploy (run `make deploy`) it yourself remember to put `GCP-Credentials.json` for `app-engine-firestore-reader` service account in [AppEngine directory](AppEngine)

- [Firestore](https://cloud.google.com/firestore)
  - stores persistent data (for example available lines and stop locations)
  - it is filled by `Compute Engine`

- [Compute Engine](https://cloud.google.com/compute)
  - single instance named `backend`
  - responsible for updating `Firestore` with latest [GTFS](https://developers.google.com/transit/gtfs) data downloaded from [wroclaw.pl/open-data](https://www.wroclaw.pl/open-data/)
  - runs code from following directories:
    - [ComputeEngine-Updater](ComputeEngine-Updater)
      - simple app that will download GTFS file and upload it to `Firestore`
      - it uses [sqlite.org](https://www.sqlite.org/index.html) for intermediate processing
      - before installing remember to put `GCP-Credentials.json` for `compute-engine-firestore-writer` service account in [ComputeEngine-Updater directory](ComputeEngine-Updater)
    - [ComputeEngine-PubSub](ComputeEngine-PubSub)
      - `Pub/Sub` subscriber
      - after receiving `backend-update-gtfs-data` message it will run `ComputeEngine-Updater`
      - it starts when the `Compute Engine` instance starts
      - before installing remember to put `GCP-Credentials.json` for `pubsub` service account in [ComputeEngine-PubSub directory](ComputeEngine-PubSub)

- [Cloud Functions](https://cloud.google.com/functions)
  - runs code from [CloudFunctions](CloudFunctions) directory
  - `backendStart` function
    - it will look for `backend` instance on `Compute Engine` and start it
    - scheduled by `Cloud Scheduler`
  - `backendStop` function
    - it will look for `backend` instance on `Compute Engine` and stop it
    - scheduled by `Cloud Scheduler`

- [Pub/Sub](https://cloud.google.com/pubsub)
  - following topics need to be created:
    - `backend-stop`
    - `backend-start`
    - `backend-update-gtfs-data`

- [Cloud Scheduler](https://cloud.google.com/scheduler)
  - publish `backend-stop` message on `Pub/Sub` every day at 1am (`0 1 * * *`)
  - publish `backend-start` message on `Pub/Sub` every day at 5am (`0 5 * * *`)
  - publish `backend-update-gtfs-data` message on `Pub/Sub` every day at 3am (`0 3 * * *`)

- [IAM & Admin](https://cloud.google.com/iam)
  - following service accounts are used:

    - `App Engine default service account`
      - automatically created by `App Engine`
      - no configuration needed

    - `app-engine-firestore-reader` - account used by `App Engine` to read data from `Firestore`
      - Role: Viewer
      - Key should be exported and placed in [AppEngine](AppEngine)

    - `compute-engine-firestore-writer` - account used in `ComputeEngine-Updater` to write data to `Firestore`
      - Role: Owner
      - Key should be exported and placed in [ComputeEngine-Updater](ComputeEngine-Updater)

    - `pubsub` - account used for creating subscriptions in `ComputeEngine-PubSub`
      - Roles: Editor, Pub/Sub Publisher, Pub/Sub Subscriber
      - Key should be exported and placed in [ComputeEngine-PubSub](ComputeEngine-PubSub)

- [Cloud Logging](https://cloud.google.com/logging)
  - we use [winstonjs/winston](https://github.com/winstonjs/winston) with `@google-cloud/logging-winston` backend

- [Error reporting](https://cloud.google.com/error-reporting)
  - standard reporting by mail

## License

Wroclive is licensed under the Mozilla Public License 2.0 license.
See [LICENSE](LICENSE) for more information.
