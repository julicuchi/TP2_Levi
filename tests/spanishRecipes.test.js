import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizeRecipe, matchingRecipeIds, spanishRecipes } from '../src/lib/spanishRecipes.js';
import { validateShoppingItem } from '../src/lib/shopping.js';

test('cada receta ofrecida tiene preparación completa y compras válidas para Firestore', () => {
  for (const [id, recipe] of Object.entries(spanishRecipes)) {
    assert.ok(recipe.title && recipe.area && recipe.category, id);
    assert.ok(recipe.steps.length >= 4, id + ': faltan pasos');
    assert.ok(recipe.ingredients.length >= 3, id + ': faltan ingredientes');
    const text = [recipe.title, recipe.area, ...recipe.steps, ...recipe.ingredients.flatMap((item) => [item.name, item.quantity])].join(' ');
    assert.doesNotMatch(text, /\b(the|preheat|serve|chopped|tbsp|tsp|tablespoons|teaspoons|garnish|step)\b/i, id);
    for (const item of recipe.ingredients) assert.doesNotThrow(() => validateShoppingItem(item.name, item.quantity));
  }
});

test('todas las categorías y accesos por ingrediente de la portada tienen opciones', () => {
  for (const category of ['Vegetarian', 'Chicken', 'Pasta', 'Seafood', 'Dessert']) {
    assert.ok(matchingRecipeIds({ category }).length >= 3, category);
  }
  for (const query of ['Pollo', 'Arroz', 'Tomate', 'Papa', 'Salmón', 'Huevo']) {
    assert.ok(matchingRecipeIds({ query }).length > 0, query);
  }
});

test('las respuestas sin traducción no llegan a pantalla y los datos locales no se mutan', () => {
  assert.equal(localizeRecipe({ idMeal: '99999', strInstructions: 'English instructions' }), null);
  const localized = localizeRecipe({ idMeal: '53322', strMeal: 'Flan', strMealThumb: 'photo' });
  localized.ingredients[0].name = 'Modificado';
  assert.equal(spanishRecipes['53322'].ingredients[0].name, 'Azúcar para el caramelo');
});
