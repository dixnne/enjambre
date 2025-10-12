import { FilterIcon } from './icons';

export const Header = ({ isOnline, setIsOnline, setFilterPanelOpen, setView }) => {
    return (
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
            <div className="flex items-center space-x-2">
                <div 
                    onClick={() => setIsOnline(!isOnline)} 
                    className={`cursor-pointer px-3 py-1 rounded-full text-sm font-semibold text-white flex items-center transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                >
                    <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-white' : 'bg-gray-300'}`}></span>
                    {isOnline ? 'Online' : 'Offline'}
                </div>
                <button onClick={() => setFilterPanelOpen(true)} className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50 transition">
                    <FilterIcon className="w-5 h-5"/>
                </button>
            </div>
          <button onClick={() => setView('myPins')} className="bg-white px-4 py-2 rounded-full shadow-md font-semibold text-gray-700 hover:bg-gray-50 transition">
            Mis pines
          </button>
        </header>
    );
};