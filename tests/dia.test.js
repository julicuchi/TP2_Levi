import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { buildIdsUrl, buildSearchUrl, cleanIds, cleanQuery, normalizeProduct, normalizeProducts, searchDia } from '../api/dia.js';

const vtexProduct = (overrides = {}) => ({
  productId: '141913',
  productName: ' Aceite Oliva Extra Virgen Dia 500 Ml. ',
  brand: 'DIA',
  link: '/aceite-oliva-extra-virgen-dia-500-ml-141913/p',
  items: [{
    images: [{ imageUrl: 'http://diaio.vtexassets.com/arquivos/ids/1/aceite.jpg' }],
    sellers: [{ sellerDefault: true, commertialOffer: { Price: 9600, ListPrice: 12000, AvailableQuantity: 50 } }],
  }],
  ...overrides,
});

test('normaliza un producto de Día con precio, oferta, imagen segura y link absoluto', () => {
  assert.deepEqual(normalizeProduct(vtexProduct()), {
    id: '141913',
    name: 'Aceite Oliva Extra Virgen Dia 500 Ml.',
    brand: 'DIA',
    price: 9600,
    listPrice: 12000,
    image: 'https://diaio.vtexassets.com/arquivos/ids/1/aceite.jpg',
    link: 'https://diaonline.supermercadosdia.com.ar/aceite-oliva-extra-virgen-dia-500-ml-141913/p',
  });
});

test('descarta productos sin stock o sin precio', () => {
  const sinStock = vtexProduct({ items: [{ images: [], sellers: [{ commertialOffer: { Price: 100, AvailableQuantity: 0 } }] }] });
  const sinPrecio = vtexProduct({ items: [{ images: [], sellers: [{ commertialOffer: { Price: 0, AvailableQuantity: 9 } }] }] });
  assert.deepEqual(normalizeProducts([sinStock, sinPrecio, vtexProduct()]).map((product) => product.id), ['141913']);
  assert.deepEqual(normalizeProducts(null), []);
});

test('no muestra precio de lista cuando no hay descuento', () => {
  const product = vtexProduct({ items: [{ images: [], sellers: [{ commertialOffer: { Price: 500, ListPrice: 500, AvailableQuantity: 3 } }] }] });
  assert.equal(normalizeProduct(product).listPrice, null);
});

test('valida la búsqueda y los IDs antes de consultar a Día', () => {
  assert.equal(cleanQuery('  carne   picada '), 'carne picada');
  assert.throws(() => cleanQuery('a'), /dos letras/);
  assert.throws(() => cleanQuery('x'.repeat(61)), /60/);
  assert.deepEqual(cleanIds('1, 2,2'), ['1', '2']);
  assert.throws(() => cleanIds('abc'), /productos/);
});

test('arma las URLs de búsqueda y de consulta por ID', () => {
  const search = new URL(buildSearchUrl('carne picada', 5));
  assert.equal(search.searchParams.get('query'), 'carne picada');
  assert.equal(search.searchParams.get('count'), '5');
  assert.deepEqual(new URL(buildIdsUrl(['1', '2'])).searchParams.getAll('fq'), ['productId:1', 'productId:2']);
});

test('searchDia informa cuando Día responde con error', async () => {
  const fakeFetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(searchDia('leche', fakeFetch), /503/);
  const okFetch = async () => ({ ok: true, json: async () => ({ products: [vtexProduct()] }) });
  assert.equal((await searchDia('leche', okFetch))[0].price, 9600);
});

test('la función responde 400 con un mensaje claro si la búsqueda es inválida', async () => {
  const response = await new Promise((resolve) => {
    const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(body) { resolve({ status: this.statusCode, body: JSON.parse(body) }); } };
    handler({ method: 'GET', url: '/api/dia?q=a' }, res);
  });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /dos letras/);
});
