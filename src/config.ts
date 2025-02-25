// Fichero de configuración de la aplicación para el entorno de desarrollo con MySQL

// import { AnimalMySqlRepo } from './models/animals.mysql.repository';
import data from '../data/db.json' with { type: 'json' };

// const repo = new AnimalMySqlRepo();

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
    image) VALUES `;

const x = data.animals
    .map((animal) => Object.values(animal))
    .map((values) => `'${values}'`)
    .join("', '");

//.map((values) => `(${values})`);

console.log(x);

//(UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
// repo.connection.query(q);
