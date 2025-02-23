import { ODMLite } from '../odm/odm-lite.js';
import mysql from 'mysql2/promise';
import createDebug from 'debug';
const debug = createDebug('demo:server:db:connect');

const dataConnection = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || '',
};

export const connectDB = async () => {
    const info = await ODMLite.initializeJSON('./data/db.json');
    info.forEach((msg) => debug(msg));
};

export const connectMySQL = async () => {
    //const info = await ODMLite.initializeJSON('./data/db.json');
    //info.forEach((msg) => debug(msg));
    const connection = await mysql.createConnection(dataConnection);
    console.log(
        'Connection to server:',
        connection.config.host,
        connection.config.port,
    );
    console.log('Connection to DB:', connection.config.database);
    return connection;
};
