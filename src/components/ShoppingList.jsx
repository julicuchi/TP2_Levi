import { useState } from 'react';
import { Check, Pencil, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import { ingredientLabel, quantityLabel } from '../lib/ingredientLabels.js';

function ShoppingRow({ item: originalItem, kitchen }) {
  // También muestra en español compras anteriores, sin reescribir Firestore.
  const item = { ...originalItem, name: ingredientLabel(originalItem.name), quantity: quantityLabel(originalItem.quantity || '') };
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const save = async (event) => {
    event.preventDefault();
    if (await kitchen.editItem(item.id, name, quantity)) setEditing(false);
  };
  if (editing) return <li className="shopping-row"><form className="edit-item-form" onSubmit={save}>
    <input aria-label="Editar ingrediente" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} autoFocus />
    <input aria-label="Editar cantidad" value={quantity} onChange={(event) => setQuantity(event.target.value)} maxLength={60} />
    <button className="icon-button" type="submit" disabled={kitchen.busy || !name.trim()} aria-label="Guardar cambios"><Check size={20} /></button>
    <button className="icon-button" type="button" onClick={() => setEditing(false)} aria-label="Cancelar edición"><X size={20} /></button>
  </form></li>;
  return <li className={`shopping-row ${item.completed ? 'completed' : ''}`}>
    <input type="checkbox" checked={item.completed} disabled={kitchen.busy} onChange={() => kitchen.toggleItem(item)} aria-label={`Marcar ${item.name} como ${item.completed ? 'pendiente' : 'comprado'}`} />
    <div className="shopping-item-copy"><strong>{item.name}</strong><span>{item.quantity || 'Cantidad a elección'}</span></div>
    <button className="icon-button" disabled={kitchen.busy} onClick={() => { setName(item.name); setQuantity(item.quantity); setEditing(true); }} aria-label={`Editar ${item.name}`}><Pencil size={17} /></button>
    <button className="icon-button delete-button" disabled={kitchen.busy} onClick={() => kitchen.removeItem(item.id)} aria-label={`Eliminar ${item.name}`}><Trash2 size={17} /></button>
  </li>;
}

export default function ShoppingList({ kitchen, onExplore }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [filter, setFilter] = useState('all');
  const completed = kitchen.shopping.filter((item) => item.completed).length;
  const items = [...kitchen.shopping].filter((item) => filter === 'all' || (filter === 'done' ? item.completed : !item.completed)).sort((a, b) => Number(a.completed) - Number(b.completed) || a.name.localeCompare(b.name));
  const add = async (event) => {
    event.preventDefault();
    if (await kitchen.addItem(name, quantity)) { setName(''); setQuantity(''); }
  };

  return <section className="shopping-page">
    <div className="page-heading"><span className="eyebrow">MENOS VUELTAS, MÁS COCINA</span><h1>Tu lista, a mano<span>.</span></h1><p>Todo lo que te falta para tu próxima comida, en un solo lugar.</p></div>
    <div className="shopping-layout"><div className="shopping-panel">
      <form className="add-item-form" onSubmit={add}>
        <label>Ingrediente<input placeholder="Por ejemplo, tomates" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required disabled={kitchen.status !== 'ready'} /></label>
        <label>Cantidad<input placeholder="500 g, 2 unidades…" value={quantity} onChange={(event) => setQuantity(event.target.value)} maxLength={60} disabled={kitchen.status !== 'ready'} /></label>
        <button className="primary-button" disabled={kitchen.busy || kitchen.status !== 'ready' || !name.trim()}><Plus size={18} />Agregar</button>
      </form>
      <div className="shopping-filters" aria-label="Filtrar lista">{[['all', 'Todos'], ['pending', 'Pendientes'], ['done', 'Comprados']].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
      {kitchen.status === 'loading' ? <div className="empty-state" role="status"><span className="spinner" /><p>Cargando tu lista…</p></div> : items.length ? <ul className="shopping-items">{items.map((item) => <ShoppingRow key={item.id} item={item} kitchen={kitchen} />)}</ul> : <div className="empty-state"><ShoppingBasket size={38} strokeWidth={1.3} /><h3>{kitchen.shopping.length ? 'No hay ingredientes en este filtro' : 'Las buenas comidas empiezan acá'}</h3><p>{kitchen.status !== 'ready' ? 'Cuando tus listas estén conectadas, vas a poder guardar y organizar tus compras.' : 'Agregá un ingrediente o elegí los que te faltan desde una receta.'}</p><button className="secondary-button" onClick={onExplore}>Explorar recetas</button></div>}
    </div><aside className="shopping-summary"><span className="summary-icon"><ShoppingBasket size={28} /></span><h3>Un poquito más cerca<br />de cocinar rico.</h3><p>{completed} de {kitchen.shopping.length} ingredientes comprados</p><progress aria-label="Progreso de compras" max={kitchen.shopping.length || 1} value={completed} /><span className="small-note">Marcá cada ingrediente a medida que lo vas consiguiendo.</span></aside></div>
  </section>;
}
