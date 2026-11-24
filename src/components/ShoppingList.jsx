import { useEffect, useState } from 'react';
import { Check, ExternalLink, Minus, Pencil, Plus, RefreshCw, ShoppingBasket, Store, Trash2, X } from 'lucide-react';
import DiaPicker from './DiaPicker';
import { ingredientLabel, quantityLabel } from '../lib/ingredientLabels.js';
import { DIA_URL, diaProductsById, formatPrice, itemCost, shoppingTotals } from '../lib/prices';

const shortDate = (timestamp) => timestamp?.toDate ? timestamp.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '';

function ProductSummary({ item, kitchen }) {
  const { product } = item;
  const units = product.units || 1;
  return <div className="row-product">
    <span className="row-product-image">{product.image ? <img src={product.image} alt="" loading="lazy" /> : <Store size={20} />}</span>
    <span className="row-product-copy">
      <a href={product.link} target="_blank" rel="noreferrer" className="row-product-name" title={`${product.name} (abre Día Online)`}>{product.name}<ExternalLink size={12} /></a>
      <span className="row-product-price"><strong>{formatPrice(itemCost(item))}</strong>{units > 1 && <small>{units} × {formatPrice(product.price)}</small>}{shortDate(product.checkedAt) && <small>Precio al {shortDate(product.checkedAt)}</small>}</span>
    </span>
    <span className="stepper" aria-label={`Unidades de ${product.name}`}>
      <button type="button" disabled={kitchen.busy || units <= 1} onClick={() => kitchen.changeUnits(item, units - 1)} aria-label="Quitar una unidad"><Minus size={14} /></button>
      <output aria-live="polite">{units}</output>
      <button type="button" disabled={kitchen.busy || units >= 99} onClick={() => kitchen.changeUnits(item, units + 1)} aria-label="Sumar una unidad"><Plus size={14} /></button>
    </span>
  </div>;
}

function ShoppingRow({ item: originalItem, kitchen, open, onToggle, index }) {
  // También muestra en español compras anteriores, sin reescribir Firestore.
  const item = { ...originalItem, name: ingredientLabel(originalItem.name), quantity: quantityLabel(originalItem.quantity || '') };
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [drawer, setDrawer] = useState(open);
  useEffect(() => { if (open) setDrawer(true); }, [open]);

  const save = async (event) => {
    event.preventDefault();
    if (await kitchen.editItem(item.id, name, quantity)) setEditing(false);
  };
  const choose = async (product) => { if (await kitchen.chooseProduct(originalItem, product)) onToggle(); };

  if (editing) return <li className="shopping-row"><form className="edit-item-form" onSubmit={save}>
    <input aria-label="Editar ingrediente" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} autoFocus />
    <input aria-label="Editar cantidad" value={quantity} onChange={(event) => setQuantity(event.target.value)} maxLength={60} />
    <button className="icon-button" type="submit" disabled={kitchen.busy || !name.trim()} aria-label="Guardar cambios"><Check size={20} /></button>
    <button className="icon-button" type="button" onClick={() => setEditing(false)} aria-label="Cancelar edición"><X size={20} /></button>
  </form></li>;

  return <li className={`shopping-row ${item.completed ? 'completed' : ''} ${open ? 'is-open' : ''}`} style={{ '--i': index }}>
    <div className="shopping-row-main">
      <input type="checkbox" checked={item.completed} disabled={kitchen.busy} onChange={() => kitchen.toggleItem(item)} aria-label={`Marcar ${item.name} como ${item.completed ? 'pendiente' : 'comprado'}`} />
      <div className="shopping-item-copy"><strong>{item.name}</strong><span>{item.quantity || 'Cantidad a elección'}</span></div>
      {item.product
        ? <ProductSummary item={item} kitchen={kitchen} />
        : <button className="price-cta" onClick={onToggle} aria-expanded={open}><Store size={16} />{open ? 'Cerrar precios' : 'Ver precios en Día'}</button>}
      <div className="row-actions">
        {item.product && <button className={`icon-button ${open ? 'active' : ''}`} onClick={onToggle} aria-expanded={open} aria-label={open ? 'Cerrar precios de Día' : `Cambiar el producto de ${item.name}`}><Store size={17} /></button>}
        <button className="icon-button" disabled={kitchen.busy} onClick={() => { setName(item.name); setQuantity(item.quantity); setEditing(true); }} aria-label={`Editar ${item.name}`}><Pencil size={17} /></button>
        <button className="icon-button delete-button" disabled={kitchen.busy} onClick={() => kitchen.removeItem(item.id)} aria-label={`Eliminar ${item.name}`}><Trash2 size={17} /></button>
      </div>
    </div>
    <div className={`price-drawer ${open ? 'open' : ''}`} inert={!open} onTransitionEnd={(event) => { if (event.target === event.currentTarget && !open) setDrawer(false); }}>
      <div className="price-drawer-inner">{drawer && <>
        <DiaPicker ingredient={item.name} chosenId={item.product?.id} busy={kitchen.busy} onChoose={choose} />
        {item.product && <button className="text-button remove-product" disabled={kitchen.busy} onClick={async () => { if (await kitchen.clearProduct(originalItem)) onToggle(); }}>Quitar el producto elegido</button>}
      </>}</div>
    </div>
  </li>;
}

export default function ShoppingList({ kitchen, onExplore }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const completed = kitchen.shopping.filter((item) => item.completed).length;
  const totals = shoppingTotals(kitchen.shopping);
  const items = [...kitchen.shopping].filter((item) => filter === 'all' || (filter === 'done' ? item.completed : !item.completed)).sort((a, b) => Number(a.completed) - Number(b.completed) || a.name.localeCompare(b.name));
  const withProduct = kitchen.shopping.filter((item) => item.product);
  const add = async (event) => {
    event.preventDefault();
    if (await kitchen.addItem(name, quantity)) { setName(''); setQuantity(''); }
  };
  const refresh = async () => {
    setRefreshing(true); setRefreshError('');
    try {
      const fresh = await diaProductsById(withProduct.map((item) => item.product.id));
      await kitchen.refreshPrices(withProduct, fresh);
    } catch (error) {
      setRefreshError(error.message);
    } finally { setRefreshing(false); }
  };

  return <section className="shopping-page">
    <div className="page-heading"><span className="eyebrow">MENOS VUELTAS, MÁS COCINA</span><h1>Tu lista, a mano<span>.</span></h1><p>Todo lo que te falta para tu próxima comida, con precios de Día para saber cuánto vas a gastar.</p></div>
    <div className="shopping-layout"><div className="shopping-panel">
      <form className="add-item-form" onSubmit={add}>
        <label>Ingrediente<input placeholder="Por ejemplo, tomates" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required disabled={kitchen.status !== 'ready'} /></label>
        <label>Cantidad<input placeholder="500 g, 2 unidades…" value={quantity} onChange={(event) => setQuantity(event.target.value)} maxLength={60} disabled={kitchen.status !== 'ready'} /></label>
        <button className="primary-button" disabled={kitchen.busy || kitchen.status !== 'ready' || !name.trim()}><Plus size={18} />Agregar</button>
      </form>
      <div className="shopping-filters" aria-label="Filtrar lista">{[['all', 'Todos'], ['pending', 'Pendientes'], ['done', 'Comprados']].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
      {kitchen.status === 'loading' ? <div className="empty-state" role="status"><span className="spinner" /><p>Cargando tu lista…</p></div> : items.length ? <ul className="shopping-items">{items.map((item, index) => <ShoppingRow key={item.id} item={item} index={index} kitchen={kitchen} open={openId === item.id} onToggle={() => setOpenId((current) => current === item.id ? null : item.id)} />)}</ul> : <div className="empty-state"><ShoppingBasket size={38} strokeWidth={1.3} /><h3>{kitchen.shopping.length ? 'No hay ingredientes en este filtro' : 'Las buenas comidas empiezan acá'}</h3><p>{kitchen.status !== 'ready' ? 'Cuando tus listas estén conectadas, vas a poder guardar y organizar tus compras.' : 'Agregá un ingrediente o elegí los que te faltan desde una receta.'}</p><button className="secondary-button" onClick={onExplore}>Explorar recetas</button></div>}
    </div>
    <aside className="shopping-summary">
      <div className="summary-total">
        <span className="summary-icon"><Store size={24} /></span>
        <span className="eyebrow">TOTAL ESTIMADO EN DÍA</span>
        <strong className="total-amount" key={totals.pendingTotal}>{formatPrice(totals.pendingTotal)}</strong>
        <p>{totals.pendingCount ? `${totals.pricedPendingCount} de ${totals.pendingCount} ${totals.pendingCount === 1 ? 'pendiente tiene' : 'pendientes tienen'} precio` : 'No quedan ingredientes pendientes'}</p>
      </div>
      <button className="secondary-button refresh-prices" disabled={!withProduct.length || refreshing || kitchen.busy} onClick={refresh}><RefreshCw size={16} className={refreshing ? 'spinning' : ''} />{refreshing ? 'Actualizando…' : 'Actualizar precios'}</button>
      {refreshError && <p className="summary-error" role="alert">{refreshError}</p>}
      <div className="summary-progress">
        <h3>Un poquito más cerca<br />de cocinar rico.</h3>
        <p>{completed} de {kitchen.shopping.length} ingredientes comprados</p>
        <progress aria-label="Progreso de compras" max={kitchen.shopping.length || 1} value={completed} />
      </div>
      <a className="dia-link" href={DIA_URL} target="_blank" rel="noreferrer">Ir a Día Online <ExternalLink size={14} /></a>
      <span className="small-note">Elegí un producto en cada ingrediente para estimar el total. Los precios se guardan al elegirlos: actualizalos antes de ir a comprar.</span>
    </aside></div>
  </section>;
}
