import { ingredientLabel, quantityLabel } from './ingredientLabels.js';
import { hasSpanishRecipe, localizeRecipe, matchingRecipeIds, spanishRecipes } from './spanishRecipes.js';

const API = 'https://www.themealdb.com/api/json/v1/1';

export const categories = [
  { id: '', label: 'Para inspirarte' },
  { id: 'Vegetarian', label: 'Vegetarianas' },
  { id: 'Chicken', label: 'Con pollo' },
  { id: 'Pasta', label: 'Pastas' },
  { id: 'Seafood', label: 'Del mar' },
  { id: 'Dessert', label: 'Algo dulce' },
];

export const ingredients = [
  { id: 'chicken', label: 'Pollo', image: 'Chicken' },
  { id: 'rice', label: 'Arroz', image: 'Rice' },
  { id: 'tomato', label: 'Tomate', image: 'Tomato' },
  { id: 'potatoes', label: 'Papa', image: 'Potatoes' },
  { id: 'salmon', label: 'Salmón', image: 'Salmon' },
  { id: 'eggs', label: 'Huevo', image: 'Egg' },
];

const translations = {
  pollo: 'chicken', arroz: 'rice', tomate: 'tomato', tomates: 'tomato',
  papa: 'potatoes', papas: 'potatoes', patata: 'potatoes', patatas: 'potatoes',
  salmon: 'salmon', huevo: 'eggs', huevos: 'eggs', carne: 'beef',
  cebolla: 'onion', ajo: 'garlic', queso: 'cheese', zanahoria: 'carrot',
  lentejas: 'lentils', garbanzos: 'chickpeas', cerdo: 'pork', espinaca: 'spinach',
  atun: 'tuna', champinones: 'mushrooms', berenjena: 'aubergine',
};

export function ingredientQuery(value) {
  const normalized = value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return translations[normalized] || normalized;
}

export function extractIngredients(meal) {
  if (meal.ingredients) return meal.ingredients.map((item) => ({ ...item }));
  return Array.from({ length: 20 }, (_, index) => ({
    name: ingredientLabel(meal[`strIngredient${index + 1}`] || ''),
    quantity: quantityLabel(meal[`strMeasure${index + 1}`] || ''),
  })).filter((item) => item.name);
}

export function categoryLabel(category) {
  const names = { Beef: 'Carnes', Breakfast: 'Desayunos', Goat: 'Cabrito', Lamb: 'Cordero', Miscellaneous: 'Para variar', Pork: 'Cerdo', Side: 'Acompañamientos', Starter: 'Entradas', Vegan: 'Veganas' };
  return categories.find((item) => item.id === category)?.label || names[category] || 'Receta para descubrir';
}

async function request(path, signal) {
  const timeout = AbortSignal.timeout(15000);
  try {
    const response = await fetch(`${API}/${path}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!response.ok) throw new Error('Error de respuesta');
    const data = await response.json();
    return Array.isArray(data.meals) ? data.meals : [];
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') throw error;
    throw new Error('No pudimos consultar las recetas. Revisá tu conexión y volvé a intentar.');
  }
}

export async function getRecipes(filter = {}, signal) {
  const ids = new Set(matchingRecipeIds(filter));
  if (!ids.size) return [];
  const sourceCategories = [...new Set([...ids].map((id) => spanishRecipes[id].category))];
  const lists = await Promise.all(sourceCategories.map((category) => request(`filter.php?c=${encodeURIComponent(category)}`, signal)));
  const meals = new Map(lists.flat().filter((meal) => ids.has(meal.idMeal)).map((meal) => [meal.idMeal, localizeRecipe(meal)]));
  // Intercalar categorías hace que la portada muestre opciones variadas.
  const groups = sourceCategories.map((category) => [...meals.values()].filter((meal) => meal.strCategory === category));
  return Array.from({ length: Math.max(0, ...groups.map((group) => group.length)) }, (_, index) => groups.map((group) => group[index]).filter(Boolean)).flat();
}

export async function getRecipe(id, signal) {
  if (!hasSpanishRecipe(id)) throw new Error('Esta receta no forma parte del recetario en español. Elegí otra desde Descubrir recetas.');
  const meals = await request(`lookup.php?i=${encodeURIComponent(id)}`, signal);
  const meal = meals.find((item) => item.idMeal === id);
  if (!meal) throw new Error('No encontramos esta receta. Probá con otra.');
  return localizeRecipe(meal);
}
