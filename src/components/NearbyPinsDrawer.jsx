import { CATEGORIES } from '../constants';

export const NearbyPinsDrawer = ({ drawerOpen, setDrawerOpen, filteredPins, handleAttend }) => {
    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-20 transition-transform duration-300 ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
            <div className="p-4 cursor-pointer" onClick={() => setDrawerOpen(!drawerOpen)}>
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto"></div>
                <h3 className="text-lg font-bold text-center mt-2">Pines Cercanos</h3>
            </div>
            <div className="px-4 pb-4 space-y-3 max-h-[30vh] overflow-y-auto">
            {filteredPins.filter(p => p.user !== 'me').map(pin => {
                const CategoryIcon = CATEGORIES[pin.category].icon;
                return (
                <div key={pin.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${pin.type === 'need' ? 'bg-orange-100' : 'bg-cyan-100'}`}>
                        <CategoryIcon className={`w-5 h-5 ${pin.type === 'need' ? 'text-orange-600' : 'text-cyan-600'}`} />
                    </div>
                    <div>
                        <p className="font-bold">{pin.category} <span className="font-normal text-gray-500">&bull; {pin.distance}</span></p>
                        <p className="text-sm text-gray-600">{pin.time}</p>
                    </div>
                    </div>
                    <button onClick={() => handleAttend(pin)} className="bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-teal-600">
                        Ayudar
                    </button>
                </div>
                );
            })}
            </div>
        </div>
    );
};