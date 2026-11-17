import { Soup } from 'lucide-react';

export default function Brand({ onClick, compact = false }) {
  return <button className={`brand ${compact ? 'brand-compact' : ''}`} onClick={onClick} aria-label="Qué cocino, ir al inicio">
    <span className="brand-icon"><Soup size={26} strokeWidth={1.6} /></span>
    <span className="brand-type">qué cocino<span className="brand-dot">.</span><small>DE TU COCINA, CON AMOR</small></span>
  </button>;
}
