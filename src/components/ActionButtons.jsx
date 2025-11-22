import { HandIcon, PlusIcon } from './icons';

export const ActionButtons = ({ drawerOpen, setOfferModalOpen, setRequestModalOpen }) => {
    const isDrawerOpen = Boolean(drawerOpen);
    return (
        <div className={`absolute right-4 z-30 flex flex-col space-y-3 transition-all duration-300 ${isDrawerOpen ? 'bottom-[calc(30vh+1rem)]' : 'bottom-24'}`}>
            <button onClick={() => setOfferModalOpen(true)} className="bg-cyan-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-cyan-600 transition">
                <HandIcon className="w-7 h-7"/>
            </button>
            <button onClick={() => setRequestModalOpen(true)} className="bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition">
                <PlusIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};