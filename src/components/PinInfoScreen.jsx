import { CATEGORIES } from '../constants';
import { ArrowLeftIcon } from './icons';

// --- Pantalla de Detalles del Pin ---
export const PinInfoScreen = ({ pin, onBack, onAttend, isMyPin, onResolve, onViewConversations }) => {
    const isNeed = pin.type === 'need';
    const CategoryIcon = CATEGORIES[pin.category].icon;
    const categoryColor = isNeed ? 'bg-orange-100 text-orange-800' : 'bg-cyan-100 text-cyan-800';

    return (
        <div className="absolute inset-0 bg-gray-50 z-20 flex flex-col">
            <header className="p-4 flex items-center border-b">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold mx-auto">Detalles del Pin</h1>
            </header>
            <div className="flex-grow p-6">
                <div className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${categoryColor} mb-4`}>
                    <CategoryIcon className="w-5 h-5 mr-2" />
                    {pin.category}
                </div>
                <p className="text-gray-500 text-sm mb-4">Publicado {pin.time} &bull; a {pin.distance}</p>
                <p className="text-gray-800 text-lg bg-gray-100 p-4 rounded-lg">{pin.description || 'Sin descripción.'}</p>
            </div>
            <div className="p-4 border-t flex flex-col space-y-2">
                 {isMyPin ? (
                    <>
                        <button 
                            onClick={() => onViewConversations(pin)}
                            className="w-full py-3 rounded-lg bg-blue-500 text-white font-bold transition-colors hover:bg-blue-600"
                        >
                            Ver Conversaciones ({pin.conversations?.length || 0})
                        </button>
                        <button 
                            onClick={() => onResolve(pin.id)}
                            className="w-full py-3 rounded-lg bg-gray-200 text-gray-800 font-bold transition-colors hover:bg-gray-300"
                        >
                            Marcar como Resuelto
                        </button>
                    </>
                 ) : (
                    <button 
                      onClick={() => onAttend(pin)}
                      className={`w-full py-3 rounded-lg text-white font-bold transition-colors ${isNeed ? 'bg-orange-500 hover:bg-orange-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
                    >
                        {isNeed ? 'Atender Necesidad' : 'Contactar'}
                    </button>
                 )}
            </div>
        </div>
    );
};