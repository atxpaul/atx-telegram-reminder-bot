import { databaseConnect } from './loaders/mongo.js';
import { startBot } from './utils/botManager.js';

databaseConnect();
startBot();
