// GitHub Pages project sites are served under /<repo-name>/ while Expo's web
// export emits root-absolute paths (e.g. "/assets/...", "/_expo/...").
// This script rewrites those paths and also generates PWA assets so the app
// can be installed and used offline.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SOURCE_ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const BASE_PATH = normalizeBasePath(process.argv[2] || '/tazkiyah');
const PWA_THEME_COLOR = '#000000';
const PWA_BG_COLOR = '#f6f5ef';

function normalizeBasePath(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed || trimmed === '/') return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, callback);
    else callback(fullPath);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getWebPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  return `${BASE_PATH}/${normalized}`.replace(/\/+/g, '/');
}

function rewriteRootAbsolutePaths(content) {
  return content
    .replaceAll('"/assets/', `"${BASE_PATH}/assets/`)
    .replaceAll("'/assets/", `'${BASE_PATH}/assets/`)
    .replaceAll('"/_expo/', `"${BASE_PATH}/_expo/`)
    .replaceAll("'/_expo/", `'${BASE_PATH}/_expo/`)
    .replaceAll('"/icons/', `"${BASE_PATH}/icons/`)
    .replaceAll("'/icons/", `'${BASE_PATH}/icons/`)
    .replaceAll('"/manifest.webmanifest"', `"${BASE_PATH}/manifest.webmanifest"`)
    .replaceAll("'/manifest.webmanifest'", `'${BASE_PATH}/manifest.webmanifest'`)
    .replaceAll('"/service-worker.js"', `"${BASE_PATH}/service-worker.js"`)
    .replaceAll("'/service-worker.js'", `'${BASE_PATH}/service-worker.js'`)
    .replaceAll('src="/_expo/', `src="${BASE_PATH}/_expo/`);
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([typeBuffer, data]));
  crc.writeUInt32BE(crcValue, 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createSolidPng(size, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const widthHeight = Buffer.alloc(13);
  widthHeight.writeUInt32BE(size, 0);
  widthHeight.writeUInt32BE(size, 4);
  widthHeight[8] = 8;
  widthHeight[9] = 6;
  widthHeight[10] = 0;
  widthHeight[11] = 0;
  widthHeight[12] = 0;

  const rowLength = size * 4 + 1;
  const raw = Buffer.alloc(rowLength * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLength;
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const pixel = rowStart + 1 + x * 4;
      raw[pixel] = rgba.r;
      raw[pixel + 1] = rgba.g;
      raw[pixel + 2] = rgba.b;
      raw[pixel + 3] = rgba.a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const ihdr = pngChunk('IHDR', widthHeight);
  const idat = pngChunk('IDAT', compressed);
  const iend = pngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function writePwaIcons() {
  const iconsDir = path.join(DIST_DIR, 'icons');
  ensureDir(iconsDir);

  const iconColor = { r: 20, g: 83, b: 45, a: 255 };
  const requiredIcons = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-180.png', size: 180 },
  ];

  for (const icon of requiredIcons) {
    const sourcePath = path.join(SOURCE_ICONS_DIR, icon.name);
    const targetPath = path.join(iconsDir, icon.name);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    } else {
      // Keep builds resilient if a custom icon is missing.
      fs.writeFileSync(targetPath, createSolidPng(icon.size, iconColor));
      console.warn(`[pwa] Missing ${icon.name} in public/icons, generated fallback icon.`);
    }
  }
}

function writeManifest() {
  const manifest = {
    id: `${BASE_PATH || '/'}${BASE_PATH ? '/' : ''}`,
    name: 'Tazkiyah',
    short_name: 'Tazkiyah',
    description: 'Track daily spiritual activities, monitor progress, and follow challenge rankings.',
    start_url: `${BASE_PATH || ''}/`,
    scope: `${BASE_PATH || ''}/`,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: PWA_THEME_COLOR,
    background_color: PWA_BG_COLOR,
    icons: [
      {
        src: `${BASE_PATH || ''}/icons/icon-192.png`,
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: `${BASE_PATH || ''}/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: `${BASE_PATH || ''}/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  fs.writeFileSync(
    path.join(DIST_DIR, 'manifest.webmanifest'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
}

function collectPrecacheUrls() {
  const cacheableExt = /\.(html|js|css|json|png|jpg|jpeg|svg|webp|ico|webmanifest)$/;
  const urls = new Set([`${BASE_PATH || ''}/`, `${BASE_PATH || ''}/index.html`]);

  walk(DIST_DIR, (filePath) => {
    const relative = path.relative(DIST_DIR, filePath);
    if (relative === 'service-worker.js' || relative === '.nojekyll') return;
    if (!cacheableExt.test(relative)) return;
    urls.add(getWebPath(relative));
  });

  return Array.from(urls).sort();
}

function writeServiceWorker() {
  const cacheName = `tazkiyah-pwa-${Date.now()}`;
  const precacheUrls = collectPrecacheUrls();
  const serviceWorkerPath = path.join(DIST_DIR, 'service-worker.js');
  const appShellPath = `${BASE_PATH || ''}/index.html`;

  const code = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};
const BASE_PATH = ${JSON.stringify(BASE_PATH || '')};
const EXPO_PATH = BASE_PATH + '/_expo/';
const ASSETS_PATH = BASE_PATH + '/assets/';
const ICONS_PATH = BASE_PATH + '/icons/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStaticAsset =
    url.pathname.startsWith(EXPO_PATH) ||
    url.pathname.startsWith(ASSETS_PATH) ||
    url.pathname.startsWith(ICONS_PATH);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }))
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(${JSON.stringify(appShellPath)})))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Tazkiyah Reminder', body: event.data.text() };
  }

  const title = payload.title || 'Tazkiyah Reminder';
  const options = {
    body: payload.body || '',
    icon: payload.icon || (BASE_PATH + '/icons/icon-192.png'),
    badge: payload.badge || (BASE_PATH + '/icons/icon-192.png'),
    tag: payload.tag || 'tazkiyah-reminder',
    data: payload.data || { url: BASE_PATH + '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || (BASE_PATH + '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(BASE_PATH) && 'focus' in client) {
          client.postMessage({ type: 'push-click', url: targetUrl });
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
`;

  fs.writeFileSync(serviceWorkerPath, code, 'utf8');
}

function injectHtmlPwaTags() {
  const htmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(htmlPath)) return;

  const original = fs.readFileSync(htmlPath, 'utf8');
  const manifestHref = `${BASE_PATH || ''}/manifest.webmanifest`;
  const appleIconHref = `${BASE_PATH || ''}/icons/icon-180.png`;
  const swPath = `${BASE_PATH || ''}/service-worker.js`;
  const swScope = `${BASE_PATH || ''}/`;

  let updated = original;
  if (!updated.includes('manifest.webmanifest')) {
    const headBlock = [
      `    <link rel="manifest" href="${manifestHref}" />`,
      `    <meta name="theme-color" content="${PWA_THEME_COLOR}" />`,
      '    <meta name="apple-mobile-web-app-capable" content="yes" />',
      '    <meta name="apple-mobile-web-app-status-bar-style" content="default" />',
      `    <link rel="apple-touch-icon" href="${appleIconHref}" />`
    ].join('\n');
    updated = updated.replace('</head>', `${headBlock}\n  </head>`);
  }

  if (!updated.includes('serviceWorker.register')) {
    const registrationScript = [
      '  <script>',
      "    if ('serviceWorker' in navigator && location.protocol === 'https:') {",
      '      window.addEventListener(\'load\', function () {',
      `        navigator.serviceWorker.register('${swPath}', { scope: '${swScope}' }).catch(function (error) {`,
      "          console.warn('Service worker registration failed:', error);",
      '        });',
      '      });',
      '    }',
      '  </script>'
    ].join('\n');

    updated = updated.replace('</body>', `${registrationScript}\n</body>`);
  }

  if (updated !== original) {
    fs.writeFileSync(htmlPath, updated, 'utf8');
  }
}

let filesChanged = 0;

walk(DIST_DIR, (filePath) => {
  if (!/\.(html|js|css)$/.test(filePath)) return;
  const original = fs.readFileSync(filePath, 'utf8');
  const rewritten = rewriteRootAbsolutePaths(original);
  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten);
    filesChanged++;
  }
});

writePwaIcons();
writeManifest();
injectHtmlPwaTags();
writeServiceWorker();

console.log(`Rewrote absolute paths with base "${BASE_PATH || '/'}" in ${filesChanged} file(s).`);
console.log('Generated PWA assets: manifest, icons, and service worker.');

// GitHub Pages runs Jekyll by default, which silently excludes directories
// starting with an underscore (e.g. "_expo/"). Disabling Jekyll preserves
// Expo bundle files in the published artifact.
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');
console.log('Added .nojekyll to disable Jekyll processing.');
