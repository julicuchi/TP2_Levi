import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { recipeTitle } from '../src/lib/recipeTitles.js';
import { getRecipes } from '../src/lib/recipes.js';
import { matchingRecipeIds } from '../src/lib/spanishRecipes.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('las tarjetas, detalles y favoritas antiguas usan el título del recetario actual', () => {
  const previousFavorite = { idMeal: '52872', strMeal: 'Spanish Tortilla' };
  assert.equal(recipeTitle(previousFavorite), 'Tortilla de papas');
  assert.equal(recipeTitle({ ...previousFavorite, strMeal: 'Tortilla española' }), 'Tortilla de papas');
  assert.equal(previousFavorite.strMeal, 'Spanish Tortilla');
});

test('conserva títulos de favoritas anteriores sin mostrar inglés desconocido', () => {
  assert.equal(recipeTitle({ idMeal: '53065', strMeal: 'Sushi' }), 'Sushi');
  assert.equal(recipeTitle({ idMeal: '99999', strMeal: 'New seasonal recipe' }), 'Receta guardada');
});

test('encuentra títulos parciales en español sin distinguir mayúsculas ni tildes', async () => {
  assert.deepEqual(matchingRecipeIds({ query: '  BOLONESA  ', mode: 'name' }), ['52770']);
  assert.deepEqual(matchingRecipeIds({ query: 'panqueques', mode: 'name' }), ['52854', '52855']);
  globalThis.fetch = async (url) => {
    assert.equal(url, 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert');
    return { ok: true, json: async () => ({ meals: [{ idMeal: '52854' }, { idMeal: '52855' }, { idMeal: '53322' }] }) };
  };
  const results = await getRecipes({ query: 'panqueques', mode: 'name' });
  assert.deepEqual(results.map((meal) => meal.strMeal), ['Panqueques caseros', 'Panqueques de banana']);
});
