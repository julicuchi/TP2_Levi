import { ArrowUpRight, Heart, Utensils } from 'lucide-react';
import { categoryLabel } from '../lib/recipes';
import { recipeTitle } from '../lib/recipeTitles.js';
import { hasSpanishRecipe, spanishRecipes } from '../lib/spanishRecipes.js';

export default function RecipeCard({ meal, index, saved, onOpen, onSave, busy }) {
  const title = recipeTitle(meal);
  const available = hasSpanishRecipe(meal.idMeal);
  const area = spanishRecipes[meal.idMeal]?.area || 'Guardada anteriormente';
  return <article className="recipe-card" style={{ '--delay': `${Math.min(index, 8) * 45}ms` }}>
    <button className="recipe-image-button" disabled={!available} onClick={() => onOpen(meal.idMeal)} aria-label={`Ver receta de ${title}`}>
      <img src={meal.strMealThumb} alt={title} loading="lazy" />
      <span className="image-overlay">{available ? 'Vamos a cocinar' : 'Fuera del recetario actual'} {available && <ArrowUpRight size={18} />}</span>
    </button>
    <button className={`save-button ${saved ? 'saved' : ''}`} disabled={busy} aria-label={`${saved ? 'Quitar de' : 'Guardar en'} favoritas: ${title}`} aria-pressed={saved} onClick={() => onSave(meal)}>
      <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
    </button>
    <div className="recipe-copy">
      <span className="recipe-category">{categoryLabel(meal.strCategory)}</span>
      <button className="recipe-title" disabled={!available} onClick={() => onOpen(meal.idMeal)}>{title}</button>
      <div className="recipe-bottom"><span><Utensils size={13} />{area}</span>{available && <button onClick={() => onOpen(meal.idMeal)} aria-label={`Abrir preparación de ${title}`}>Ver receta <ArrowUpRight size={15} /></button>}</div>
      {!available && <p className="small-note">Esta favorita quedó fuera del recetario en español. Podés quitarla con el corazón.</p>}
    </div>
  </article>;
}
