import { CATEGORIES } from '../constants';
import { CloseIcon } from './icons';

// --- Panel de Filtros ---
export const FilterPanel = ({ filters, setFilters, onClose, onReset }) => {
    const handleCategoryChange = (category) => {
        setFilters(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: !prev.categories[category]
            }
        }));
    };

    const handleTypeChange = (e) => {
        setFilters(prev => ({ ...prev, type: e.target.value }));
    };
    
    const handleRadiusChange = (e) => {
        setFilters(prev => ({...prev, radius: parseFloat(e.target.value)}));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Filtros</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6 text-gray-700"/>
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold mb-3">Tipo</h3>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="type" value="all" checked={filters.type === 'all'} onChange={handleTypeChange} className="mr-2"/> Todos</label>
                        <label className="flex items-center"><input type="radio" name="type" value="need" checked={filters.type === 'need'} onChange={handleTypeChange} className="mr-2"/> Necesidades</label>
                        <label className="flex items-center"><input type="radio" name="type" value="offer" checked={filters.type === 'offer'} onChange={handleTypeChange} className="mr-2"/> Ofertas</label>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold mb-3">Categorías</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(CATEGORIES).map(cat => (
                            <label key={cat} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                                <input type="checkbox" checked={filters.categories[cat]} onChange={() => handleCategoryChange(cat)} className="mr-3 h-5 w-5"/>
                                {cat}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold mb-2">Radio de Búsqueda ({filters.radius} km)</h3>
                    <input type="range" min="0.2" max="5" step="0.1" value={filters.radius} onChange={handleRadiusChange} className="w-full"/>
                </div>
                
                <button onClick={onReset} className="w-full text-center py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100">
                    Restablecer filtros
                </button>
            </div>
        </div>
    );
};