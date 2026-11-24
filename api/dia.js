// Función serverless de Vercel: consulta el catálogo público de Día Online.
// Día no permite llamadas directas desde el navegador (no envía cabeceras CORS),
// por eso la app pide los precios a /api/dia y esta función los busca del lado del servidor.

export const DIA_ORIGIN = 'https://diaonline.supermercadosdia.com.ar';
const SEARCH_PATH = '/api/io/_v/api/intelligent-search/product_search/';
const IDS_PATH = '/api/catalog_system/pub/products/search';
const TIMEOUT_MS = 8000;
const MAX_RESULTS = 8;
const MAX_IDS = 30;

export function cleanQuery(value) {
  const query = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (query.length < 2) throw new RequestError('Escribí al menos dos letras para buscar en Día.');
  if (query.length > 60) throw new RequestError('La búsqueda puede tener hasta 60 caracteres.');
  return query;
}

export function cleanIds(value) {
  const ids = String(value ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!ids.length || ids.length > MAX_IDS || ids.some((id) => !/^\d{1,12}$/.test(id))) {
    throw new RequestError(`Indicá entre 1 y ${MAX_IDS} productos de Día.`);
  }
  return [...new Set(ids)];
}

export function buildSearchUrl(query, count = MAX_RESULTS) {
  const url = new URL(SEARCH_PATH, DIA_ORIGIN);
  url.searchParams.set('query', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('locale', 'es-AR');
  return url.toString();
}

export function buildIdsUrl(ids) {
  const url = new URL(IDS_PATH, DIA_ORIGIN);
  ids.forEach((id) => url.searchParams.append('fq', `productId:${id}`));
  return url.toString();
}

// Convierte un producto de la API de Día (plataforma VTEX) al formato que usa la app.
export function normalizeProduct(product) {
  const item = product?.items?.[0];
  const seller = item?.sellers?.find((option) => option.sellerDefault) ?? item?.sellers?.[0];
  const offer = seller?.commertialOffer;
  const price = Number(offer?.Price);
  if (!product?.productId || !product?.productName || !(price > 0) || !(Number(offer?.AvailableQuantity) > 0)) return null;
  const listPrice = Number(offer.ListPrice);
  const image = String(item.images?.[0]?.imageUrl ?? '').replace(/^http:/, 'https:');
  const link = String(product.link ?? '');
  return {
    id: String(product.productId),
    name: String(product.productName).trim().slice(0, 200),
    brand: String(product.brand ?? '').trim(),
    price,
    listPrice: listPrice > price ? listPrice : null,
    image: image.startsWith('https://') ? image : '',
    link: link.startsWith('/') ? `${DIA_ORIGIN}${link}` : link.startsWith(DIA_ORIGIN) ? link : DIA_ORIGIN,
  };
}

export function normalizeProducts(list, limit = MAX_RESULTS) {
  return (Array.isArray(list) ? list : []).map(normalizeProduct).filter(Boolean).slice(0, limit);
}

async function requestJson(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0 (proyecto educativo Que cocino)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new UpstreamError(`Día respondió con el estado ${response.status}.`);
  return response.json();
}

export async function searchDia(query, fetchImpl = fetch) {
  const data = await requestJson(buildSearchUrl(cleanQuery(query)), fetchImpl);
  return normalizeProducts(data?.products);
}

export async function productsByIds(ids, fetchImpl = fetch) {
  const clean = cleanIds(ids.join(','));
  const data = await requestJson(buildIdsUrl(clean), fetchImpl);
  return normalizeProducts(data, MAX_IDS);
}

export class RequestError extends Error { status = 400; }
export class UpstreamError extends Error { status = 502; }

function send(res, status, body, cache = 'no-store') {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', cache);
  res.end(JSON.stringify(body));
}

// Funciona igual en Vercel y en el servidor de desarrollo de Vite (ver vite.config.js).
export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Solo se permiten consultas GET.' });
  const params = new URL(req.url, 'http://localhost').searchParams;
  try {
    const products = params.has('ids')
      ? await productsByIds(params.get('ids').split(','))
      : await searchDia(params.get('q'));
    return send(res, 200, { source: 'Día Online', fetchedAt: new Date().toISOString(), products },
      'public, s-maxage=1800, stale-while-revalidate=3600');
  } catch (error) {
    if (error instanceof RequestError) return send(res, 400, { error: error.message });
    const timeout = error?.name === 'TimeoutError';
    return send(res, timeout ? 504 : 502, {
      error: timeout ? 'Día tardó demasiado en responder. Probá de nuevo en un momento.' : 'No pudimos consultar los precios de Día en este momento.',
    });
  }
}
