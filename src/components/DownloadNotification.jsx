export const DownloadNotification = ({ progress, total, onToggleExpanded, isExpanded }) => {
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    
    // Compact view - small button
    if (!isExpanded) {
        return (
            <button 
                onClick={onToggleExpanded}
                className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center space-x-2 hover:bg-blue-600 transition-all"
            >
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-semibold text-sm">{percentage}%</span>
            </button>
        );
    }
    
    // Expanded view - full details
    return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-bold text-gray-800">Descargando mapa</p>
                </div>
                <button 
                    onClick={onToggleExpanded}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
                Radio de 3 km para uso sin conexión
            </p>
            <p className="text-lg font-semibold text-blue-600 mb-2">
                {progress} / {total} tiles ({percentage}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Zoom niveles: 13-16
            </p>
        </div>
    );
};