/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = Pollens.deploy ? '0.0.0.0' : 'localhost';
await app.listen(Pollens.port, listeningHost);

const logger = new Logger('App');

logger.log(`Pollens Server is running in [${Pollens.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${Pollens.port}`);
logger.log(`And the public server should be recognized as ${Pollens.baseUrl}`);
