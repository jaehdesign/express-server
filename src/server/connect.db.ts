import { ODMLite } from '../odm/odm-lite.js';
import createDebug from 'debug';
const debug = createDebug('demo:server:db:connect');

export const connectDB = async () => {
    const info = await ODMLite.initializeJSON('./data/db.json');
    info.forEach((msg) => debug(msg));
};
