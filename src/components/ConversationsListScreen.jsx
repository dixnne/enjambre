import { ArrowLeftIcon, UserIcon } from './icons';

// --- Pantalla de Lista de Conversaciones ---
export const ConversationsListScreen = ({ pin, onBack, onSelectConversation }) => {
    return (
        <div className="absolute inset-0 bg-gray-100 z-30 flex flex-col">
            <header className="p-4 flex items-center border-b bg-white">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <div className="text-center flex-grow">
                     <h1 className="text-xl font-bold">Conversaciones</h1>
                     <p className="text-sm text-gray-500">Para tu pin de {pin.category}</p>
                </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto space-y-3">
                {pin.conversations && pin.conversations.length > 0 ? (
                    pin.conversations.map(convo => (
                        <button key={convo.id} onClick={() => onSelectConversation(convo)} className="w-full bg-white p-4 rounded-lg shadow-sm flex items-center text-left hover:bg-gray-50">
                            <div className="p-3 bg-gray-200 rounded-full mr-4">
                                <UserIcon className="w-6 h-6 text-gray-600"/>
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold">{convo.userAlias}</p>
                                <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
                            </div>
                        </button>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-8">Nadie ha respondido a tu pin todavía.</p>
                )}
            </div>
        </div>
    )
}