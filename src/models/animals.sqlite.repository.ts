/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { promisify } from 'node:util';
import createDebug from 'debug';
import sqlite3 from 'sqlite3';
import type { Animal } from './animal.type';
import type { Repository } from './repository.type';
import { run } from 'node:test';
const debug = createDebug('demo:repository:animals');

const SQL = {
    run: async (db: any, sql: any, params: any) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: any, row: any) => {
                if (err) reject(err);
                console.log('Row:', row);
                resolve(row);
            });
        });
    },
    all: async (db: any, sql: any) => {
        return new Promise((resolve, reject) => {
            db.all(sql, (err: any, row: any) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },
    get: async (db: any, sql: any, params: any) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err: any, row: any) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },
};

export class AnimalSqliteRepo implements Repository<Animal> {
    dataBase!: sqlite3.Database;
    // SQL = {
    //     run: promisify(this.dataBase.run.bind(this.dataBase)),
    //     all: promisify(this.dataBase.all.bind(this.dataBase)),
    //     get: promisify(this.dataBase.get.bind(this.dataBase)),
    // };
    constructor() {
        console.log('Instanciando repo for sqlite');
        this.connectSQLite();
    }

    private async initializeSQLITE(relativeFilePath: string) {
        const filePath = resolve(relativeFilePath);
        const folder = dirname(filePath);
        const info = [];
        try {
            await access(folder);
        } catch (error) {
            const errorFolder = error as Error;
            if (errorFolder.message.includes('no such file or directory')) {
                info.push('Folder does not exist');
                mkdir(folder, { recursive: true });
                info.push(folder);
            } else {
                console.error(errorFolder.message);
                throw errorFolder;
            }
        }
        try {
            await access(filePath);
            info.push('File already exists');
        } catch (error) {
            const errorFile = error as Error;
            if (errorFile.message.includes('no such file or directory')) {
                info.push('File does not exist');
                await writeFile(filePath, '', 'utf-8');
                info.push('File initialized');
            } else {
                console.error(errorFile.message);
                throw errorFile;
            }
        }
        info.push(`Initialized DB at`);
        info.push(filePath);
        return info;
    }

    private async initializeTable(table: string) {
        //  Alternativa id: string;
        const query = `CREATE TABLE IF NOT EXISTS ${table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            englishName TEXT,
            sciName TEXT,
            diet TEXT,
            lifestyle TEXT,
            location TEXT,
            slogan TEXT,
            bioGroup TEXT,
            image TEXT
        )`;

        // const promiseRun = promisify(this.dataBase.run.bind(this.dataBase));
        // await promiseRun(query);
        await promisify(this.dataBase.run.bind(this.dataBase))(query);

        // await SQL.run(query);
        debug('Creating table:', query);
    }

    private async connectSQLite() {
        const dbFile = process.env.DB_FILE; // || ':memory:';

        if (!dbFile) {
            throw new Error('DB_FILE not defined');
        }

        const info = await this.initializeSQLITE(dbFile);
        info.forEach((msg) => debug(msg));

        const file = info.at(-1) as string;

        // const file = resolve(dbFile);

        debug('Connecting to DB:', file);
        this.dataBase = new sqlite3.Database(file);
        debug('Connection to DB', this.dataBase);

        if (info[0] === 'File does not exist') {
            await this.initializeTable('animals');
        }
    }

    async read(): Promise<Animal[]> {
        const query = 'SELECT * FROM animals';

        const data = (await SQL.all(this.dataBase, query)) as Animal[];
        return data;
    }
    async readById(id: string): Promise<Animal> {
        const query = `SELECT * FROM animals WHERE id = ?`;
        const data = (await SQL.get(this.dataBase, query, id)) as Animal;
        return data;
    }
    async create(data: Omit<Animal, 'id'>): Promise<Animal> {
        const query = `INSERT INTO animals (name, englishName, sciName, diet, lifestyle, location, slogan, bioGroup, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const r = await SQL.run(this.dataBase, query, [
            data.name,
            data.englishName,
            data.sciName,
            data.diet,
            data.lifestyle,
            data.location,
            data.slogan,
            data.group,
            data.image,
        ]);
        return data as Animal;
        // await this.readById((r as any).lastID);
    }
    async update(
        id: string,
        data: Partial<Omit<Animal, 'id'>>,
    ): Promise<Animal> {
        return {} as Animal;
    }
    async delete(id: string): Promise<Animal> {
        const data = await this.readById(id);

        const query = `DELETE FROM animals WHERE id = ?`;
        await SQL.run(this.dataBase, query, id);

        return data;
    }
}
