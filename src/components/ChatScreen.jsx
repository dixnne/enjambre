import { useState, useEffect } from 'preact/hooks';
import { ArrowLeftIcon } from './icons';
import { pinService } from '../services/firebase';

// --- Pantalla de Chat ---
export const ChatScreen = ({ pin, conversation, userId, onBack, onMarkAsRead }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Subscribe to messages in real-time
    useEffect(() => {
        if (!pin || !conversation) return;

        setLoading(true);
        const unsubscribe = pinService.subscribeToMessages(
            pin.id, 
            conversation.id, 
            (msgs) => {
                // Map messages to include correct sender
                const mappedMessages = msgs.map(msg => ({
                    ...msg,
                    sender: msg.senderId === userId ? 'me' : 'other'
                }));
                setMessages(mappedMessages);
                setLoading(false);
            }
        );

        // Mark as read when component mounts
        if (onMarkAsRead && conversation.unreadByOwner) {
            onMarkAsRead();
        }

        return () => unsubscribe();
    }, [pin, conversation, userId, onMarkAsRead]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !pin || !conversation) return;
        
        try {
            await pinService.addMessage(pin.id, conversation.id, {
                text: newMessage,
                sender: 'me',
                senderId: userId
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error al enviar el mensaje. Intenta de nuevo.');
        }
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
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">Cargando mensajes...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">No hay mensajes aún. ¡Envía el primero!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'me' ? 'bg-teal-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t bg-white flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow p-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button type="submit" className="ml-3 bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
        </div>
    );
};