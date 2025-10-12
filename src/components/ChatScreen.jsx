import { useState } from 'preact/hooks';
import { ArrowLeftIcon } from './icons';

// --- Pantalla de Chat ---
export const ChatScreen = ({ pin, conversation, onBack }) => {
    // Si no hay una conversación específica, crea una simulación para usuarios que atienden un pin
    const initialMessages = conversation ? conversation.messages : [
        { id: 1, text: `Hola, vi tu pin de ${pin.category}. ¿Puedo ayudarte?`, sender: 'me' },
    ];
    
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim() === '') return;
        const userMessage = { id: Date.now(), text: newMessage, sender: 'me' };
        setMessages([...messages, userMessage]);
        setNewMessage('');

        // Simulación de respuesta automática
        setTimeout(() => {
            const reply = {id: Date.now() + 1, text: "¡Claro! Muchas gracias. ¿Dónde nos vemos?", sender: 'other'};
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    return (
        <div className="absolute inset-0 bg-white z-40 flex flex-col">
             <header className="p-4 flex items-center border-b bg-gray-50">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <div className="text-center flex-grow">
                    <h1 className="text-lg font-bold">{conversation ? conversation.userAlias : 'Chat Anónimo'}</h1>
                    <p className="text-sm text-gray-500">Coordinando ayuda para: {pin.category}</p>
                </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-3`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'me' ? 'bg-teal-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t bg-white flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow p-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button onClick={handleSend} className="ml-3 bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    );
};