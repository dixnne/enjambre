import { CATEGORIES } from '../constants';
import { ArrowLeftIcon } from './icons';

// --- Pantalla de "Pines que Atiendo" ---
export const AttendingPinsScreen = ({ attendingPins, onBack, onViewConversation }) => {
    
    const PinItem = ({pin}) => {
        const CategoryIcon = CATEGORIES[pin.category].icon;
        const typeClass = pin.type === 'need' ? 'text-orange-600' : 'text-cyan-600';
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                    <CategoryIcon className={`w-6 h-6 mr-4 ${typeClass}`} />
                    <div>
                        <p className="font-bold">{pin.category}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[150px]">{pin.description || 'Sin descripción'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={() => onViewConversation(pin)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Ver Conversación</button>
                </div>
            </div>
        )
    };

    return (
        <div className="absolute inset-0 bg-gray-100 z-20 flex flex-col">
            <header className="p-4 flex items-center border-b bg-white">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold mx-auto">Pines que Atiendo</h1>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-3">
                {
                    attendingPins.length > 0 ? 
                    attendingPins.map(pin => <PinItem key={pin.id} pin={pin} />) :
                    <p className="text-center text-gray-500 mt-8">No estás atendiendo ningún pin.</p>
                }
            </div>
        </div>
    )
};