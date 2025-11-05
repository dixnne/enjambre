# Firebase Firestore Setup for Enjambre

## Setting Up Firebase Database

### 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **enjambre-e27fd**
3. Click on **Firestore Database** in the left menu
4. Click **Create database**
5. Choose **Start in test mode** (for development) or **production mode**
   - Test mode rules (good for development):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```
6. Select a location (choose closest to your users)
7. Click **Enable**

### 2. Set Up Security Rules (Production)

For production, use these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pins collection
    match /pins/{pinId} {
      allow read: if true;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.resolved == false;
      allow update: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || 
                       request.resource.data.keys().hasOnly(['resolved', 'resolvedAt', 'updatedAt']));
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Conversations subcollection
      match /conversations/{conversationId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        
        // Messages subcollection
        match /messages/{messageId} {
          allow read: if true;
          allow create: if request.auth != null;
        }
      }
    }
  }
}
```

### 3. Create Indexes (if needed)

Go to **Firestore Database > Indexes** and create these composite indexes if prompted:

- Collection: `pins`
  - Fields: `resolved` (Ascending), `createdAt` (Descending)

## Database Structure

### Collections

#### `pins`
Stores all location-based help requests and offers.

```javascript
{
  id: "auto-generated",
  type: "need" | "offer",
  category: "Agua" | "Comida" | "Medicina" | "Refugio" | "Herramientas" | "Voluntarios",
  description: "string",
  userId: "string", // Firebase auth user ID
  latLng: [latitude, longitude],
  distance: "string", // "0.5 km"
  time: "string", // "hace 5m"
  resolved: false,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  resolvedAt: Timestamp | null
}
```

**Subcollections:**

##### `pins/{pinId}/conversations`
```javascript
{
  id: "auto-generated",
  userAlias: "string", // "Vecino#1234"
  userId: "string",
  lastMessage: "string",
  lastMessageAt: Timestamp,
  createdAt: Timestamp
}
```

##### `pins/{pinId}/conversations/{convId}/messages`
```javascript
{
  id: "auto-generated",
  text: "string",
  sender: "me" | "other",
  senderId: "string",
  createdAt: Timestamp
}
```

#### `users`
Stores user profiles.

```javascript
{
  id: "userId",
  alias: "string", // "Vecino#1234"
  lastActive: Timestamp
}
```

## Using the Firebase Service in Your App

### Import the service

```javascript
import { pinService, userService } from './services/firebase';
```

### Example Usage

#### Create a new pin
```javascript
const newPin = await pinService.createPin({
  type: 'need',
  category: 'Agua',
  description: 'Necesito agua para 3 personas',
  userId: currentUser.uid,
  latLng: [40.7128, -74.0060],
  distance: '0.1 km',
  time: 'ahora',
  resolved: false
});
```

#### Subscribe to pins in real-time
```javascript
const unsubscribe = pinService.subscribeToPins((pins) => {
  console.log('Pins updated:', pins);
  setPins(pins);
});

// Later, unsubscribe
unsubscribe();
```

#### Resolve a pin
```javascript
await pinService.resolvePin(pinId);
```

#### Add a conversation
```javascript
const conversation = await pinService.addConversation(pinId, {
  userAlias: 'Vecino#1234',
  userId: currentUser.uid,
  lastMessage: 'Hola, puedo ayudarte',
  lastMessageAt: new Date()
});
```

#### Send a message
```javascript
await pinService.addMessage(pinId, conversationId, {
  text: 'Hola, ¿sigues necesitando ayuda?',
  sender: 'me',
  senderId: currentUser.uid
});
```

## Features

✅ **Real-time updates** - Changes sync automatically across all connected clients
✅ **Offline support** - Works offline and syncs when connection is restored
✅ **Security** - Firebase security rules protect user data
✅ **Scalable** - Firestore scales automatically with your user base
✅ **Geolocation** - Store and query location-based data

## Next Steps

To integrate this into your app:

1. Enable Firestore in Firebase Console
2. Update `App.jsx` to use `pinService.subscribeToPins()` instead of local state
3. Replace `handlePublish()` to use `pinService.createPin()`
4. Replace `handleResolvePin()` to use `pinService.resolvePin()`
5. Update conversation and chat components to use Firebase services

## Notes

- The Firestore CDN is already added to `index.html`
- Offline persistence is enabled by default
- All timestamps use Firebase server time for consistency
- For production, implement proper security rules
