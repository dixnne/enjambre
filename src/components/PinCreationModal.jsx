import { useState } from 'preact/hooks';
import { CATEGORIES } from '../constants';

// --- Modal para Crear Pines ---
const PinCreationModal = ({ type, onClose, onPublish }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const isNeed = type === 'need';

  const handleSubmit = () => {
    if (category) {
      onPublish({ type, category, description });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4">{isNeed ? 'Pedir Ayuda' : 'Ofrecer Ayuda'}</h2>
        <p className="text-center text-gray-500 mb-6">Selecciona una categoría para tu {isNeed ? 'necesidad' : 'oferta'}.</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Object.keys(CATEGORIES).map(cat => {
            const isSelected = category === cat;
            const categoryInfo = CATEGORIES[cat] || {};
            const CategoryIcon = categoryInfo.icon;
            return (
              <button key={cat} onClick={() => setCategory(cat)} className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border-2 ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                {CategoryIcon && <CategoryIcon className={`w-7 h-7 mb-2 ${isSelected ? 'text-teal-600' : 'text-gray-500'}`} />}
                <span className={`font-semibold text-xs ${isSelected ? 'text-teal-700' : 'text-gray-600'}`}>{cat}</span>
              </button>
            )
          })}
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          placeholder={`Descripción opcional (ej: ${isNeed ? '2 velas grandes' : '10 botellas de agua'})`}
          rows="3"
        />
        <div className="flex flex-col space-y-2">
          <button onClick={handleSubmit} className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300" disabled={!category}>
            Enviar
          </button>
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinCreationModal;