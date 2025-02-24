/* eslint-disable @typescript-eslint/no-unused-vars */
import mysql, { RowDataPacket } from 'mysql2/promise';

import { Animal } from './animal.type';
import type { Repository } from './repository.type';

type AnimalRow = Animal & RowDataPacket;

export class AnimalMySqlRepo implements Repository<Animal> {
    connection!: mysql.Connection;
    constructor() {
        console.log('Instanciando repo for animals');
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
            user: process.env.DB_USER,
            password: process.env.DB_PASSWD,
            //database: process.env.DB_NAME || '',
        };
        this.connection = await mysql.createConnection(dataConnection);
        console.log(
            'Connection to server:',
            this.connection.config.host,
            this.connection.config.port,
        );
        await this.initializeDBs();
        console.log('Connection to DB:', this.connection.config.database);
    }

    async read(): Promise<Animal[]> {
        const q = 'SELECT * FROM animals';
        const [rows] = await this.connection.query<AnimalRow[]>(q);
        return rows;
    }

    async readById(id: string): Promise<Animal> {
        return {} as Animal;
    }

    async create(data: Omit<Animal, 'id'>): Promise<Animal> {
        return {} as Animal;
    }

    async update(
        id: string,
        data: Partial<Omit<Animal, 'id'>>,
    ): Promise<Animal> {
        return {} as Animal;
    }

    async delete(id: string): Promise<Animal> {
        return {} as Animal;
    }
}
