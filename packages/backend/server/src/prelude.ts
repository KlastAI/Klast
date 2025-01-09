import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultPollensConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const Pollens_CONFIG_PATH = process.env.Pollens_CONFIG_PATH ?? configDir;
  // Initializing Pollens config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(Pollens_CONFIG_PATH, '.env'),
  });

  // 2. generate Pollens default config and assign to `globalThis.Pollens`
  globalThis.Pollens = getDefaultPollensConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/Pollens.env`
  // 3. load env => config map to `globalThis.Pollens.ENV_MAP
  await loadRemote(Pollens_CONFIG_PATH, 'Pollens.env.js');

  // 4. load `config/Pollens` to patch custom configs
  await loadRemote(Pollens_CONFIG_PATH, 'Pollens.js');

  // 5. load `config/Pollens.self` to patch custom configs
  // This is the file only take effect in [Pollens Cloud]
  if (!Pollens.isSelfhosted) {
    await loadRemote(Pollens_CONFIG_PATH, 'Pollens.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.Pollens`
  applyEnvToConfig(globalThis.Pollens);

  if (Pollens.node.dev) {
    console.log(
      'Pollens Config:',
      JSON.stringify(omit(globalThis.Pollens, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
