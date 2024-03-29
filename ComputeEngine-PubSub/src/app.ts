import {
  PubSub,
  Subscription,
  Message,
  CreateSubscriptionOptions
} from '@google-cloud/pubsub';
import { google } from '@google-cloud/pubsub/build/protos/protos';
import { execFile } from 'child_process';

import { CloudPlatform } from './CloudPlatform';
import { createLogger } from './util';

// ============
// === Main ===
// ============

// Set process title, so it is easier to kill it during install.
// New title has to be shorter than 'node ./dist/app.js'
process.title = 'CE-PubSub';

// All of our scripts are in HOME.
process.chdir('/home/michal');

const logger = createLogger('CE-PubSub');

const second = 1;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

const pubSub = new PubSub({
  projectId: CloudPlatform.projectId(),
  keyFilename: CloudPlatform.credentialsFile()
});

const subscriptions: Subscription[] = [];

async function subscribe(topicName: string, handler: (m: Message) => void) {
  try {
    const topic = pubSub.topic(topicName);
    logger.info(`Got topic: ${topic.name}`);

    const dateString = new Date().toISOString();
    const timestamp = dateString.replace(/[:\.]/g, '');
    const name = `backend-pubsub-${timestamp}`;

    // After 2 days of inactivity our subscription will expire
    const options: CreateSubscriptionOptions = {
      expirationPolicy: {
        ttl: new google.protobuf.Duration({ seconds: 2 * day })
      }
    };

    logger.info(`Creating subscription: ${name}`);
    const response = await topic.createSubscription(name, options);
    const subscription = response[0];
    logger.info(`Got subscription: ${subscription.name}`);

    subscriptions.push(subscription);
    subscription.on('message', handler);
  } catch (error) {
    logger.error('Error when creating subscription:', error);
  }
}

function exec(file: string) {
  logger.info(`Running file: ${file}`);
  execFile(file, (error, stdout, stderr) => {
    if (stdout) {
      logger.info(`Stdout from ${file}`, stdout);
    }

    if (error) {
      logger.error(`Error from ${file}`, error);
    }

    if (stderr) {
      logger.error(`Stderr from ${file}`, stderr);
    }
  });
}

// =====================
// === Subscriptions ===
// =====================

subscribe('backend-update-gtfs-data', message => {
  logger.info(`Got message: ${message.id}`);
  exec('./run-updater.sh'); // <-- THIS
  message.ack();
});
