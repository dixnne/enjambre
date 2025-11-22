import { useState, useEffect } from 'preact/hooks';
import { pinService, userService } from './services/firebase';

const LiteLayout = ({ children }) => (
    <>
        <style>
            {`
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #fdfdfd;
                    margin: 0;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 1rem;
                }
                header {
                    background-color: #ffb400;
                    color: white;
                    padding: 1rem;
                    border-bottom: 1px solid #ddd;
                }
                header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                header button {
                    background: none;
                    border: none;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                }
                main {
                    padding: 1rem 0;
                }
                form {
                    background: white;
                    padding: 1.5rem;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                }
                form h2 {
                    margin-top: 0;
                }
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }
                input, select, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                    margin-bottom: 1rem;
                }
                button[type="submit"] {
                    width: 100%;
                    background-color: #ffb400;
                    color: white;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    background: white;
                    padding: 1rem;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .pin-header {
                    font-weight: bold;
                    font-size: 1.1rem;
                    text-transform: capitalize;
                }
                .pin-meta {
                    font-size: 0.9rem;
                    color: #666;
                    margin-top: 0.5rem;
                }
            `}
        </style>
        <div className="container">
            {children}
        </div>
    </>
);

const HeaderLite = ({ onShowMyPins }) => (
    <header>
        <div className="container flex justify-between items-center">
            <h1>Enjambre Lite</h1>
            <button onClick={onShowMyPins}>Mis Pines</button>
        </div>
    </header>
);

const PinFormLite = ({ onPublish }) => {
    const [type, setType] = useState('need');
    const [category, setCategory] = useState('food');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description) {
            alert('Por favor, ingresa una descripción.');
            return;
        }
        onPublish({ type, category, description });
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Crear un Pin</h2>
            <div>
                <label htmlFor="type">Tipo:</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="need">Necesito</option>
                    <option value="offer">Ofrezco</option>
                </select>
            </div>
            <div>
                <label htmlFor="category">Categoría:</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="food">Comida</option>
                    <option value="water">Agua</option>
                    <option value="shelter">Refugio</option>
                    <option value="medicine">Medicina</option>
                    <option value="tools">Herramientas</option>
                    <option value="volunteers">Voluntarios</option>
                </select>
            </div>
            <div>
                <label htmlFor="description">Descripción:</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
            </div>
            <button type="submit">Publicar Pin</button>
        </form>
    );
};

const PinListLite = ({ pins, title }) => (
    <section>
        <h2>{title}</h2>
        {pins.length === 0 ? (
            <p>No hay pines para mostrar.</p>
        ) : (
            <ul>
                {pins.map(pin => (
                    <li key={pin.id}>
                        <p className="pin-header">{pin.category}</p>
                        <p>{pin.description}</p>
                        <p className="pin-meta">
                            {pin.type === 'need' ? 'Necesita' : 'Ofrece'} - {pin.time}
                        </p>
                    </li>
                ))}
            </ul>
        )}
    </section>
);

const MyPinsScreenLite = ({ userPins, onBack }) => (
    <div>
        <button onClick={onBack} style={{ fontWeight: 'bold', color: '#ffb400', marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>{'< Volver'}</button>
        <PinListLite pins={userPins} title="Mis Pines Publicados" />
    </div>
);


export default function AppLite() {
    const [pins, setPins] = useState([]);
    const [userPins, setUserPins] = useState([]);
    const [userId, setUserId] = useState(null);
    const [view, setView] = useState('main'); // main, myPins

    useEffect(() => {
        const auth = window.firebase.auth();
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUserId(currentUser.uid);
            } else {
                auth.signInAnonymously().catch(err => console.error("Fallo el inicio de sesión anónimo:", err));
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = pinService.subscribeToPins((newPins) => {
            setPins(newPins);
            setUserPins(newPins.filter(p => p.user === 'me'));
        }, null, userId);
        return () => unsubscribe();
    }, [userId]);

    const handlePublish = async (pinData) => {
        if (!userId) {
            alert('Iniciando sesión... por favor espera.');
            return;
        }
        try {
            const pinToCreate = { ...pinData, latLng: [0, 0], time: 'ahora', distance: 'N/A' };
            await pinService.createPin(pinToCreate, userId);
            alert('¡Pin publicado exitosamente!');
        } catch (error) {
            console.error('Error publishing pin:', error);
            alert('Error al publicar el pin. Intenta de nuevo.');
        }
    };

    return (
        <LiteLayout>
            <HeaderLite onShowMyPins={() => setView('myPins')} />
            <main>
                {view === 'main' && (
                    <>
                        <PinFormLite onPublish={handlePublish} />
                        <PinListLite pins={pins} title="Pines Cercanos" />
                    </>
                )}
                {view === 'myPins' && (
                    <MyPinsScreenLite userPins={userPins} onBack={() => setView('main')} />
                )}
            </main>
        </LiteLayout>
    );
}
