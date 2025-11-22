import { useState, useEffect, useRef } from 'preact/hooks';
import { lazy, Suspense } from 'preact/compat';
import { CATEGORIES } from './constants';
import { pinService, userService } from './services/firebase';
import { loadingTracker } from './services/loadingTracker';
import { SetAliasScreen } from './components/SetAliasScreen';
import { Header } from './components/Header';
import { ActionButtons } from './components/ActionButtons';
import { NearbyPinsDrawer } from './components/NearbyPinsDrawer';
import { ToastNotification } from './components/ToastNotification';
import { DownloadNotification } from './components/DownloadNotification';
import { LoadingScreen, LoadingSpinner } from './components/LoadingScreen';
import Map from './components/Map';

const PinCreationModal = lazy(() => import('./components/PinCreationModal'));
const PinInfoScreen = lazy(() => import('./components/PinInfoScreen'));
const AttendingPinsScreen = lazy(() => import('./components/AttendingPinsScreen'));
const ConversationsListScreen = lazy(() => import('./components/ConversationsListScreen'));
const ChatScreen = lazy(() => import('./components/ChatScreen'));
const MyPinsScreen = lazy(() => import('./components/MyPinsScreen'));
const FilterPanel = lazy(() => import('./components/FilterPanel'));

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



function AuthenticatedApp({ userId, userLocation, onMapReady }) {
  const [view, setView] = useState('map');
  const [pins, setPins] = useState([]);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingPins, setPendingPins] = useState(() => {
    const saved = localStorage.getItem('pendingPins');
    return saved ? JSON.parse(saved) : [];
  });
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userAlias, setUserAlias] = useState(null);
  const [isAliasLoading, setIsAliasLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [downloadState, setDownloadState] = useState({
    isDownloading: false,
    downloadProgress: 0,
    downloadTotal: 0,
    showDownloadComplete: false
  });
  const [isDownloadExpanded, setIsDownloadExpanded] = useState(false);

  // Debug download state changes
  useEffect(() => {
    console.log('App - downloadState updated:', downloadState);
  }, [downloadState]);

  // Auto-collapse download notification when it completes
  useEffect(() => {
    if (!downloadState.isDownloading && isDownloadExpanded) {
      setIsDownloadExpanded(false);
    }
  }, [downloadState.isDownloading, isDownloadExpanded]);
  
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
        if (profile && profile.alias) {
          setUserAlias(profile.alias);
        } else {
          setUserAlias(null);
        }
      } catch (error) {
        console.error('Error initializing user profile:', error);
        setUserAlias(null);
      } finally {
        setIsAliasLoading(false);
      }
    };
    initUserProfile();
  }, [userId]);

      const handleAliasSet = async (alias) => {
        try {
          await userService.updateUserProfile(userId, { alias });
          setUserAlias(alias);
          addNotification('¡Nombre guardado exitosamente!', 'success');
        } catch (error) {
          console.error('Error setting user alias:', error);
          addNotification('Error al guardar tu nombre. Intenta de nuevo.', 'error');
        }
      };  
    useEffect(() => {
      const unsubscribe = pinService.subscribeToPins((newPins) => {
        setPins(newPins);
      }, userLocation, userId);
  
      return () => unsubscribe();
    }, [userLocation]);
  
    // Subscribe to unread count
    useEffect(() => {
      const unsubscribe = pinService.subscribeToUnreadCount(userId, (count) => {
        setUnreadCount(count);
      });
  
      // Periodic refresh every 30 seconds as a fallback
      const refreshInterval = setInterval(() => {
        // The subscription will automatically update, but this ensures
        // we catch any missed updates
        pinService.subscribeToUnreadCount(userId, (count) => {
          setUnreadCount(count);
        });
      }, 30000);
  
      return () => {
        unsubscribe();
        clearInterval(refreshInterval);
      };
    }, [userId]);
  
    // Subscribe to new messages for notifications
    useEffect(() => {
      const unsubscribe = pinService.subscribeToNewMessages(userId, (notification) => {
        // Don't show notification if the conversation is currently open
        if (view === 'chat' && 
            selectedConversation && 
            selectedConversation.id === notification.conversationId &&
            selectedPin &&
            selectedPin.id === notification.pinId) {
          return; // Skip notification if this conversation is open
        }
  
        // Add notification to the list
        const newNotification = {
          id: `${notification.pinId}-${notification.conversationId}-${Date.now()}`,
          message: `${notification.userAlias} ha respondido a tu pin de ${notification.pinCategory}`
        };
        setNotifications(prev => [...prev, newNotification]);
      });
  
      return () => unsubscribe();
    }, [userId, view, selectedConversation, selectedPin]);
  
  
  
      useEffect(() => {
        // When app comes online, notify user of pending pins that were synced
        if (isOnline && pendingPins.length > 0) {
          addNotification(`¡Se han publicado ${pendingPins.length} de tus pines pendientes!`, 'success');
          
          // Clear pending pins
          setPendingPins([]);
          localStorage.removeItem('pendingPins');
        }
      }, [isOnline]);  
    const userPins = pins.filter(p => p.user === 'me');
    const attendingPins = pins.filter(p => p.attending);
  
      const addNotification = (message, type = 'info') => {
        const newNotification = {
          id: `notification-${Date.now()}`,
          message,
          type,
        };
        setNotifications(prev => [...prev, newNotification]);
      };
    
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
            addNotification('¡Pin publicado exitosamente!', 'success');
          } else {
            // Offline: add to pending queue
            const pendingPin = { ...pinToCreate, id: `pending-${Date.now()}` };
            const updatedPendingPins = [...pendingPins, pendingPin];
            setPendingPins(updatedPendingPins);
            localStorage.setItem('pendingPins', JSON.stringify(updatedPendingPins));
            addNotification('Sin conexión. Tu pin se publicará cuando vuelvas a estar en línea.', 'info');
          }
        } catch (error) {
          console.error('Error publishing pin:', error);
          addNotification('Error al publicar el pin. Intenta de nuevo.', 'error');
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
          addNotification('¡Pin resuelto exitosamente!', 'success');
          goBackToMap();
        } catch (error) {
          console.error('Error resolving pin:', error);
          addNotification('Error al resolver el pin. Intenta de nuevo.', 'error');
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
              userAlias,
              initialMessage
            );
            setSelectedPin({ ...pin, conversations: [conversation] });
            setSelectedConversation(conversation);
            setView('chat');
          }
        } catch (error) {
          console.error('Error attending pin:', error);
          addNotification('Error al conectar con el pin. Intenta de nuevo.', 'error');
        }
      };  const goBackToMap = () => {
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

  const handleMarkConversationAsRead = () => {
      // Mark as read when viewing the conversation
      if (selectedPin && selectedConversation && selectedConversation.unreadByOwner) {
        pinService.markConversationAsRead(selectedPin.id, selectedConversation.id);
      }
  };

  const handleViewConversation = (pin) => {
    handleAttend(pin);
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const filteredPins = pins.filter(pin => {
      if(pin.attending) return false; // Don't show pins the user is attending
      if (!pin.latLng || !userLocation) return true; // Show all if no location
      const distanceNum = calculateDistance(userLocation, pin.latLng);
      if (distanceNum > filters.radius) return false;
      if (filters.type !== 'all' && pin.type !== filters.type) return false;
      if (!filters.categories[pin.category]) return false;
      return true;
  });
    
  if (!userLocation || isAliasLoading) {
    return <LoadingScreen message={isAliasLoading ? "Cargando perfil..." : "Obteniendo ubicación..."} />;
  }

  if (!userAlias) {
    return <SetAliasScreen onAliasSet={handleAliasSet} />;
  }
    
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col font-sans overflow-hidden">
      <div className="relative flex-grow w-full h-full bg-cover bg-center">
        <Map 
          pins={filteredPins} 
          onPinClick={handlePinClick} 
          onMapReady={onMapReady} 
          userLocation={userLocation} 
          isOnline={isOnline}
          onDownloadStateChange={setDownloadState}
        />
        
        <Header 
            isOnline={isOnline} 
            setFilterPanelOpen={setFilterPanelOpen} 
            setView={setView}
            unreadCount={unreadCount}
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

            {/* Map Download Notifications - positioned above action buttons */}
            {downloadState.isDownloading && (
              <div className="absolute right-4 bottom-32 z-[9999] bg-red-500 p-4">
                <p style={{ color: 'white' }}>DOWNLOADING: {downloadState.downloadProgress}/{downloadState.downloadTotal}</p>
                <DownloadNotification 
                  progress={downloadState.downloadProgress} 
                  total={downloadState.downloadTotal}
                  isExpanded={isDownloadExpanded}
                  onToggleExpanded={() => setIsDownloadExpanded(!isDownloadExpanded)}
                />
              </div>
            )}
            {downloadState.showDownloadComplete && (
              <div className={`absolute right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl z-[70] animate-fadeIn transition-all duration-300 ${
                drawerOpen 
                  ? 'bottom-[calc(30vh+11.5rem)]'
                  : 'bottom-[10.5rem]'
              }`}>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <div>
                    <p className="font-bold">¡Mapa descargado!</p>
                    <p className="text-sm">Disponible sin conexión</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {view === 'myPins' && <Suspense fallback={<LoadingSpinner size="lg" message="Cargando tus pines..." />}><MyPinsScreen userPins={userPins} pendingPins={pendingPins} onBack={goBackToMap} onResolve={handleResolvePin} onViewPin={handleViewMyPin} /></Suspense>}
        {view === 'attending' && <Suspense fallback={<LoadingSpinner size="lg" message="Cargando..." />}><AttendingPinsScreen attendingPins={attendingPins} onBack={goBackToMap} onViewConversation={handleViewConversation} /></Suspense>}
        {view === 'pinInfo' && selectedPin && <Suspense fallback={<LoadingSpinner size="lg" message="Cargando..." />}><PinInfoScreen pin={selectedPin} onBack={goBackToMap} onAttend={handleAttend} isMyPin={selectedPin.user === 'me'} onResolve={handleResolvePin} onViewConversations={handleViewConversations} /></Suspense>}
        {view === 'conversations' && <Suspense fallback={<LoadingSpinner size="lg" message="Cargando..." />}><ConversationsListScreen pin={selectedPin} onBack={() => setView('pinInfo')} onSelectConversation={handleSelectConversation} /></Suspense>}
        {view === 'chat' && <Suspense fallback={<LoadingSpinner size="lg" message="Cargando chat..." />}><ChatScreen pin={selectedPin} conversation={selectedConversation} userId={userId} onBack={() => selectedPin.user === 'me' ? setView('conversations') : setView('pinInfo')} onMarkAsRead={handleMarkConversationAsRead} /></Suspense>}

      </div>

      {/* Toast Notifications */}
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <Suspense fallback={<div />}>
        {isRequestModalOpen && <PinCreationModal type="need" onClose={() => setRequestModalOpen(false)} onPublish={handlePublish} />}
        {isOfferModalOpen && <PinCreationModal type="offer" onClose={() => setOfferModalOpen(false)} onPublish={handlePublish} />}
        {isFilterPanelOpen && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setFilterPanelOpen(false)} onReset={() => setFilters(initialFilters)} />}
      </Suspense>
    </div>
  );
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('Iniciando...');

    useEffect(() => {
        const unsubscribe = loadingTracker.subscribe(({ progress, status }) => {
            setLoadingProgress(progress);
            setLoadingStatus(status);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const auth = window.firebase.auth();
        loadingTracker.markLoaded('firebase');
        
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                loadingTracker.markLoaded('auth');
                loadingTracker.markLoaded('firestore');
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

    const handleMapReady = ({ map, userLocation: loc }) => {
        setUserLocation(loc);
        loadingTracker.markLoaded('location');
        loadingTracker.markLoaded('map');
    };

    if (loading) {
        return <LoadingScreen message={loadingStatus} progress={loadingProgress} showProgress={true} />;
    }
    if (error) {
        return <ErrorScreen message={error} />;
    }
    if (user) {
        if (userLocation) {
            return <AuthenticatedApp userId={user.uid} userLocation={userLocation} onMapReady={handleMapReady} />;
        } else {
            return (
                <>
                    <LoadingScreen message={loadingStatus} progress={loadingProgress} showProgress={true} />
                    <div style={{display: 'none'}}>
                        <Map onMapReady={handleMapReady} pins={[]} />
                    </div>
                </>
            );
        }
    }
    
    return <ErrorScreen message="Ha ocurrido un error inesperado." />;
}
