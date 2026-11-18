/**
 * Local preview of the production build (npm run build → npm run serve).
 * Mimics Vercel for static files: trailing-slash 308 redirects, index.html, 404.html,
 * Brotli compression, long cache for /_astro/. The contact API is not available here.
 */
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist/client');
const port = Number(process.argv[3] ?? 4400);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const p = decodeURIComponent(url.pathname);
    if (!path.extname(p) && !p.endsWith('/')) {
      res.writeHead(308, { Location: p + '/' + url.search });
      return res.end();
    }
    const file = path.join(root, p.endsWith('/') ? path.join(p, 'index.html') : p);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': types['.html'] });
        return res.end(fs.existsSync(path.join(root, '404.html')) ? fs.readFileSync(path.join(root, '404.html')) : 'Not found');
      }
      const type = types[path.extname(file)] ?? 'application/octet-stream';
      const br = /text|javascript|json|xml|svg/.test(type) && /br/.test(req.headers['accept-encoding'] ?? '');
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache',
        ...(br ? { 'Content-Encoding': 'br', Vary: 'Accept-Encoding' } : {}),
      });
      res.end(br ? zlib.brotliCompressSync(data) : data);
    });
  })
  .listen(port, () => console.log(`Preview: http://localhost:${port}/uk/`));
