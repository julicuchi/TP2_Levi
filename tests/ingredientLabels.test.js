import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingredientLabel, quantityLabel } from '../src/lib/ingredientLabels.js';
import { extractIngredients } from '../src/lib/recipes.js';

test('usa nombres locales y admite mayúsculas y separadores de la API', () => {
  assert.equal(ingredientLabel('  CHICKEN   BREAST  '), 'Pechuga de pollo');
  assert.equal(ingredientLabel('Olive_Oil'), 'Aceite de oliva');
  assert.equal(ingredientLabel('Potatoes'), 'Papas');
  assert.equal(ingredientLabel('Butter'), 'Manteca');
  assert.equal(ingredientLabel('Avocado'), 'Palta');
});

test('conserva ingredientes desconocidos y nombres personalizados', () => {
  for (const name of ['Tomates de la huerta', 'Ras el hanout', 'constructor', '']) {
    assert.equal(ingredientLabel(` ${name} `), name);
  }
});

test('traduce medidas sin alterar números, fracciones ni palabras parecidas', () => {
  assert.equal(quantityLabel('1/2 cup'), '1/2 taza');
  assert.equal(quantityLabel('2 tbsp'), '2 cda.');
  assert.equal(quantityLabel('1½ tsp'), '1½ cdta.');
  assert.equal(quantityLabel('150ml'), '150ml');
  assert.equal(quantityLabel('2tsp'), '2cdta.');
  assert.equal(quantityLabel('To Taste'), 'a gusto');
  assert.equal(quantityLabel('2 finely chopped'), '2 finamente picado');
  assert.equal(quantityLabel('1 scallion'), '1 scallion');
});

test('extrae los datos que se muestran y se guardan en compras sin mutar la receta', () => {
  const meal = { strIngredient1: 'Olive Oil', strMeasure1: '2 tablespoons', strIngredient2: 'Garlic', strMeasure2: '3 cloves' };
  const original = structuredClone(meal);
  assert.deepEqual(extractIngredients(meal), [
    { name: 'Aceite de oliva', quantity: '2 cucharadas' },
    { name: 'Ajo', quantity: '3 dientes' },
  ]);
  assert.deepEqual(meal, original);
});

test('volver a mostrar compras traducidas no cambia nombres ni cantidades', () => {
  for (const name of ['Chicken', 'Butter', 'Salt', 'Tomates de la huerta']) {
    assert.equal(ingredientLabel(ingredientLabel(name)), ingredientLabel(name));
  }
  for (const quantity of ['2 tbsp', '1/2 cup', 'To Taste', '500 g', '2 unidades']) {
    assert.equal(quantityLabel(quantityLabel(quantity)), quantityLabel(quantity));
  }
});
