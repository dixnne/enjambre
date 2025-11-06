import { useState } from 'preact/hooks';

export const SetAliasScreen = ({ onAliasSet }) => {
    const [alias, setAlias] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (alias.trim() !== '') {
            onAliasSet(alias.trim());
        }
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center text-white">
                <h1 className="text-3xl font-bold text-white mt-6">¡Bienvenido a Enjambre!</h1>
                <p className="text-lg text-white/80 mt-2">¿Cómo te gustaría que te llamen?</p>
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center">
                    <input
                        type="text"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="Tu nombre o apodo"
                        className="w-full p-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                    />
                    <button type="submit" className="mt-4 bg-teal-500 text-white font-bold py-3 px-6 rounded-full hover:bg-teal-600 transition-colors">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};