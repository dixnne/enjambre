import { useState, useEffect } from 'preact/hooks';
import { auth, onAuthStateChanged, signInAnonymously } from './firebase';
import { initialPins, CATEGORIES } from './constants';
import { Pin } from './components/Pin';
import { PinCreationModal } from './components/PinCreationModal';
import { PinInfoScreen } from './components/PinInfoScreen';
import { ConversationsListScreen } from './components/ConversationsListScreen';
import { ChatScreen } from './components/ChatScreen';
import { MyPinsScreen } from './components/MyPinsScreen';
import { FilterPanel } from './components/FilterPanel';
import { Header } from './components/Header';
import { ActionButtons } from './components/ActionButtons';
import { NearbyPinsDrawer } from './components/NearbyPinsDrawer';

function LoadingScreen() {
    return (
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse-slow">
                <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <h1 className="text-2xl font-bold text-gray-800 mt-4">Conectando a Enjambre</h1>
                <p className="text-gray-600 mt-2">Estableciendo conexión segura...</p>
            </div>
        </div>
    );
}

function ErrorScreen({ message }) {
    return (
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Error de Conexión</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <button onClick={() => window.location.reload()} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                Reintentar
            </button>
        </div>
    );
}

function AuthenticatedScreen({ userId, onContinue }) {
    return (
        <div className="h-screen w-screen bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-md w-full bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center text-white animate-fadeIn" style={{animationDelay: '0.2s'}}>
                <div className="w-24 h-24 mx-auto bg-green-500/80 rounded-full flex items-center justify-center animate-icon-pop-in" style={{animationDelay: '0.4s'}}>
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-5xl font-bold text-white mt-6 animate-fadeIn" style={{animationDelay: '0.6s'}}>Enjambre</h1>
                <p className="text-lg text-white/80 mt-2 animate-fadeIn" style={{animationDelay: '0.8s'}}>Estás conectado a la red de apoyo mutuo.</p>
                <div className="mt-8 bg-black/20 p-4 rounded-lg animate-fadeIn" style={{animationDelay: '1s'}}>
                    <p className="text-sm text-white/60">Tu identificador anónimo:</p>
                    <p className="text-lg font-mono text-white break-all mt-1">{userId}</p>
                </div>
                <button onClick={onContinue} className="mt-8 w-full bg-white/90 hover:bg-white text-orange-500 font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-transform duration-300 animate-fadeIn" style={{animationDelay: '1.2s'}}>
                    Continuar
                </button>
            </div>
        </div>
    );
}

function AuthenticatedApp({ userId }) {
  const [view, setView] = useState('map'); // map, myPins, pinInfo, conversations, chat
  const [pins, setPins] = useState(initialPins);
  const [pendingPins, setPendingPins] = useState([]);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  
  const initialFilters = {
      categories: Object.keys(CATEGORIES).reduce((acc, cat) => ({...acc, [cat]: true }), {}),
      type: 'all', // all, need, offer
      radius: 1.0 // in km
  };
  const [filters, setFilters] = useState(initialFilters);

  const userPins = pins.filter(p => p.user === 'me');

  useEffect(() => {
    // Sincronizar pines pendientes cuando se recupera la conexión
    if (isOnline && pendingPins.length > 0) {
      setTimeout(() => { // Simular delay de red
        setPins(prev => [...prev, ...pendingPins]);
        setPendingPins([]);
        alert('Conexión restablecida. ¡Tus pines pendientes han sido publicados!');
      }, 1000);
    }
  }, [isOnline, pendingPins]);


  const handlePublish = (pinData) => {
    const newPin = {
      ...pinData,
      id: Date.now(),
      location: { top: `${Math.random() * 60 + 20}%`, left: `${Math.random() * 80 + 10}%` },
      user: 'me',
      time: 'ahora',
      distance: '0.1 km',
      conversations: []
    };
    if (isOnline) {
      setPins([...pins, newPin]);
    } else {
      setPendingPins([...pendingPins, newPin]);
      alert('Sin conexión. El pin se guardó y se publicará cuando vuelvas a estar online.');
    }
  };
  
  const handlePinClick = (pin) => {
    setSelectedPin(pin);
    setView('pinInfo');
  };

  const handleResolvePin = (pinId) => {
    setPins(pins.filter(p => p.id !== pinId));
    goBackToMap();
  };
  
  const handleAttend = (pin) => {
    setSelectedPin(pin);
    setSelectedConversation(null); // Es un chat nuevo
    setView('chat');
  };

  const goBackToMap = () => {
    setSelectedPin(null);
    setSelectedConversation(null);
    setView('map');
  };
    
  const handleViewMyPin = (pin) => {
    setSelectedPin(pin);
    setView('pinInfo');
  };

  const handleViewConversations = (pin) => {
      setSelectedPin(pin);
      setView('conversations');
  };
  
  const handleSelectConversation = (conversation) => {
      setSelectedConversation(conversation);
      setView('chat');
  }

  const filteredPins = pins.filter(pin => {
      const distanceNum = parseFloat(pin.distance);
      if (distanceNum > filters.radius) return false;
      if (filters.type !== 'all' && pin.type !== filters.type) return false;
      if (!filters.categories[pin.category]) return false;
      return true;
  });
    
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col font-sans overflow-hidden">
      <div className="relative flex-grow w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/800x1200/e2e8f0/64748b?text=Mapa+de+la+Ciudad')"}}>
        
        <Header 
            isOnline={isOnline} 
            setIsOnline={setIsOnline} 
            setFilterPanelOpen={setFilterPanelOpen} 
            setView={setView} 
        />

        {filteredPins.map(pin => <Pin key={pin.id} pin={pin} onClick={handlePinClick}/>)}
        
        {view === 'map' && (
          <>
            <ActionButtons 
                drawerOpen={drawerOpen} 
                setOfferModalOpen={setOfferModalOpen} 
                setRequestModalOpen={setRequestModalOpen} 
            />
          
            <NearbyPinsDrawer 
                drawerOpen={drawerOpen} 
                setDrawerOpen={setDrawerOpen} 
                filteredPins={filteredPins} 
                handleAttend={handleAttend} 
            />
          </>
        )}
        
        {view === 'myPins' && <MyPinsScreen userPins={userPins} pendingPins={pendingPins} onBack={goBackToMap} onResolve={handleResolvePin} onViewPin={handleViewMyPin} />}
        {view === 'pinInfo' && selectedPin && <PinInfoScreen pin={selectedPin} onBack={goBackToMap} onAttend={handleAttend} isMyPin={selectedPin.user === 'me'} onResolve={handleResolvePin} onViewConversations={handleViewConversations} />}
        {view === 'conversations' && <ConversationsListScreen pin={selectedPin} onBack={() => setView('pinInfo')} onSelectConversation={handleSelectConversation} />}
        {view === 'chat' && <ChatScreen pin={selectedPin} conversation={selectedConversation} onBack={() => selectedPin.user === 'me' ? setView('conversations') : setView('pinInfo')} />}

      </div>

      {isRequestModalOpen && <PinCreationModal type="need" onClose={() => setRequestModalOpen(false)} onPublish={handlePublish} />}
      {isOfferModalOpen && <PinCreationModal type="offer" onClose={() => setOfferModalOpen(false)} onPublish={handlePublish} />}
      {isFilterPanelOpen && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setFilterPanelOpen(false)} onReset={() => setFilters(initialFilters)} />}
    </div>
  );
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [authCompleted, setAuthCompleted] = useState(false);

    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                signInAnonymously(auth).catch(err => {
                    console.error("Fallo el inicio de sesión anónimo:", err);
                    setError("No se pudo conectar a la red. Revisa tu conexión a internet.");
                    setLoading(false);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }
    if (error) {
        return <ErrorScreen message={error} />;
    }
    if (user) {
        if (authCompleted) {
            return <AuthenticatedApp userId={user.uid} />;
        }
        return <AuthenticatedScreen userId={user.uid} onContinue={() => setAuthCompleted(true)} />;
    }
    
    return <ErrorScreen message="Ha ocurrido un error inesperado." />;
}