import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Check, CircleAlert, Heart, LayoutGrid, Leaf, Search, ShoppingBasket, Sparkles, X } from 'lucide-react';
import Brand from './components/Brand';
import Hero from './components/Hero';
import RecipeCard from './components/RecipeCard';
import RecipeDialog from './components/RecipeDialog';
import ShoppingList from './components/ShoppingList';
import useKitchen from './hooks/useKitchen';
import { categories, getRecipes, ingredients } from './lib/recipes';

const navigation = [
  { id: 'explore', label: 'Descubrir recetas', icon: LayoutGrid },
  { id: 'favorites', label: 'Mis favoritas', icon: Heart },
  { id: 'shopping', label: 'Lista de compras', icon: ShoppingBasket },
];

export default function App() {
  const [page, setPage] = useState('explore');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const notify = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const kitchen = useKitchen(notify);
  const [searchText, setSearchText] = useState('');
  const [mode, setMode] = useState('ingredient');
  const [filter, setFilter] = useState({ query: '', mode: 'ingredient', category: '' });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const results = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setVisibleCount(6);
    getRecipes(filter, controller.signal).then((data) => {
      if (!controller.signal.aborted) setMeals(data.map((meal) => ({ ...meal, strCategory: meal.strCategory || filter.category })));
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.name === 'TimeoutError' ? 'Las recetas están tardando en llegar. Revisá tu conexión y reintentá.' : 'No pudimos cargar las recetas. Revisá tu conexión y volvé a intentar.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filter, retry]);

  const navigate = (destination) => { setPage(destination); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const scrollToRecipes = () => results.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  const search = (event) => {
    event.preventDefault();
    setPage('explore'); setFilter({ query: searchText.trim(), mode, category: '' });
  };
  const chooseIngredient = (ingredient) => {
    setSearchText(ingredient.label); setMode('ingredient');
    setFilter({ query: ingredient.label, mode: 'ingredient', category: '' });
    scrollToRecipes();
  };
  const clearSearch = () => { setSearchText(''); setFilter({ query: '', mode, category: '' }); };
  const chooseCategory = (category) => {
    setSearchText('');
    setFilter({ query: '', mode, category });
    scrollToRecipes();
  };
  const pending = kitchen.shopping.filter((item) => !item.completed).length;
  const favoriteMeals = kitchen.favorites.map((item) => ({ idMeal: item.id, strMeal: item.name, strMealThumb: item.image, strCategory: item.category }));

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <aside className="sidebar">
      <Brand onClick={() => navigate('explore')} />
      <p className="nav-label">TU COCINA</p>
      <nav aria-label="Navegación principal">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`nav-item ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined}><Icon size={20} strokeWidth={1.7} /><span>{label}</span>{id === 'shopping' && pending > 0 && <small>{pending}</small>}{id === 'favorites' && kitchen.favorites.length > 0 && <small>{kitchen.favorites.length}</small>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-icon"><Leaf size={25} strokeWidth={1.4} /></span><span className="eyebrow">PEQUEÑOS HÁBITOS</span><h3>Lo que tenés<br />puede ser<br /><em>algo buenísimo.</em></h3><p>Aprovechá tus ingredientes.<br />El primer paso ya lo tenés.</p><button className="note-link" onClick={() => { navigate('explore'); requestAnimationFrame(scrollToRecipes); }}>Buscá una idea <ArrowRight size={16} /></button></div>
        <div className="connection-status"><span className={`status-dot ${kitchen.status === 'ready' ? 'connected' : ''}`} />{kitchen.status === 'ready' ? 'Tus listas conectadas' : kitchen.status === 'loading' ? 'Conectando tus listas…' : 'Guardado sin conectar'}</div>
        <span className="sidebar-footer">Hecho para cocinar a tu manera.</span>
      </div>
    </aside>

    <main id="main-content">
      <header className="topbar"><div className="mobile-brand"><Brand compact onClick={() => navigate('explore')} /></div><div className="breadcrumb"><span>Tu espacio</span><span>/</span><strong>{navigation.find((item) => item.id === page)?.label}</strong></div><span className="topbar-signature"><Leaf size={15} /> El gusto de cocinar en casa.</span><button className="header-favorites" onClick={() => navigate('favorites')} aria-label="Ir a mis favoritas"><Heart size={19} /><span>Mi recetario</span></button></header>
      <div className="main-inner">
        {kitchen.status === 'unconfigured' && page !== 'explore' && <div className="setup-notice"><CircleAlert size={17} /><span>El guardado de tus listas todavía no está habilitado. Mientras tanto, podés explorar todas las recetas.</span></div>}
        {kitchen.status === 'error' && <div className="setup-notice error-notice" role="alert"><CircleAlert size={17} /><span>{kitchen.error}</span><button onClick={kitchen.retry}>Reintentar</button></div>}

        <div className="page-transition" key={page}>
        {page === 'explore' && <>
          <Hero onExplore={scrollToRecipes} onCategory={chooseCategory} />

          <section className="ingredient-section" aria-labelledby="ingredients-heading"><div className="section-heading"><div><span className="eyebrow">DE LA HELADERA AL PLATO</span><h2 id="ingredients-heading">¿Con qué arrancamos?</h2></div><span className="section-aside">Elegí algo que ya tengas.</span></div><div className="ingredient-options">{ingredients.map((ingredient, index) => <button key={ingredient.id} onClick={() => chooseIngredient(ingredient)} className={`ingredient-option ingredient-tone-${index} ${filter.mode === 'ingredient' && filter.query === ingredient.label ? 'active' : ''}`} aria-pressed={filter.mode === 'ingredient' && filter.query === ingredient.label}><span className="ingredient-image"><img src={`https://www.themealdb.com/images/ingredients/${ingredient.image}.png`} alt="" loading="lazy" /></span><span className="ingredient-name">{ingredient.label}<ArrowRight size={15} /></span></button>)}</div></section>

          <section className="recipes-section" ref={results} aria-labelledby="recipes-heading"><div className="section-heading"><div><span className="eyebrow">TU PRÓXIMA COMIDA FAVORITA</span><h2 id="recipes-heading">{filter.query ? `Ideas para “${filter.query}”` : 'Un menú de posibilidades'}</h2></div><span className="recipe-count" aria-live="polite">{loading ? 'Buscando…' : error ? 'Sin conexión' : `${meals.length} recetas`}</span></div>
            <form className="search-form" onSubmit={search}><Search size={21} aria-hidden="true" /><label className="sr-only" htmlFor="recipe-search">Buscar recetas</label><input id="recipe-search" placeholder={mode === 'ingredient' ? '¿Qué tenés en tu cocina? Probá con pollo…' : 'Buscá una receta: pollo, tortilla, panqueques...'} value={searchText} maxLength={100} onChange={(event) => setSearchText(event.target.value)} />{searchText && <button className="clear-search icon-button" type="button" onClick={clearSearch} aria-label="Limpiar búsqueda"><X size={17} /></button>}<label className="sr-only" htmlFor="search-mode">Buscar por</label><select id="search-mode" value={mode} onChange={(event) => setMode(event.target.value)}><option value="ingredient">Por ingrediente</option><option value="name">Por nombre</option></select><button className="search-submit" type="submit">Buscar <ArrowRight size={17} /></button></form>
            <p className="search-hint">Probá con pollo, arroz o tomate. Todas las recetas incluyen ingredientes y preparación en español.</p>
            <div className="category-tabs" aria-label="Categorías">{categories.map((category) => <button key={category.id} className={!filter.query && filter.category === category.id ? 'active' : ''} aria-pressed={!filter.query && filter.category === category.id} onClick={() => { setSearchText(''); setFilter({ query: '', mode, category: category.id }); }}>{category.id === '' && <Sparkles size={15} />}{category.label}</button>)}</div>
            {loading ? <div className="recipe-grid" role="status" aria-label="Cargando recetas">{Array.from({ length: 6 }, (_, index) => <div className="recipe-skeleton" key={index}><div /><span /><span /></div>)}</div> : error ? <div className="empty-state" role="alert"><CircleAlert size={36} /><h3>Las recetas se están haciendo esperar</h3><p>{error}</p><button className="primary-button" onClick={() => setRetry((value) => value + 1)}>Volver a intentar</button></div> : meals.length ? <><div className="recipe-grid">{meals.slice(0, visibleCount).map((meal, index) => <RecipeCard key={meal.idMeal} meal={meal} index={index} saved={kitchen.favorites.some((favorite) => favorite.id === meal.idMeal)} onOpen={setSelectedId} onSave={kitchen.toggleFavorite} busy={kitchen.busy} />)}</div>{visibleCount < meals.length && <div className="load-more"><button className="secondary-button" onClick={() => setVisibleCount((count) => count + 6)}>Un poco más de inspiración <ArrowDown size={17} /></button></div>}</> : <div className="empty-state"><Search size={36} /><h3>No encontramos recetas para esa búsqueda</h3><p>Probá con un ingrediente, como pollo o arroz, o con parte del nombre, como tortilla o panqueques.</p><button className="secondary-button" onClick={clearSearch}>Ver todas las recetas</button></div>}
          </section>
          <div className="bottom-tip"><span className="tip-icon"><BookOpen size={28} strokeWidth={1.4} /></span><div><span className="eyebrow">DEL «QUÉ COCINO» AL «YA ESTÁ»</span><strong>Tu próxima comida empieza con una lista.</strong><p>Elegí una receta y anotá lo que te falta. Nosotros te ayudamos a organizarte.</p></div><button className="secondary-button" onClick={() => navigate('shopping')}>Ir a mis compras <ArrowRight size={17} /></button></div>
          {kitchen.status === 'unconfigured' && <div className="setup-notice quiet-notice"><CircleAlert size={16} /><span>Podés explorar todas las recetas. El guardado de favoritas y compras todavía no está habilitado.</span></div>}
        </>}

        {page === 'favorites' && <section className="favorites-page"><div className="page-heading"><span className="eyebrow">PARA VOLVER A COCINAR</span><h1>Tus favoritas<span>.</span></h1><p>Esas recetas que merecen un lugar en tu mesa, una y otra vez.</p></div>{kitchen.status === 'loading' ? <div className="empty-state" role="status"><span className="spinner" /><p>Cargando tus favoritas…</p></div> : favoriteMeals.length ? <div className="recipe-grid">{favoriteMeals.map((meal, index) => <RecipeCard key={meal.idMeal} meal={meal} index={index} saved onOpen={setSelectedId} onSave={kitchen.toggleFavorite} busy={kitchen.busy} />)}</div> : <div className="empty-state favorites-empty"><Heart size={40} strokeWidth={1.2} /><h3>Tu recetario está por empezar</h3><p>{kitchen.status === 'ready' ? 'Tocá el corazón de una receta para guardarla acá.' : 'Podés explorar recetas. Para guardar tus favoritas, primero necesitamos conectar tus listas.'}</p><button className="primary-button" onClick={() => navigate('explore')}>Encontrar mi próxima favorita <ArrowRight size={17} /></button></div>}</section>}
        {page === 'shopping' && <ShoppingList kitchen={kitchen} onExplore={() => navigate('explore')} />}
        </div>
        <footer className="main-footer"><span>qué cocino<span className="brand-dot">.</span> <span className="footer-divider">/</span> Ideas ricas, días más simples.</span><a href="https://www.themealdb.com" target="_blank" rel="noreferrer">Recetas de TheMealDB <ArrowRight size={13} /></a></footer>
      </div>
    </main>
    {selectedId && <RecipeDialog id={selectedId} onClose={() => setSelectedId(null)} kitchen={kitchen} toast={toast} onDismissToast={() => setToast(null)} />}
    {toast && !selectedId && <div className={`toast ${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>{toast.type === 'error' ? <CircleAlert size={20} /> : <Check size={20} />}<span>{toast.message}</span><button className="icon-button" onClick={() => setToast(null)} aria-label="Cerrar aviso"><X size={17} /></button></div>}
  </div>;
}
