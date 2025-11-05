import {
    FoodIcon,
    WaterIcon,
    MedicineIcon,
    ShelterIcon,
    ToolsIcon,
    VolunteersIcon
} from './components/icons';

export const initialPins = [
  // These will be updated with actual coordinates relative to user location
  { id: 1, type: 'need', category: 'Agua', description: 'Necesito agua embotellada para 2 personas.', user: 'other', distance: '0.3 km', time: 'hace 5m' },
  { id: 2, type: 'offer', category: 'Comida', description: 'Tengo comida enlatada para compartir.', user: 'other', distance: '0.8 km', time: 'hace 12m' },
  { id: 3, type: 'need', category: 'Medicina', description: 'Busco analgésicos para adulto.', user: 'other', distance: '1.2 km', time: 'hace 25m' },
  { id: 4, type: 'need', category: 'Refugio', description: 'Necesitamos un lugar seguro para pasar la noche.', user: 'other', distance: '1.5 km', time: 'hace 45m' },
  { 
    id: 5, type: 'need', category: 'Herramientas', description: 'Necesito una llave inglesa, por favor.', user: 'me', distance: '0.1 km', time: 'hace 2m',
    conversations: [
        { id: 'conv1', userAlias: 'Vecino#1234', lastMessage: 'Hola, creo que te puedo ayudar con eso.', messages: [{ id: 1, text: 'Hola, creo que te puedo ayudar con eso.', sender: 'other' }] },
        { id: 'conv2', userAlias: 'Vecina#5678', lastMessage: '¿Aún necesitas la llave?', messages: [{ id: 1, text: '¿Aún necesitas la llave?', sender: 'other' }] },
    ]
  },
];

export const CATEGORIES = {
    'Agua': { icon: WaterIcon, color: 'bg-blue-500' },
    'Comida': { icon: FoodIcon, color: 'bg-yellow-500' },
    'Refugio': { icon: ShelterIcon, color: 'bg-green-500' },
    'Medicina': { icon: MedicineIcon, color: 'bg-red-500' },
    'Herramientas': { icon: ToolsIcon, color: 'bg-gray-500' },
    'Voluntarios': { icon: VolunteersIcon, color: 'bg-purple-500' },
};