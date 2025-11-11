import { useEffect } from 'preact/hooks';
import { SuccessIcon, ErrorIcon, InfoIcon } from './icons';

const notificationTypes = {
    success: {
        icon: <SuccessIcon className="w-12 h-12 text-green-500" />,
        title: '¡Éxito!',
        buttonClass: 'bg-green-500 hover:bg-green-600',
    },
    error: {
        icon: <ErrorIcon className="w-12 h-12 text-red-500" />,
        title: 'Error',
        buttonClass: 'bg-red-500 hover:bg-red-600',
    },
    info: {
        icon: <InfoIcon className="w-12 h-12 text-blue-500" />,
        title: 'Información',
        buttonClass: 'bg-blue-500 hover:bg-blue-600',
    },
};

export const ToastNotification = ({ message, onClose, duration = 5000, type = 'info' }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const { icon, title, buttonClass } = notificationTypes[type] || notificationTypes.info;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl rounded-2xl p-8 flex flex-col items-center text-center max-w-sm w-full animate-fade-in-up">
                <div className="mb-4">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <button 
                    onClick={onClose} 
                    className={`text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClass}`}
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};
