import createDebug from 'debug';
import { Animal } from './animal.type.js';
import type { Repository } from './repository.type.js';
import { PrismaClient } from '@prisma/client';
import { animals } from '@prisma/client';

const debug = createDebug('demo:repository:animals');

const bin_to_uuid = (bin: Uint8Array<ArrayBufferLike>) => {
    const hex = Buffer.from(bin).toString('hex');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-');
    Buffer.from(bin).toString('hex');
};

const uuid_to_bin = (uuid: string) => {
    const hex = uuid.replace(/-/g, '');
    return Buffer.from(hex, 'hex');
};

export class AnimalPrismaRepo implements Repository<Animal> {
    connection: PrismaClient;
    constructor() {
        debug('Instanciando repo for animals');
        this.connection = new PrismaClient();
    }

    private animalRowToAnimal(row: animals): Animal {
        return {
            id: bin_to_uuid(row.animalID),
            name: row.name,
            englishName: row.englishName,
            sciName: row.sciName,
            diet: row.diet,
            lifestyle: row.lifestyle as 'Diurno' | 'Nocturno',
            location: row.location,
            slogan: row.slogan as string,
            group: row.bioGroup,
            image: row.image,
        };
    }

    async read(): Promise<Animal[]> {
        const rows = await this.connection.animals.findMany();
        const animals = rows.map((row) => this.animalRowToAnimal(row));

        debug(animals);

        return animals;
    }

    async readById(id: string): Promise<Animal> {
        const row = await this.connection.animals.findUniqueOrThrow({
            where: {
                animalID: uuid_to_bin(id),
            },
        });

        const animal = this.animalRowToAnimal(row as animals);
        return animal;
    }

    async create(data: Omit<Animal, 'id'>): Promise<Animal> {
        await Animal.parseAsync({ ...data, id: '0' });
        const row = await this.connection.animals.create({
            data: {
                name: data.name,
                englishName: data.englishName,
                sciName: data.sciName,
                diet: data.diet,
                lifestyle: data.lifestyle,
                location: data.location,
                slogan: data.slogan,
                bioGroup: data.group,
                image: data.image,
            },
        });

        const animal = this.animalRowToAnimal(row as animals);
        return animal;
    }

    async update(
        id: string,
        data: Partial<Omit<Animal, 'id'>>,
    ): Promise<Animal> {
        await Animal.partial().parseAsync({ ...data, id });

        debug('Updating animal with id:', id);

        const { group, ...rest } = data;

        const finalData =
            typeof group === 'undefined'
                ? {
                      ...rest,
                      bioGroup: group,
                  }
                : rest;

        debug(finalData);

        const row = await this.connection.animals.update({
            where: {
                animalID: uuid_to_bin(id),
            },
            data: finalData,
        });

        console.log('Animal updated with id:', id);
        const animal = this.animalRowToAnimal(row as animals);
        return animal;
    }

    async delete(id: string): Promise<Animal> {
        const row = await this.connection.animals.delete({
            where: {
                animalID: uuid_to_bin(id),
            },
        });

        const animal = this.animalRowToAnimal(row as animals);
        return animal;
    }
}
