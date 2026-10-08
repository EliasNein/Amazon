// Kleiner Server ohne Abhängigkeiten: liefert die Seiten aus und stellt die API bereit.
// Start: node server.js  (oder: npm start)
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = path.join(ROOT, 'backend', 'products.json');
const ORDERS_FILE = path.join(ROOT, 'backend', 'orders.json');

const DELIVERY_DAYS = {'1': 7, '2': 3, '3': 1};
const DAY_MS = 24 * 60 * 60 * 1000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// Prüft den Warenkorb und baut daraus eine Bestellung.
function createOrder(cart, products) {
  if (!Array.isArray(cart) || cart.length === 0) {
    return {error: 'Cart must be a non-empty array'};
  }

  const orderTime = new Date();
  const orderProducts = [];

  for (const item of cart) {
    if (!products.some((product) => product.id === item?.productId)) {
      return {error: `Unknown product: ${item?.productId}`};
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      return {error: 'Quantity must be an integer between 1 and 100'};
    }
    const days = DELIVERY_DAYS[item.deliveryOptionId];
    if (!days) {
      return {error: `Unknown delivery option: ${item.deliveryOptionId}`};
    }

    orderProducts.push({
      productId: item.productId,
      quantity: item.quantity,
      estimatedDeliveryTime: new Date(orderTime.getTime() + days * DAY_MS).toISOString()
    });
  }

  return {
    order: {
      id: crypto.randomUUID(),
      orderTime: orderTime.toISOString(),
      products: orderProducts
    }
  };
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api' && req.method === 'GET') {
    return sendText(res, 200, 'Amazon backend is running');
  }

  if (pathname === '/api/cart' && req.method === 'GET') {
    return sendText(res, 200, 'cart');
  }

  if (pathname === '/api/products' && req.method === 'GET') {
    return sendJson(res, 200, await readJson(PRODUCTS_FILE, []));
  }

  if (pathname === '/api/orders' && req.method === 'GET') {
    return sendJson(res, 200, await readJson(ORDERS_FILE, []));
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (error) {
      return sendJson(res, 400, {error: 'Invalid JSON'});
    }

    const products = await readJson(PRODUCTS_FILE, []);
    const {order, error} = createOrder(body?.cart, products);
    if (error) {
      return sendJson(res, 400, {error});
    }

    const orders = await readJson(ORDERS_FILE, []);
    orders.unshift(order);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return sendJson(res, 201, order);
  }

  return sendJson(res, 404, {error: 'Not found'});
}

// Nur die Website-Dateien ausliefern, nicht den Server-Code, backend/ oder Dotfiles (.git).
function isServable(relativePath) {
  const segments = relativePath.split(path.sep);
  if (segments.some((segment) => segment.startsWith('.'))) {
    return false;
  }
  return !['backend', 'node_modules'].includes(segments[0])
    && !['server.js', 'package.json', 'package-lock.json'].includes(relativePath);
}

async function handleStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendText(res, 405, 'Method not allowed');
  }

  let relativePath = path.normalize(decodeURIComponent(pathname)).replace(/^[\\/]+/, '');
  if (relativePath === '') {
    relativePath = 'amazon.html';
  }

  const filePath = path.join(ROOT, relativePath);
  if (!filePath.startsWith(ROOT + path.sep) || !isServable(relativePath)) {
    return sendText(res, 404, 'Not found');
  }

  try {
    const content = await fs.readFile(filePath);
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': type});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    sendText(res, 404, 'Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const {pathname} = new URL(req.url, `http://${req.headers.host}`);

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
    } else {
      await handleStatic(req, res, pathname);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      sendJson(res, 500, {error: 'Internal server error'});
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/amazon.html`);
});
