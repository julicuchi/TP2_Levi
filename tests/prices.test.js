import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, itemCost, productQuery, recipeEstimate, shoppingTotals, toSavedProduct } from '../src/lib/prices.js';

const product = { id: '1', name: 'Cebolla x Kg.', price: 2490, image: 'https://img/c.jpg', link: 'https://dia/c', brand: 'X', listPrice: null };

test('formatea precios en pesos argentinos sin decimales', () => {
  assert.match(formatPrice(2490), /\$\s?2\.490/);
  assert.match(formatPrice(0), /\$\s?0/);
});

test('arma la búsqueda a partir del ingrediente sin números ni aclaraciones', () => {
  assert.equal(productQuery('Tomates (en lata) 400 g'), 'Tomates');
  assert.equal(productQuery('Leche 1,5 l'), 'Leche');
  assert.equal(productQuery('Ajo'), 'Ajo');
  assert.equal(productQuery('  Carne   picada 500 '), 'Carne picada');
});

test('guarda solo los campos permitidos y limita las unidades entre 1 y 99', () => {
  assert.deepEqual(toSavedProduct(product, 3), { id: '1', name: 'Cebolla x Kg.', price: 2490, image: 'https://img/c.jpg', link: 'https://dia/c', units: 3 });
  assert.equal(toSavedProduct(product, 0).units, 1);
  assert.equal(toSavedProduct(product, 250).units, 99);
  assert.throws(() => toSavedProduct({ name: 'Sin id', price: 1 }), /válidos/);
});

test('calcula el total pendiente y cuántos ingredientes tienen precio', () => {
  const items = [
    { name: 'Cebolla', completed: false, product: { ...product, units: 2 } },
    { name: 'Ajo', completed: false },
    { name: 'Sal', completed: true, product: { ...product, price: 1190, units: 1 } },
  ];
  assert.equal(itemCost(items[0]), 4980);
  assert.deepEqual(shoppingTotals(items), { pendingTotal: 4980, pendingCount: 2, pricedPendingCount: 1, listTotal: 6170, pricedCount: 2 });
});

test('la estimación de una receta suma solo los ingredientes encontrados', () => {
  const estimate = recipeEstimate([{ product: { price: 100 } }, { product: null }, undefined, { product: { price: 50 } }]);
  assert.deepEqual(estimate, { total: 150, found: 2, count: 4 });
});
