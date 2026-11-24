// Precios de Día Online. El navegador consulta /api/dia (función propia en Vercel),
// que a su vez consulta el catálogo de Día.

export const DIA_URL = 'https://diaonline.supermercadosdia.com.ar';
const searchCache = new Map();

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const formatPrice = (value) => currency.format(Math.round(Number(value) || 0));

// Arma una búsqueda útil a partir del nombre del ingrediente: sin aclaraciones entre paréntesis ni números.
export function productQuery(name) {
  return String(name ?? '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\d+([.,/]\d+)?\s*(kg|gr|g|ml|cc|l|u|un|unidades?)\b/gi, ' ')
    .replace(/[\d/.,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

async function requestDia(params, signal) {
  const response = await fetch(`/api/dia?${new URLSearchParams(params)}`, { signal });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No pudimos consultar los precios de Día.');
  return data.products ?? [];
}

export function searchDiaProducts(query, signal) {
  const key = productQuery(query).toLowerCase();
  if (key.length < 2) return Promise.resolve([]);
  if (!searchCache.has(key)) {
    const request = requestDia({ q: key }).catch((error) => { searchCache.delete(key); throw error; });
    searchCache.set(key, request);
  }
  const request = searchCache.get(key);
  if (!signal) return request;
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    request.then(resolve, reject);
  });
}

export const diaProductsById = (ids, signal) => requestDia({ ids: ids.join(',') }, signal);

// Datos del producto elegido que se guardan en Firestore (validados también en las reglas).
export function toSavedProduct(product, units = 1) {
  const cleanUnits = Math.min(99, Math.max(1, Math.round(Number(units) || 1)));
  const price = Number(product?.price);
  if (!product?.id || !product?.name || !(price >= 0)) throw new Error('El producto de Día no tiene datos válidos.');
  return {
    id: String(product.id).slice(0, 40),
    name: String(product.name).slice(0, 200),
    price,
    image: String(product.image ?? '').slice(0, 2048),
    link: String(product.link ?? DIA_URL).slice(0, 2048),
    units: cleanUnits,
  };
}

export const itemCost = (item) => (item?.product ? item.product.price * (item.product.units || 1) : 0);

export function shoppingTotals(items) {
  const pending = items.filter((item) => !item.completed);
  const pricedPending = pending.filter((item) => item.product);
  return {
    pendingTotal: pricedPending.reduce((sum, item) => sum + itemCost(item), 0),
    pendingCount: pending.length,
    pricedPendingCount: pricedPending.length,
    listTotal: items.reduce((sum, item) => sum + itemCost(item), 0),
    pricedCount: items.filter((item) => item.product).length,
  };
}

// Estimación para el detalle de receta: suma el primer resultado de cada ingrediente encontrado.
export function recipeEstimate(matches) {
  const found = matches.filter((match) => match?.product);
  return { total: found.reduce((sum, match) => sum + match.product.price, 0), found: found.length, count: matches.length };
}
