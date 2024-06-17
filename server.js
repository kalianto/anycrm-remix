import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';

const serverOptions = {
  key: fs.readFileSync(path.resolve('certs/server.key'), 'utf-8'),
  cert: fs.readFileSync(path.resolve('certs/server.crt'), 'utf-8'),
};

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? null
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();
app.use(
  viteDevServer ? viteDevServer.middlewares : express.static('build/client')
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  : await import('./build/server/index.js');

app.all('*', createRequestHandler({ build }));

const httpsServer = https.createServer(serverOptions, app);
httpsServer.listen(3000, () => {
  console.log('App listening on https://localhost:3000');
});
