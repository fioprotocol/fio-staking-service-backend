import { join } from 'path';
import { config as load } from 'dotenv-safe';
const NodeCache = require( "node-cache" );
const oracleCache = new NodeCache();

load({
  example: join(process.cwd(), '.env'),
});

let mode = 'testnet';

console.log('Uses ' + mode + ' configuration.');

export default {
  mode,
};
