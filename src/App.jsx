import { useState, useEffect } from 'preact/hooks';
import { CATEGORIES } from './constants';
import { pinService, userService } from './services/firebase';
import { PinCreationModal } from './components/PinCreationModal';
import { PinInfoScreen } from './components/PinInfoScreen';
import { ConversationsListScreen } from './components/ConversationsListScreen';
import { ChatScreen } from './components/ChatScreen';
import { MyPinsScreen } from './components/MyPinsScreen';
import { FilterPanel } from './components/FilterPanel';
import { Header } from './components/Header';
import { ActionButtons } from './components/ActionButtons';
import { NearbyPinsDrawer } from './components/NearbyPinsDrawer';
import Map from './components/Map';

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
  const [pins, setPins] = useState([]);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userAlias, setUserAlias] = useState(null);
  
  const initialFilters = {
      categories: Object.keys(CATEGORIES).reduce((acc, cat) => ({...acc, [cat]: true }), {}),
      type: 'all', // all, need, offer
      radius: 10.0 // in km
  };
  const [filters, setFilters] = useState(initialFilters);

  // Generate random coordinates near a base location
  const generateNearbyCoords = (baseCoords, maxDistanceKm) => {
    const [baseLat, baseLng] = baseCoords;
    // Rough conversion: 1 degree ≈ 111km
    const latOffset = (Math.random() - 0.5) * (maxDistanceKm / 111) * 2;
    const lngOffset = (Math.random() - 0.5) * (maxDistanceKm / (111 * Math.cos(baseLat * Math.PI / 180))) * 2;
    return [baseLat + latOffset, baseLng + lngOffset];
  };

  // Calculate distance between two coordinates in km
  const calculateDistance = (coords1, coords2) => {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize user profile
  useEffect(() => {
    const initUserProfile = async () => {
      try {
        let profile = await userService.getUserProfile(userId);
        if (!profile) {
          const alias = userService.generateUserAlias();
          await userService.updateUserProfile(userId, { alias });
          setUserAlias(alias);
        } else {
          setUserAlias(profile.alias);
        }
      } catch (error) {
        console.error('Error initializing user profile:', error);
        setUserAlias(userService.generateUserAlias());
      }
    };
    initUserProfile();
  }, [userId]);

  // Initialize pins subscription when map is ready
  const handleMapReady = ({ map, userLocation: userLoc }) => {
    setMapReady(true);
    setUserLocation(userLoc);
  };

  // Subscribe to pins from Firebase
  useEffect(() => {
    if (!mapReady) return;
    
    const unsubscribe = pinService.subscribeToPins((firestorePins) => {
      // Mark pins as 'me' or 'other' based on userId
      const pinsWithUser = firestorePins.map(pin => ({
        ...pin,
        user: pin.userId === userId ? 'me' : 'other'
      }));
      setPins(pinsWithUser);
    }, userLocation);

    return () => unsubscribe();
  }, [mapReady, userId, userLocation]);

  const userPins = pins.filter(p => p.user === 'me');

  const handlePublish = async (pinData) => {
    try {
      const baseLocation = userLocation || [51.505, -0.09];
      const newPinLocation = generateNearbyCoords(baseLocation, 0.1); // Very close to user
      
      const pinToCreate = {
        ...pinData,
        latLng: newPinLocation,
        time: 'ahora',
        distance: `${calculateDistance(baseLocation, newPinLocation).toFixed(1)} km`
      };

      if (isOnline) {
        await pinService.createPin(pinToCreate, userId);
        alert('¡Pin publicado exitosamente!');
      } else {
        alert('Sin conexión. Intenta de nuevo cuando tengas conexión.');
      }
    } catch (error) {
      console.error('Error publishing pin:', error);
      alert('Error al publicar el pin. Intenta de nuevo.');
    }
  };
  
  const handlePinClick = async (pin) => {
    // Load conversations if it's a user's pin
    if (pin.user === 'me') {
      try {
        const conversations = await pinService.getConversations(pin.id);
        setSelectedPin({ ...pin, conversations: conversations || [] });
      } catch (error) {
        console.error('Error loading conversations:', error);
        setSelectedPin({ ...pin, conversations: [] });
      }
    } else {
      setSelectedPin(pin);
    }
    setView('pinInfo');
  };

  const handleResolvePin = async (pinId) => {
    try {
      await pinService.resolvePin(pinId);
      alert('¡Pin resuelto exitosamente!');
      goBackToMap();
    } catch (error) {
      console.error('Error resolving pin:', error);
      alert('Error al resolver el pin. Intenta de nuevo.');
    }
  };
  
  const handleAttend = async (pin) => {
    // Check if user already has a conversation for this pin
    try {
      const conversations = await pinService.getConversations(pin.id);
      const existingConv = conversations.find(c => c.userId === userId);
      
      if (existingConv) {
        setSelectedPin({ ...pin, conversations });
        setSelectedConversation(existingConv);
        setView('chat');
      } else {
        // Create new conversation
        const initialMessage = '¡Hola! Vi tu pin y me gustaría ayudar.';
        const conversation = await pinService.addConversation(
          pin.id, 
          userId, 
          userAlias || 'Vecino#0000',
          initialMessage
        );
        setSelectedPin({ ...pin, conversations: [conversation] });
        setSelectedConversation(conversation);
        setView('chat');
      }
    } catch (error) {
      console.error('Error attending pin:', error);
      alert('Error al conectar con el pin. Intenta de nuevo.');
    }
  };

  const goBackToMap = () => {
    setSelectedPin(null);
    setSelectedConversation(null);
    setView('map');
  };
    
  const handleViewMyPin = async (pin) => {
    try {
      const conversations = await pinService.getConversations(pin.id);
      setSelectedPin({ ...pin, conversations: conversations || [] });
      setView('pinInfo');
    } catch (error) {
      console.error('Error loading pin conversations:', error);
      setSelectedPin({ ...pin, conversations: [] });
      setView('pinInfo');
    }
  };

  const handleViewConversations = async (pin) => {
    try {
      const conversations = await pinService.getConversations(pin.id);
      setSelectedPin({ ...pin, conversations: conversations || [] });
      setView('conversations');
    } catch (error) {
      console.error('Error loading conversations:', error);
      setSelectedPin({ ...pin, conversations: [] });
      setView('conversations');
    }
  };
  
  const handleSelectConversation = (conversation) => {
      setSelectedConversation(conversation);
      setView('chat');
  }

  const filteredPins = pins.filter(pin => {
      if (!pin.latLng || !userLocation) return true; // Show all if no location
      const distanceNum = calculateDistance(userLocation, pin.latLng);
      if (distanceNum > filters.radius) return false;
      if (filters.type !== 'all' && pin.type !== filters.type) return false;
      if (!filters.categories[pin.category]) return false;
      return true;
  });
    
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col font-sans overflow-hidden">
      <div className="relative flex-grow w-full h-full bg-cover bg-center">
        <Map pins={filteredPins} onPinClick={handlePinClick} onMapReady={handleMapReady} />
        
        <Header 
            isOnline={isOnline} 
            setIsOnline={setIsOnline} 
            setFilterPanelOpen={setFilterPanelOpen} 
            setView={setView} 
        />
        
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
        
        {view === 'myPins' && <MyPinsScreen userPins={userPins} pendingPins={[]} onBack={goBackToMap} onResolve={handleResolvePin} onViewPin={handleViewMyPin} />}
        {view === 'pinInfo' && selectedPin && <PinInfoScreen pin={selectedPin} onBack={goBackToMap} onAttend={handleAttend} isMyPin={selectedPin.user === 'me'} onResolve={handleResolvePin} onViewConversations={handleViewConversations} />}
        {view === 'conversations' && <ConversationsListScreen pin={selectedPin} onBack={() => setView('pinInfo')} onSelectConversation={handleSelectConversation} />}
        {view === 'chat' && <ChatScreen pin={selectedPin} conversation={selectedConversation} userId={userId} onBack={() => selectedPin.user === 'me' ? setView('conversations') : setView('pinInfo')} />}

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
        const auth = window.firebase.auth();
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                auth.signInAnonymously().catch(err => {
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
