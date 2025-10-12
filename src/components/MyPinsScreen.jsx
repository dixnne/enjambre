import { useState } from 'preact/hooks';
import { CATEGORIES } from '../constants';
import { ArrowLeftIcon } from './icons';

// --- Pantalla de "Mis Pines" ---
export const MyPinsScreen = ({ userPins, pendingPins, onBack, onResolve, onViewPin }) => {
    const [activeTab, setActiveTab] = useState('published');
    
    const PinItem = ({pin, isPending = false}) => {
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
                {isPending ? (
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">PENDIENTE</span>
                ) : (
                    <div className="flex items-center space-x-3">
                        <button onClick={() => onViewPin(pin)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Ver</button>
                        <button onClick={() => onResolve(pin.id)} className="text-sm font-semibold text-teal-600 hover:text-teal-800">Resolver</button>
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="absolute inset-0 bg-gray-100 z-20 flex flex-col">
            <header className="p-4 flex items-center border-b bg-white">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold mx-auto">Mis Pines</h1>
            </header>

            <div className="p-4">
                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button onClick={() => setActiveTab('published')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${activeTab === 'published' ? 'bg-white shadow' : 'text-gray-600'}`}>
                        Publicados
                    </button>
                    <button onClick={() => setActiveTab('pending')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${activeTab === 'pending' ? 'bg-white shadow' : 'text-gray-600'}`}>
                        Pendientes ({pendingPins.length})
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-3">
                {activeTab === 'published' && (
                    userPins.length > 0 ? 
                    userPins.map(pin => <PinItem key={pin.id} pin={pin} />) :
                    <p className="text-center text-gray-500 mt-8">No tienes pines publicados.</p>
                )}
                 {activeTab === 'pending' && (
                    pendingPins.length > 0 ? 
                    pendingPins.map(pin => <PinItem key={pin.id} pin={pin} isPending={true} />) :
                    <p className="text-center text-gray-500 mt-8">No tienes pines pendientes de sincronizar.</p>
                )}
            </div>
        </div>
    )
};