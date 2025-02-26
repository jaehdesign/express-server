import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import createDebug from 'debug';
import { Animal } from './animal.type.js';
import type { Repository } from './repository.type';

const debug = createDebug('demo:repository:animals');

type AnimalRow = Animal & RowDataPacket;

export class AnimalMySqlRepo implements Repository<Animal> {
    connection!: mysql.Connection;
    constructor() {
        debug('Instanciando repo for animals');
        this.openConnection();
    }

    private async initializeDBs() {
        const createDB = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`;
        await this.connection.query(createDB);

        const useDB = `USE ${process.env.DB_NAME}`;
        await this.connection.query(useDB);

        const createTable = `CREATE TABLE IF NOT EXISTS animals (
            animalID BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
            name varchar(255) NOT null unique,
            englishName varchar(255) NOT null unique,
            sciName VARCHAR(255) NOT NULL,
            diet VARCHAR(255) NOT NULL,
            lifestyle VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            slogan text,
            bioGroup VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT (NOW()), 
            updated_at TIMESTAMP DEFAULT (NOW())
        )`;
        await this.connection.query(createTable);
    }

    private async openConnection() {
        const dataConnection = {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD, //database: process.env.DB_NAME || '',
        };
        this.connection = await mysql.createConnection(dataConnection);
        debug(
            'Connection to server:',
            this.connection.config.host,
            this.connection.config.port,
        );
        await this.initializeDBs();
        debug('Connection to DB:', process.env.DB_NAME);
    }

    private animalRowToAnimal(row: AnimalRow): Animal {
        return {
            id: row.id,
            name: row.name,
            englishName: row.englishName,
            sciName: row.sciName,
            diet: row.diet,
            lifestyle: row.lifestyle,
            location: row.location,
            slogan: row.slogan,
            group: row.bioGroup,
            image: row.image,
        };
    }

    async read(): Promise<Animal[]> {
        const q = `SELECT 
            BIN_TO_UUID(animalID) as id,
            name,
            englishName,
            sciName,
            diet,
            lifestyle,
            location,
            slogan,
            bioGroup as 'group',
            image
        FROM animals`;
        const [rows] = await this.connection.query<AnimalRow[]>(q);
        const animals = rows.map((row) => this.animalRowToAnimal(row));
        return animals;
    }

    async readById(id: string): Promise<Animal> {
        const q = `select 
        BIN_TO_UUID(animalID) as id,
            name,
            englishName,
            sciName,
            diet,
            lifestyle,
            location,
            slogan,
            bioGroup as 'group',
            image
        from animals where animalID = UUID_TO_BIN(?)`;
        const [rows] = await this.connection.query<AnimalRow[]>(q, [id]);

        if (rows.length === 0) {
            throw new Error(`Genere with id ${id} not found`);
        }
        const animal = this.animalRowToAnimal(rows[0]);
        return animal;
    }

    async create(data: Omit<Animal, 'id'>): Promise<Animal> {
        const uuid = crypto.randomUUID();
        const q = `insert into animals (
                    animalID,
                    name,
                    englishName,
                    sciName,
                    diet,
                    lifestyle,
                    location,
                    slogan,
                    bioGroup,
                    image) 
                VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        debug('Query:', q);
        await Animal.parseAsync({ ...data, id: '0' });
        const [result] = await this.connection.query<ResultSetHeader>(q, [
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

        if (result.affectedRows !== 1) {
            throw new Error('Animal not created');
        }
        const animal = await this.readById(uuid);
        return animal;
    }

    async update(
        id: string,
        data: Partial<Omit<Animal, 'id'>>,
    ): Promise<Animal> {
        await Animal.partial().parseAsync({ ...data, id });
        const validFields: Record<string, string> = {
            name: 'name',
            englishName: 'englishName',
            sciName: 'sciName',
            diet: 'diet',
            lifestyle: 'lifestyle',
            location: 'location',
            slogan: 'slogan',
            group: 'bioGroup',
            image: 'image',
        };

        const fields: string[] = [];
        const values: unknown[] = [];

        Object.entries(data).forEach(([key, value]) => {
            if (!validFields[key]) {
                throw new Error(`Invalid search field: ${key}`);
            }
            fields.push(`${validFields[key]} = ?`);
            values.push(value);
        });

        const q = `update animals set ${fields.join(', ')}
        where animalID = UUID_TO_BIN(?);`;

        const [result] = await this.connection.query<ResultSetHeader>(q, [
            ...values,
            id,
        ]);

        if (result.affectedRows !== 1) {
            throw new Error('Animal not updated');
        }

        console.log('Animal updated with id:', id);
        const animal = await this.readById(id);
        return animal;
    }

    async delete(id: string): Promise<Animal> {
        const animal = await this.readById(id);

        const q = `delete from animals where animalID = UUID_TO_BIN(?);`;
        const [result] = await this.connection.query<ResultSetHeader>(q, [id]);

        if (result.affectedRows !== 1) {
            throw new Error('Animal not deleted');
        }

        console.log('Animal deleted with id:', id);
        return animal;
    }
}
