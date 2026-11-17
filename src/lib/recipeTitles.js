import titles from './recipeTitles.es.json' with { type: 'json' };
import { spanishRecipes } from './spanishRecipes.js';

// Compatibilidad de nombres para favoritas anteriores al recetario completo.
// Las recetas activas toman su título de recipes.es.json.
const normalize = (value) => value.trim().toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const byOriginal = new Map(Object.values(titles).map(([original, translated]) => [normalize(original), translated]));

export function recipeTitle(meal) {
  const original = meal.strMeal?.trim() || '';
  return spanishRecipes[meal.idMeal]?.title || titles[meal.idMeal]?.[1] || byOriginal.get(normalize(original)) || 'Receta guardada';
}

