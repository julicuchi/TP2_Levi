import { useEffect, useRef, useState } from 'react';
import { Check, CircleAlert, Heart, ShoppingBasket, Store, X } from 'lucide-react';
import { formatPrice, recipeEstimate, searchDiaProducts } from '../lib/prices';
import { categoryLabel, extractIngredients, getRecipe } from '../lib/recipes';
import { recipeTitle } from '../lib/recipeTitles.js';

// Busca en Día el primer producto de cada ingrediente marcado para estimar cuánto costaría comprarlo.
function useDiaMatches(names) {
  const [matches, setMatches] = useState({});
  const requested = useRef(new Set());
  const alive = useRef(true);
  const key = names.join('|');
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    names.forEach((name) => {
      if (requested.current.has(name)) return;
      requested.current.add(name);
      setMatches((old) => ({ ...old, [name]: { status: 'loading', product: null } }));
      searchDiaProducts(name)
        .then((products) => { if (alive.current) setMatches((old) => ({ ...old, [name]: { status: 'ready', product: products[0] ?? null } })); })
        .catch(() => {
          requested.current.delete(name); // se vuelve a intentar si se marca de nuevo
          if (alive.current) setMatches((old) => ({ ...old, [name]: { status: 'error', product: null } }));
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return matches;
}

export default function RecipeDialog({ id, onClose, kitchen, toast, onDismissToast }) {
  const dialog = useRef(null);
  const [meal, setMeal] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    if (!element.open) element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previous;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setMeal(null); setError(''); setSelected([]);
    getRecipe(id, controller.signal).then(setMeal).catch((err) => {
      if (!controller.signal.aborted) setError(err.name === 'TimeoutError' ? 'La receta tardó demasiado en cargar. Volvé a intentar.' : err.message);
    });
    return () => controller.abort();
  }, [id, retry]);

  const ingredientList = meal ? extractIngredients(meal) : [];
  const title = meal ? recipeTitle(meal) : '';
  const saved = kitchen.favorites.some((favorite) => favorite.id === id);
  const toggle = (index) => setSelected((old) => old.includes(index) ? old.filter((item) => item !== index) : [...old, index]);
  const selectedNames = selected.map((index) => ingredientList[index]?.name).filter(Boolean);
  const matches = useDiaMatches(selectedNames);
  const selectedMatches = selectedNames.map((name) => matches[name]);
  const estimate = recipeEstimate(selectedMatches);
  const searching = selectedMatches.some((match) => !match || match.status === 'loading');
  const addSelected = async () => {
    const items = selected.map((index) => ({ ...ingredientList[index], product: matches[ingredientList[index].name]?.product ?? null }));
    if (await kitchen.addIngredients(items)) setSelected([]);
  };

  return <dialog ref={dialog} className="recipe-dialog" aria-labelledby="recipe-heading" onCancel={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
    <button className="dialog-close icon-button" onClick={onClose} aria-label="Cerrar receta" autoFocus><X size={22} /></button>
    {!meal && !error && <div className="dialog-placeholder" role="status"><span className="spinner" /><h2 id="recipe-heading">Preparando tu receta…</h2></div>}
    {error && <div className="dialog-placeholder" role="alert"><h2 id="recipe-heading">No pudimos cargar la receta</h2><p>{error}</p><button className="primary-button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div>}
    {meal && <>
      <div className="detail-hero">
        <img src={meal.strMealThumb} alt={title} />
        <div><span className="eyebrow">HOY COCINAMOS</span><h2 id="recipe-heading">{title}</h2><div className="detail-tags"><span>{categoryLabel(meal.strCategory)}</span>{meal.strArea && <span>{meal.strArea}</span>}</div>
          <button className="secondary-button" disabled={kitchen.busy} onClick={() => kitchen.toggleFavorite(meal)}><Heart size={17} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Guardada en favoritas' : 'Guardar receta'}</button>
        </div>
      </div>
      <div className="detail-content">
        <div className="section-heading"><div><span className="eyebrow">DE LA RECETA A TU LISTA</span><h3>¿Qué te falta?</h3></div><ShoppingBasket size={26} /></div>
        <p className="muted">Marcá los ingredientes que necesitás comprar.</p>
        <button className="text-button select-all" onClick={() => setSelected(selected.length === ingredientList.length ? [] : ingredientList.map((_, index) => index))}>{selected.length === ingredientList.length ? 'Desmarcar todos' : 'Seleccionar todos'}</button>
        <div className="ingredient-checklist">{ingredientList.map((item, index) => {
          const isSelected = selected.includes(index);
          const match = matches[item.name];
          return <label key={index} className={isSelected ? 'selected' : ''}>
            <input type="checkbox" checked={isSelected} onChange={() => toggle(index)} />
            <span>{item.name}</span><small>{item.quantity}</small>
            {isSelected && match && <em className={`ingredient-price ${match.status}`}>{match.status === 'loading' ? 'Buscando en Día…' : match.product ? `Día ${formatPrice(match.product.price)}` : match.status === 'error' ? 'Sin conexión con Día' : 'Sin resultado en Día'}</em>}
          </label>;
        })}</div>
        {selected.length > 0 && <div className="recipe-estimate" aria-live="polite">
          <span className="recipe-estimate-icon"><Store size={20} /></span>
          <div><span>Comprar lo que marcaste en Día</span><strong key={estimate.total}>aprox. {formatPrice(estimate.total)}</strong>
            <small>{searching ? 'Buscando precios…' : `${estimate.found} de ${estimate.count} ingredientes con precio`} · se agrega el primer resultado de cada uno y podés cambiarlo en tu lista.</small></div>
        </div>}
        <button className="primary-button add-ingredients" disabled={!selected.length || kitchen.busy || kitchen.status !== 'ready'} onClick={addSelected}><ShoppingBasket size={18} />{kitchen.busy ? 'Guardando…' : `Agregar a compras${selected.length ? ` (${selected.length})` : ''}`}</button>
        {kitchen.status !== 'ready' && <p className="small-note">El guardado estará disponible cuando tus listas estén conectadas.</p>}
        <div className="preparation"><h3>Manos a la cocina</h3><p className="small-note">Seguí la preparación paso a paso.</p>
          <ol>{(meal.strInstructions || '').split(/\r?\n/).map((step) => step.trim()).filter(Boolean).map((step, index) => <li key={index}>{step}</li>)}</ol>
        </div>
        <p className="recipe-credit"><Check size={14} />Versión en español adaptada de <a href="https://www.themealdb.com" target="_blank" rel="noreferrer">TheMealDB</a></p>
      </div>
    </>}
    {toast && <div className={`dialog-toast ${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>{toast.type === 'error' ? <CircleAlert size={19} /> : <Check size={19} />}<span>{toast.message}</span><button className="icon-button" onClick={onDismissToast} aria-label="Cerrar aviso"><X size={17} /></button></div>}
  </dialog>;
}
