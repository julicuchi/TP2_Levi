import recipes from './recipes.es.json' with { type: 'json' };

export const spanishRecipes = recipes;
export const hasSpanishRecipe = (id) => Object.hasOwn(recipes, id);

export const normalizeSearch = (text) => text.trim().toLocaleLowerCase('es')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');

const ingredientAliases = {
  patata: 'papa', patatas: 'papa', papas: 'papa', huevos: 'huevo', tomates: 'tomate',
  'aceite de oliva': 'aceite de oliva', mani: 'mani', aguacate: 'palta', aguacates: 'palta',
  mantequilla: 'manteca', alubias: 'poroto', frijoles: 'poroto', judias: 'poroto',
};

export function matchingRecipeIds({ query = '', mode = 'ingredient', category = '' } = {}) {
  const normalized = normalizeSearch(query);
  const term = mode === 'ingredient' ? (ingredientAliases[normalized] || normalized) : normalized;
  const words = term.split(' ').filter(Boolean);
  // Singularización sencilla para búsquedas habituales: papas, tomates, huevos.
  const singular = (word) => word.length > 3 ? word.replace(/s$/, '') : word;
  return Object.entries(recipes).filter(([, recipe]) => {
    if (category && recipe.category !== category) return false;
    if (!words.length) return true;
    if (mode === 'name') return words.every((word) => normalizeSearch(recipe.title).includes(word));
    return recipe.ingredients.some(({ name }) => {
      const text = normalizeSearch(name);
      return words.every((word) => text.includes(singular(word)));
    });
  }).map(([id]) => id);
}

// Única frontera entre la respuesta externa y las pantallas: nunca expone
// texto sin revisar. Las fotos y la existencia de la receta vienen de la API.
export function localizeRecipe(meal) {
  if (!hasSpanishRecipe(meal.idMeal)) return null;
  const recipe = recipes[meal.idMeal];
  return {
    idMeal: meal.idMeal,
    strMeal: recipe.title,
    strMealThumb: meal.strMealThumb || '',
    strCategory: recipe.category,
    strArea: recipe.area,
    strInstructions: recipe.steps.join('\n'),
    ingredients: recipe.ingredients.map((item) => ({ ...item })),
  };
}
