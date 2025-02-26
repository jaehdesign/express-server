// Fichero de configuración de la aplicación para el entorno de desarrollo con MySQL

import { AnimalMySqlRepo } from './models/animals.mysql.repository.js';
import data from '../data/db.json' with { type: 'json' };

const repo = new AnimalMySqlRepo();

setTimeout(() => {
    let q = `insert into animals (
    animalID,
    name,
    englishName,
    sciName,
    diet,
    lifestyle,
    location,
    slogan,
    bioGroup,
    image) VALUES `;

    // Problema del orden de los valores

    // q += data.animals
    //     .map((animal: Record<string, unknown>) => {
    //         for (const key in animal) {
    //             if (key === 'id') {
    //                 animal[key] = `UUID('${animal.id}')`;
    //                 continue;
    //             }
    //             animal[key] = `'${animal[key]}'`;
    //         }

    //         return animal;
    //     })
    //     .map((animal) => Object.values(animal).join(', '))
    //     .map((values) => `(${values})`)
    //     .join(',\n');

    q += data.animals
        .map((animal: Record<string, unknown>) => {
            return `(
                UUID_TO_BIN('${animal.id}'),
                '${animal.name}',
                '${animal.englishName}',
                '${animal.sciName}',
                '${animal.diet}',
                '${animal.lifestyle}',
                '${animal.location}',
                '${animal.slogan}',
                '${animal.group}',
                '${animal.image}')`;
        })
        .join(', ');

    repo.connection.query(q);
    repo.connection.end();
}, 2000);
