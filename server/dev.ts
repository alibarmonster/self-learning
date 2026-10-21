/**
 * The production edge, inside `bun run dev`: a Vite plugin that runs
 * middleware.ts in front of every request and serves /api/* from the same
 * handlers the Vercel Functions use. Nothing here ships in the build.
 *
 * It only switches on when BASIC_AUTH_USER and BASIC_AUTH_PASSWORD are set
 * (in `.env.local`); without them dev stays open and storage stays in the
 * browser, as before. With them and no TURSO_DATABASE_URL, it uses a local
 * SQLite file at data/exam-prep.db.
 */
import { mkdirSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const KEYS = ['BASIC_AUTH_USER', 'BASIC_AUTH_PASSWORD', 'SESSION_SECRET', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
export const LOCAL_DB = 'file:data/exam-prep.db';

/** Reads the Node request once and returns a maker of fresh Web Requests (the middleware and the handler each get one). */
async function requests(req: IncomingMessage): Promise<() => Request> {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v !== undefined) headers.set(k, v);
  }
  const method = req.method ?? 'GET';
  let body: Buffer | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    body = Buffer.concat(chunks);
  }
  const url = `http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`;
  return () => new Request(url, { method, headers, body });
}

async function send(res: ServerResponse, r: Response) {
  res.statusCode = r.status;
  r.headers.forEach((value, key) => {
    if (key !== 'set-cookie') res.setHeader(key, value);
  });
  const cookies = r.headers.getSetCookie();
  if (cookies.length) res.setHeader('set-cookie', cookies);
  res.end(Buffer.from(await r.arrayBuffer()));
}

type Handler = (r: Request) => Promise<Response>;

export function devServer(env: Record<string, string>): Plugin {
  return {
    name: 'exam-prep-dev-server',
    apply: 'serve',
    configureServer(server) {
      for (const k of KEYS) if (env[k] && !process.env[k]) process.env[k] = env[k];
      const enabled = Boolean(process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD);
      if (enabled && !process.env.TURSO_DATABASE_URL) {
        mkdirSync('data', { recursive: true });
        process.env.TURSO_DATABASE_URL = LOCAL_DB;
      }
      server.config.logger.info(
        enabled
          ? `  ➜  sign-in on, database ${process.env.TURSO_DATABASE_URL?.startsWith('file:') ? process.env.TURSO_DATABASE_URL : 'Turso'}`
          : '  ➜  sign-in off (set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in .env.local to turn on accounts)'
      );

      server.middlewares.use(async (req, res, next) => {
        try {
          const path = (req.url ?? '/').split('?')[0];
          if (!enabled) {
            if (path.startsWith('/api/')) return send(res, Response.json({ error: 'not-configured' }, { status: 404 }));
            return next();
          }
          const fresh = await requests(req);
          const middleware = (await server.ssrLoadModule('/middleware.ts')).default as Handler;
          const gate = await middleware(fresh());
          if (gate.headers.get('x-middleware-next') !== '1') return send(res, gate);
          if (!path.startsWith('/api/')) return next();
          const { ROUTES } = (await server.ssrLoadModule('/server/api/handlers.ts')) as { ROUTES: Record<string, Partial<Record<string, Handler>>> };
          const handler = ROUTES[path]?.[req.method ?? 'GET'];
          if (!handler) return send(res, Response.json({ error: 'not-found' }, { status: ROUTES[path] ? 405 : 404 }));
          return send(res, await handler(fresh()));
        } catch (e) {
          server.config.logger.error(`dev server: ${(e as Error).stack ?? e}`);
          return send(res, Response.json({ error: 'server-error' }, { status: 500 }));
        }
      });
    }
  };
}
