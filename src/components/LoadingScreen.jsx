import { useState, useEffect } from 'preact/hooks';
import { HexagonIcon } from './icons';

const SURVIVAL_TIPS = [
  "En caso de emergencia, mantén la calma y evalúa la situación",
  "Siempre ten agua potable almacenada para 3 días mínimo",
  "Un silbato es más efectivo que gritar para pedir ayuda",
  "En terremotos: agacharse, cubrirse y aferrarse",
  "La regla de 3: 3 min sin aire, 3 días sin agua, 3 semanas sin comida",
  "Identifica las salidas de emergencia en edificios públicos",
  "Ten un kit de emergencia en casa: agua, comida, linterna, radio",
  "En caso de incendio, mantente bajo el humo gateando",
  "Conoce los números de emergencia locales",
  "Guarda copias digitales de documentos importantes",
  "En inundaciones: nunca camines en agua en movimiento",
  "Aprende primeros auxilios básicos, puede salvar vidas",
  "La comunidad es tu mejor recurso en emergencias",
  "Mantén cargado tu teléfono y ten baterías externas",
  "En apagones, usa linternas, nunca velas sin supervisión"
];

export function LoadingScreen({ message, progress, showProgress = false }) {
    const [tipIndex, setTipIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setTipIndex((prev) => (prev + 1) % SURVIVAL_TIPS.length);
                setFade(true);
            }, 300);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Hexagonal background pattern - optimized */}
            <div className="absolute inset-0 z-0 opacity-10">
                {[...Array(8)].map((_, i) => (
                    <HexagonIcon 
                        key={i} 
                        className="absolute text-yellow-300 animate-pulse" 
                        style={{
                            width: `${80 + i * 20}px`,
                            height: `${80 + i * 20}px`,
                            top: `${(i * 12) % 100}%`,
                            left: `${(i * 15) % 100}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: '4s'
                        }}
                    />
                ))}
            </div>

            <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center text-white relative z-10">
                <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Enjambre</h1>
                <p className="text-sm text-white/80 mb-6">Red de apoyo mutuo</p>
                
                {/* Loading dots */}
                <div className="flex justify-center items-center space-x-2 mb-6">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                
                {/* Status message */}
                <p className="text-base text-white font-medium mb-4">{message}</p>
                
                {/* Progress bar (optional) */}
                {showProgress && progress !== undefined && (
                    <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
                        <div 
                            className="bg-white h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
                
                {/* Survival tip */}
                <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">💡 Consejo de Supervivencia</p>
                    <p 
                        className={`text-sm text-white/90 min-h-[3rem] transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {SURVIVAL_TIPS[tipIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function LoadingSpinner({ size = 'md', message }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className={`${sizeClasses[size]} border-4 border-yellow-400 border-t-transparent rounded-full animate-spin`}></div>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </div>
    );
}
