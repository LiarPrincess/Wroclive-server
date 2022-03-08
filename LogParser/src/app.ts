import { writeAppEngineLifeCycleReport } from './app-engine-life-cycle';

const outputDirPath = './output/';

(async () => {
  try {
    // We want all of the paths resolved relatively to 'LogParser'.
    process.chdir('LogParser');

    // App Engine life cycle
    // Parse files exported from 'App Engine life cycle' filter (see main README.)
    const appEngineLifeCycleInput = './input/AppEngine-life-cycle-20220308.csv';
    writeAppEngineLifeCycleReport(appEngineLifeCycleInput, outputDirPath);
  } catch (error) {
    console.error(error);
  }
})();
