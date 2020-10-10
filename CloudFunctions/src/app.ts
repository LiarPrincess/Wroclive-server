import { createLogger, isLocal } from './util';
import { Message, Context, VM, VMStatus } from './types';

const logger = createLogger('CloudFunctions');

const computeOptions: any = {};
if (isLocal) {
  computeOptions.projectId = 'wroclive';
  computeOptions.keyFilename = './CloudFunctions/GCP-Credentials.json';
}

const Compute = require('@google-cloud/compute');
const compute = new Compute(computeOptions);

/* ========================== */
/* === Backend start/stop === */
/* ========================== */

const backend = 'backend';

async function getVMs(name: string): Promise<VM[]> {
  const [instances] = await compute.getVMs({
    filter: `name eq ${name}`
  });

  return instances;
}

export async function backendStart(message: Message, context: Context): Promise<void> {
  logger.info(`Attempting to start instance '${backend}'`);
  const instances = await getVMs(backend);

  const promises: Promise<void>[] = [];
  for (const vm of instances) {
    const status = vm.metadata.status;
    const hasValidStatus = status == VMStatus.Suspended || status == VMStatus.Terminated;

    const action = hasValidStatus ? ' attempting to start' : 'ignoring';
    logger.info(`Found '${vm.id}', status: ${status}, action: ${action}`);

    if (hasValidStatus) {
      promises.push(vm.start());
    }
  }

  await Promise.all(promises);
}

export async function backendStop(message: Message, context: Context): Promise<void> {
  logger.info(`Attempting to stop instance '${backend}'`);
  const instances = await getVMs(backend);

  const promises: Promise<void>[] = [];
  for (const vm of instances) {
    const status = vm.metadata.status;
    const hasValidStatus = status == VMStatus.Running;

    const action = hasValidStatus ? ' attempting to stop' : 'ignoring';
    logger.info(`Found '${vm.id}', status: ${status}, action: ${action}`);

    if (hasValidStatus) {
      promises.push(vm.stop());
    }
  }

  await Promise.all(promises);
}
