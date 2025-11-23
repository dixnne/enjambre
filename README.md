# Enjambre: Red Ciudadana de Apoyo Mutuo

**Lema:** _"La ayuda está más cerca de lo que crees."_

##  Descripción del Proyecto

**Enjambre** es una Aplicación Web Progresiva (PWA) diseñada para conectar necesidades y recursos en situaciones de emergencia (como terremotos, inundaciones o crisis locales) durante las primeras 72 horas críticas. Permite a los vecinos organizarse de manera hiperlocal mediante un mapa interactivo, garantizando su funcionamiento incluso en condiciones de red inestables o nulas.

Este proyecto fue desarrollado como parte de la materia **Metodologías de Desarrollo de Sistemas** de la **Universidad Autónoma de Aguascalientes (UAA)**, utilizando un modelo de desarrollo híbrido (Cascada para la fase de planificación y Scrum para la construcción).

## ✨ Características Principales (MVP)

-   **📍 Geolocalización en Tiempo Real:** Visualización de "Pines de Necesidad" (Rojo) y "Pines de Oferta" (Azul) en un mapa interactivo.
-   **👤 Acceso Anónimo y Seguro:** Autenticación silenciosa con Firebase sin requerir datos personales, para agilizar la creación y respuesta a las solicitudes de ayuda.
-   **💬 Chat Privado:** Comunicación directa y segura entre el creador de un pin y quien ofrece ayuda, sin exponer números telefónicos ni información personal.
-   **🌐 Modo Offline (Offline-First):** Capacidad de visualizar el mapa, los pines y los datos cacheados sin conexión a internet, gracias a un Service Worker (`vite-plugin-pwa`) y la persistencia de tiles del mapa (`leaflet.offline`).
-   **📱 Diseño Responsivo (Mobile First):** Interfaz optimizada para una experiencia de usuario fluida en dispositivos móviles.

## 🛠️ Stack Tecnológico

-   **Frontend:** React (con Vite)
-   **Estilos:** CSS (con soporte para Tailwind CSS pre-configurado)
-   **Mapas:** Leaflet.js, OpenStreetMap, React-Leaflet
-   **Backend (BaaS):** Firebase (Authentication, Firestore)
-   **PWA:** Vite Plugin PWA (Service Workers + Web App Manifest)
-   **Persistencia Local:** IndexedDB (utilizado por `leaflet.offline` para los tiles del mapa)

## 📋 Pre-requisitos

-   Node.js (v16 o superior)
-   NPM o Yarn
-   Una cuenta de Google para configurar un proyecto de Firebase.

## 🚀 Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/dixnne/enjambre.git
    cd enjambre
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Firebase. Puedes obtenerlas desde la configuración de tu proyecto en la consola de Firebase.

    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=tu_proyecto
    VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id
    ```

## 💻 Uso

1.  **Ejecutar en modo desarrollo (con HTTPS):**
    El uso de HTTPS es requerido para que el navegador permita el acceso a la geolocalización.
    ```bash
    npm run dev
    ```

2.  **Compilar para Producción:**
    Este comando genera la carpeta `dist` con los archivos optimizados y el Service Worker.
    ```bash
    npm run build
    ```

3.  **Probar la PWA en local:**
    Para verificar que el Service Worker y la funcionalidad offline operan correctamente, ejecuta:
    ```bash
    npm run preview
    ```

## 📂 Estructura del Proyecto

El proyecto sigue una organización modular centrada en componentes y servicios.

```
/
├── /dist                 # Archivos de producción (generados con `npm run build`)
├── /public               # Archivos estáticos (íconos, manifest)
└── /src
    ├── /assets           # Recursos de imagen (SVGs, etc.)
    ├── /components       # Componentes reutilizables de React
    ├── /services         # Lógica de negocio y conexión con Firebase
    ├── App.jsx           # Componente raíz de la aplicación
    ├── main.jsx          # Punto de entrada de la aplicación
    └── constants.js      # Constantes globales
```

---

## 📄 Documentación Técnica

### Servicios (`src/services`)

-   **`firebase.js`**: Módulo central que encapsula toda la lógica de interacción con Firebase. Inicializa la aplicación y exporta las instancias de `db` (Firestore) y `auth` (Authentication) para ser usadas en el resto de la aplicación.

### Componentes Principales (`src/components`)

-   **`Map.jsx`**: Componente principal que renderiza el mapa de Leaflet. Es responsable de mostrar la ubicación del usuario, los pines de necesidad/oferta y manejar las interacciones del usuario con el mapa.
-   **`Pin.jsx`**: Representa un único marcador (pin) en el mapa. Su lógica cambia en función del tipo de pin (necesidad u oferta).
-   **`PinCreationModal.jsx`**: Modal que permite a los usuarios crear un nuevo pin. Contiene el formulario para seleccionar el tipo de pin, añadir una descripción y confirmar su ubicación.
-   **`PinInfoScreen.jsx`**: Pantalla que muestra los detalles de un pin seleccionado, incluyendo la descripción y el botón para iniciar una conversación.
-   **`ChatScreen.jsx`**: Interfaz de chat que permite la comunicación en tiempo real entre dos usuarios a través de Firestore.
-   **`ConversationsListScreen.jsx`**: Muestra la lista de conversaciones activas del usuario.
-   **`NearbyPinsDrawer.jsx`**: Un panel deslizable que muestra una lista de los pines cercanos a la ubicación actual del usuario, permitiendo un acceso rápido sin necesidad de explorar el mapa.
-   **`SetAliasScreen.jsx`**: Pantalla donde los nuevos usuarios configuran su alias la primera vez que usan la aplicación, antes de poder interactuar.
-   **`Header.jsx`**: Componente de encabezado que contiene la navegación principal y los botones de acción.
-   **`ActionButtons.jsx`**: Botones flotantes de acción rápida (ej. centrar mapa, crear pin).
-   **`DownloadNotification.jsx` / `ToastNotification.jsx`**: Componentes de UI para notificar al usuario sobre eventos importantes, como la disponibilidad de la instalación de la PWA o la descarga de mapas para uso offline.

---

## 🧑‍💻 Autores (Equipo Scrum)

-   **Diana Paola Narváez Martínez** - _Frontend & PWA Integration_
-   **Diego Sebastián Magdaleno Carrillo** - _Backend & Firestore Logic_
-   **Arely Zuleika Espino Dávalos** - _UI/UX Design & Maquetación_

Desarrollado con ❤️ para la comunidad.
