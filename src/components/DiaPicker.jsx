import { useEffect, useState } from 'react';
import { Check, CircleAlert, ExternalLink, Search, Store } from 'lucide-react';
import { formatPrice, productQuery, searchDiaProducts } from '../lib/prices';

// Busca un ingrediente en Día Online y permite elegir el producto que se guarda en la lista.
export default function DiaPicker({ ingredient, chosenId, busy, onChoose }) {
  const [text, setText] = useState(() => productQuery(ingredient));
  const [query, setQuery] = useState(() => productQuery(ingredient));
  const [state, setState] = useState({ status: 'loading', products: [], error: '' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (query.length < 2) { setState({ status: 'ready', products: [], error: '' }); return undefined; }
    const controller = new AbortController();
    setState((old) => ({ ...old, status: 'loading', error: '' }));
    searchDiaProducts(query, controller.signal)
      .then((products) => setState({ status: 'ready', products, error: '' }))
      .catch((error) => { if (!controller.signal.aborted) setState({ status: 'error', products: [], error: error.message }); });
    return () => controller.abort();
  }, [query, retry]);

  const submit = (event) => { event.preventDefault(); setQuery(productQuery(text)); };

  return <div className="dia-picker">
    <div className="dia-picker-head">
      <span className="dia-badge"><Store size={15} />Precios de Día</span>
      <form className="dia-search" onSubmit={submit} role="search">
        <Search size={16} aria-hidden="true" />
        <label className="sr-only" htmlFor={`dia-search-${ingredient}`}>Buscar {ingredient} en Día</label>
        <input id={`dia-search-${ingredient}`} value={text} maxLength={60} onChange={(event) => setText(event.target.value)} placeholder="Buscá otra marca o presentación" />
        <button type="submit" className="text-button">Buscar</button>
      </form>
    </div>
    {state.status === 'loading' && <div className="dia-results" role="status" aria-label="Buscando precios en Día">{Array.from({ length: 4 }, (_, index) => <div className="dia-card dia-card-skeleton" key={index}><span /><span /><span /></div>)}</div>}
    {state.status === 'error' && <div className="dia-message" role="alert"><CircleAlert size={18} /><span>{state.error}</span><button className="text-button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div>}
    {state.status === 'ready' && !state.products.length && <div className="dia-message"><Search size={18} /><span>No encontramos «{query}» en Día. Probá con otra palabra, por ejemplo la marca o el tipo de producto.</span></div>}
    {state.status === 'ready' && state.products.length > 0 && <ul className="dia-results">{state.products.map((product, index) => {
      const chosen = product.id === chosenId;
      return <li key={product.id} className={`dia-card ${chosen ? 'chosen' : ''}`} style={{ '--i': index }}>
        <span className="dia-card-image">{product.image ? <img src={product.image} alt="" loading="lazy" /> : <Store size={26} />}</span>
        <span className="dia-card-name" title={product.name}>{product.name}</span>
        <span className="dia-card-price"><strong>{formatPrice(product.price)}</strong>{product.listPrice && <s>{formatPrice(product.listPrice)}</s>}</span>
        <span className="dia-card-actions">
          <button className={chosen ? 'secondary-button' : 'primary-button'} disabled={busy || chosen} onClick={() => onChoose(product)}>{chosen ? <><Check size={15} />Elegido</> : 'Elegir'}</button>
          <a className="icon-button" href={product.link} target="_blank" rel="noreferrer" aria-label={`Ver ${product.name} en Día Online`}><ExternalLink size={16} /></a>
        </span>
      </li>;
    })}</ul>}
    <p className="dia-footnote">Precios online de Día. Pueden variar según la sucursal y las promociones vigentes.</p>
  </div>;
}
