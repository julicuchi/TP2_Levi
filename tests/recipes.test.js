import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { extractIngredients, getRecipe, getRecipes } from '../src/lib/recipes.js';
import { matchingRecipeIds, spanishRecipes } from '../src/lib/spanishRecipes.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('busca por ingredientes en español, tildes, plurales y sinónimos', () => {
  assert.deepEqual(matchingRecipeIds({ query: '  SALMÓN  ' }), ['52773', '52823', '52959', '52960']);
  assert.deepEqual(matchingRecipeIds({ query: 'PAPAS' }), matchingRecipeIds({ query: 'patatas' }));
  assert.deepEqual(matchingRecipeIds({ query: 'palta' }), matchingRecipeIds({ query: 'aguacate' }));
  assert.ok(matchingRecipeIds({ query: 'huevos' }).includes('53322'));
});

test('conserva la compatibilidad de ingredientes antiguos sin cantidades', () => {
  assert.deepEqual(extractIngredients({ strIngredient1: ' Rice ', strMeasure1: ' 100 g ', strIngredient2: ' ', strIngredient3: 'Salt', strMeasure3: null }), [
    { name: 'Arroz', quantity: '100 g' }, { name: 'Sal', quantity: '' },
  ]);
});

test('una respuesta vacía de la API no se reemplaza por recetas simuladas', async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken');
    return { ok: true, json: async () => ({ meals: null }) };
  };
  assert.deepEqual(await getRecipes({ query: 'pollo', mode: 'ingredient' }), []);
});

test('una consulta desconocida no se interpola en la URL', async () => {
  globalThis.fetch = async () => { assert.fail('No debe consultar con parámetros del usuario'); };
  assert.deepEqual(await getRecipes({ query: 'rice&i=chicken', mode: 'name' }), []);
});

test('un error HTTP se informa y no se presenta como resultado vacío', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(() => getRecipes({}), /No pudimos consultar/);
});

test('el detalle informa cuando una receta conocida desaparece de la API', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ meals: null }) });
  await assert.rejects(() => getRecipe('52849'), /No encontramos/);
});

test('no permite abrir recetas sin preparación revisada en español', async () => {
  globalThis.fetch = async () => { assert.fail('No debe descargar recetas sin traducción'); };
  await assert.rejects(() => getRecipe('00000'), /recetario en español/);
});

test('filtra el catálogo externo y localiza todas las partes del detalle', async () => {
  const source = { idMeal: '52849', strMeal: 'Spinach & Ricotta Cannelloni', strMealThumb: 'https://example.com/meal.jpg', strInstructions: 'Heat the oven. Serve.', strArea: 'Italian', strIngredient1: 'Spinach', strMeasure1: '1kg', strYoutube: 'https://www.youtube.com/watch?v=example' };
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ meals: [source, { idMeal: '99999', strMeal: 'Untranslated meal' }] }) });
  const results = await getRecipes({ category: 'Vegetarian' });
  assert.equal(results.length, 1);
  const detail = await getRecipe('52849');
  assert.equal(detail.strMeal, 'Canelones de espinaca y ricota');
  assert.equal(detail.strArea, 'Italia');
  assert.equal(detail.strMealThumb, source.strMealThumb);
  assert.match(detail.strInstructions, /Precalentá el horno a 200 °C/);
  assert.equal(detail.strYoutube, undefined);
  assert.equal(detail.strIngredient1, undefined);
  assert.deepEqual(extractIngredients(detail), spanishRecipes['52849'].ingredients);
  assert.equal(source.strInstructions, 'Heat the oven. Serve.');
});

test('respeta la cancelación de la búsqueda', async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_, options) => {
    assert.equal(options.signal.aborted, true);
    throw options.signal.reason;
  };
  await assert.rejects(() => getRecipes({ query: 'pollo' }, controller.signal), { name: 'AbortError' });
});

test('los errores de conexión tampoco filtran mensajes en inglés al detalle', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(() => getRecipe('52872'), /No pudimos consultar las recetas/);
});
