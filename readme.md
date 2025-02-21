# Challenge Express Products

## Creación de la estructura del proyecto

### Creación de los ficheros de configuración

- .editorconfig
- .env
- .gitignore
- eslint.config.js
- package.json
- tsconfig.json
- vitest.config.ts

### Creación de la estructura de carpetas

- dist
- public (incluyendo favicons)
- src (incluyendo index.ts)

### Dependencias

- Desarrollo
  - typescript / @types/node
  - prettier
  - eslint / @eslint/js / globals / typescript-eslint
  - vitest:
- Finales
  - cross-env
  - debug / @types/debug
  - express / @types/express
  - cors / @types/cors
  - morgan / @types/morgan

### Scripts

- "start": "node dist/index.js",
- "start:dev": "cross-env NODE_ENV=dev DEBUG=demo\* node --watch --env-file=.env ./dist/index.js",
- "build": "tsc -w",
- "test": "vitest run",
- "test:c": "vitest run --coverage",
- "lint": "eslint . --ext .ts"

## Servidor HTTP y aplicación Express básica

### Servidor HTTP

```typescript
import { createServer } from 'node:http';
import createDebug from 'debug';
import { listenManager } from './server/listen-manager.js';
import { errorManager } from './server/error-manager.js';
import { app } from './app.js';

const debug = createDebug('demo:server');
debug('Iniciando servidor...');
const PORT = process.env.PORT || 3000;
const server = createServer(app);
server.listen(PORT);
server.on('listening', () => listenManager(server));
server.on('error', errorManager);
```

### Aplicación Express inicial

```typescript
import express from 'express';
import createDebug from 'debug';

export const app = express();
const debug = createDebug('demo:app');

debug('Iniciando App...');
app.disable('x-powered-by');
```

### Server event handlers

- para el evento 'listening'
- para el evento 'error'
- en relación con el error se crea la clase `HttpError`

#### Manejo de errores del servidor

```typescript
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public status: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
```

```ts
import type { ServerResponse } from 'node:http';
import { HttpError } from '../errors/http-error.js';
import createDebug from 'debug';
const debug = createDebug('demo:server');

export const errorManager = (
  error: Error | HttpError,
  response: ServerResponse,
) => {
  if (!('status' in error)) {
    error = {
      ...error,
      statusCode: 500,
      status: 'Internal Server Error',
    };
  }

  const publicMessage = `Error: ${error.statusCode} ${error.status}`;
  debug(publicMessage, error.message);

  const html = `<p>${publicMessage}</p>`;
  response.statusCode = error.statusCode;
  response.statusMessage = error.status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
};
```

#### Manejo del eventos listening del servidor

```ts
import createDebug from 'debug';
import { Server } from 'node:http';
const debug = createDebug('demo:server-listening');

export const listenManager = (server: Server) => {
  const addr = server.address();
  if (addr === null) return;
  let bind: string;
  if (typeof addr === 'string') {
    bind = 'pipe ' + addr;
  } else {
    bind =
      addr.address === '::'
        ? `http://localhost:${addr?.port}`
        : `${addr.address}:${addr?.port}`;
  }
  if (!process.env.DEBUG) {
    console.log(`Server listening on ${bind}`);
  } else {
    debug(`Servidor escuchando en ${bind}`);
  }
};
```

## Aplicación Express

### Middlewares de aplicación

```ts
import { resolve } from 'path';
import morgan from 'morgan';
import cors from 'cors';
import { debugLogger } from './middleware/debug-logger.js';

const __dirname = resolve();
const publicPath = resolve(__dirname, 'public');

// Middlewares
app.use(cors());
app.use(morgan('common'));
app.use(express.json());
app.use(debugLogger('debugger'));
app.use(express.static(publicPath));
```

### Controladores de rutas y errores

- ruta no encontrada (error 404)
- método no permitido (error 405)

```ts
app.use('\*', notFoundController);
app.use(errorManager);
```

#### Controladores base

```ts
import type { NextFunction, Request, Response } from 'express';
import createDebug from 'debug';
import { HttpError } from '../errors/http-error.js';

export const notFoundController = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const debug = createDebug('demo:notFoundController');
  debug('Petición recibida');

  const message = `Page ${req.url} not found`;
  const error = new HttpError(message, 405, 'Not Found');
  next(error);
};

export const notMethodController = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const debug = createDebug('demo:notMethodController');
  debug('Petición recibida');

  const message = `Method ${req.method}  not allowed`;
  const error = new HttpError(message, 405, 'Method Not Allowed');
  next(error);
};
```

### Middleware de errores

```ts
import { Request, Response, NextFunction } from 'express';
import createDebug from 'debug';
import { HttpError } from './http-error.js';

const debug = createDebug('demo:errorManager');

export const errorManager = (
  err: HttpError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (!('status' in err)) {
    err = {
      ...err,
      statusCode: 500,
      status: 'Internal Server Error',
    };
  }

  const publicMessage = `Error: ${err.statusCode} ${err.status}`;
  debug(publicMessage, err.message);

  res.status(err.statusCode);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(publicMessage);
};
```

#### Página de errores

- Partials
  - Head
  - Header
  - Menu
  - Dialog-nav
  - Footer
- class BasePage
- class ErrorPage

Elementos `public` usados por las páginas

- `favicon.ico` / `favicon.svg`
- `main.css`
- `guide.css`
- `index.js` (menu icon / menu dialog)
- assets `logo.svg`

## Páginas de la aplicación

### Página de about

Completamente estática

### Página de inicio

Generada dinámicamente a partir de los partials de HTML

- Vista (view)
- Controller

#### Controlador de la página de inicio

### Página de productos

Generada con datos de un fichero JSON
