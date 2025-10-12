import { CATEGORIES } from '../constants';

// --- Componente Pin en el Mapa ---
export const Pin = ({ pin, onClick }) => {
  const isNeed = pin.type === 'need';
  const categoryInfo = CATEGORIES[pin.category] || {};
  const baseClasses = "absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110";
  const colorClass = isNeed ? 'bg-orange-500' : 'bg-cyan-500';
  const animationClass = isNeed ? 'animate-pulse' : '';
  const CategoryIcon = categoryInfo.icon || 'div';

  return (
    <div style={pin.location} className={`${baseClasses} ${colorClass} ${animationClass}`} onClick={() => onClick(pin)}>
      <CategoryIcon className="w-5 h-5 text-white" />
    </div>
  );
};