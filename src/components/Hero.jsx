import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const inspirations = [
  { category: 'Pasta', label: 'UN CLÁSICO DE CASA', name: 'Hoy pinta pasta.', image: 'pasta', color: 'peach' },
  { category: 'Vegetarian', label: 'LLENÁ EL PLATO DE COLOR', name: 'Un poquito más verde.', image: 'vegetarian', color: 'lilac' },
  { category: 'Seafood', label: 'SALÍ DE LO DE SIEMPRE', name: 'Un toque de mar.', image: 'seafood', color: 'blue' },
  { category: 'Dessert', label: 'EL MEJOR FINAL', name: 'Siempre hay lugar.', image: 'dessert', color: 'pink' },
];

export default function Hero({ onExplore, onCategory }) {
  const rail = useRef(null);
  const [position, setPosition] = useState({ overflow: false, start: true, end: false });

  useEffect(() => {
    const element = rail.current;
    const update = () => setPosition({
      overflow: element.scrollWidth > element.clientWidth + 2,
      start: element.scrollLeft < 2,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
    });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, []);
  const scroll = (direction) => {
    const distance = rail.current.firstElementChild?.getBoundingClientRect().width || 240;
    rail.current.scrollBy({ left: direction * (distance + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <section className="discovery-hero" aria-label="Inspiración para cocinar">
    <div className="discovery-heading">
      <div><span className="eyebrow">TU COCINA. TUS INGREDIENTES.</span><h1>Hoy se cocina <em>algo rico.</em></h1><p>Un poco de inspiración para aprovechar lo que ya tenés.</p></div>
      <button className="text-button discovery-explore" onClick={onExplore}>Explorar recetas <ArrowDown size={16} /></button>
    </div>
    <div className="inspiration-rail" ref={rail}>
      {inspirations.map((item) => <button key={item.category} className={`collection-card collection-${item.color}`} onClick={() => onCategory(item.category)}>
        <img src={`https://www.themealdb.com/images/category/${item.image}.png`} alt="" loading="eager" />
        <span className="collection-copy"><small>{item.label}</small><strong>{item.name}</strong></span>
        <span className="collection-arrow"><ArrowUpRight size={18} /></span>
      </button>)}
    </div>
    <div className="rail-caption"><span>Ideas ricas para cada antojo.</span>{position.overflow && <div className="rail-controls"><button disabled={position.start} onClick={() => scroll(-1)} aria-label="Ver propuestas anteriores"><ChevronLeft size={17} /></button><button disabled={position.end} onClick={() => scroll(1)} aria-label="Ver más propuestas"><ChevronRight size={17} /></button></div>}</div>
  </section>;
}
