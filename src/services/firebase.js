// Firebase Firestore service for managing pins
export const db = window.firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Collections
const PINS_COLLECTION = 'pins';
const USERS_COLLECTION = 'users';

// Helper to calculate distance between coordinates
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

// Helper to get time ago string
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'ahora';
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'ahora';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
  return `hace ${Math.floor(seconds / 86400)}d`;
};

// Pin operations
export const pinService = {
  // Create a new pin
  async createPin(pinData, userId) {
    try {
      const docRef = await db.collection(PINS_COLLECTION).add({
        ...pinData,
        userId,
        resolved: false,
        attendees: [],
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, ...pinData, userId, resolved: false, attendees: [] };
    } catch (error) {
      console.error('Error creating pin:', error);
      throw error;
    }
  },

  // Listen to pins in real-time
  subscribeToPins(callback, userLocation = null, currentUserId = null) {
    return db.collection(PINS_COLLECTION)
      .where('resolved', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(
        (snapshot) => {
          const pins = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            const pin = {
              id: doc.id,
              ...data,
              time: getTimeAgo(data.createdAt),
              distance: userLocation && data.latLng 
                ? `${calculateDistance(userLocation, data.latLng).toFixed(1)} km`
                : data.distance || '0 km',
              user: data.userId === currentUserId ? 'me' : 'other',
              attending: data.attendees && data.attendees.includes(currentUserId)
            };
            pins.push(pin);
          });
          callback(pins);
        },
        (error) => {
          console.error('Error in pins subscription:', error);
          if (error.code === 'failed-precondition') {
            console.error('Index required. Please create the index in Firebase Console.');
            console.error('Check the browser console for the index creation link.');
          }
          callback([]);
        }
      );
  },

  // Mark pin as resolved
  async resolvePin(pinId) {
    try {
      await db.collection(PINS_COLLECTION).doc(pinId).update({
        resolved: true,
        resolvedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error resolving pin:', error);
      throw error;
    }
  },

  // Delete a pin
  async deletePin(pinId) {
    try {
      await db.collection(PINS_COLLECTION).doc(pinId).delete();
    } catch (error) {
      console.error('Error deleting pin:', error);
      throw error;
    }
  },

  // Get conversations for a pin
  async getConversations(pinId) {
    try {
      const snapshot = await db.collection(PINS_COLLECTION)
        .doc(pinId)
        .collection('conversations')
        .orderBy('createdAt', 'desc')
        .get();
      
      const conversations = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        conversations.push({ 
          id: doc.id, 
          ...data,
          messages: data.messages || []
        });
      });
      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  // Add a conversation to a pin
  async addConversation(pinId, userId, userAlias, initialMessage) {
    try {
      // Add user to attendees list
      await db.collection(PINS_COLLECTION).doc(pinId).update({
        attendees: window.firebase.firestore.FieldValue.arrayUnion(userId)
      });

      const conversationRef = await db.collection(PINS_COLLECTION)
        .doc(pinId)
        .collection('conversations')
        .add({
          userId,
          userAlias,
          lastMessage: initialMessage,
          unreadByOwner: true, // Mark as unread for pin owner
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });
      
      // Add initial message
      await db.collection(PINS_COLLECTION)
        .doc(pinId)
        .collection('conversations')
        .doc(conversationRef.id)
        .collection('messages')
        .add({
          text: initialMessage,
          sender: 'other',
          senderId: userId,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });
      
      return { 
        id: conversationRef.id, 
        userId,
        userAlias,
        lastMessage: initialMessage,
        unreadByOwner: true,
        messages: [{ id: '1', text: initialMessage, sender: 'other' }]
      };
    } catch (error) {
      console.error('Error adding conversation:', error);
      throw error;
    }
  },

  // Subscribe to messages in a conversation
  subscribeToMessages(pinId, conversationId, callback) {
    return db.collection(PINS_COLLECTION)
      .doc(pinId)
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        (snapshot) => {
          const messages = [];
          snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
          });
          callback(messages);
        },
        (error) => {
          console.error('Error in messages subscription:', error);
          callback([]);
        }
      );
  },

  // Add a message to a conversation
  async addMessage(pinId, conversationId, messageData) {
    try {
      await db.collection(PINS_COLLECTION)
        .doc(pinId)
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add({
          ...messageData,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });
      
      // Get the pin and conversation to determine who to mark as unread
      const pinDoc = await db.collection(PINS_COLLECTION).doc(pinId).get();
      const pinOwnerId = pinDoc.data().userId;
      
      // Update last message in conversation and mark as unread for the recipient
      await db.collection(PINS_COLLECTION)
        .doc(pinId)
        .collection('conversations')
        .doc(conversationId)
        .update({
          lastMessage: messageData.text,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          // Mark as unread for the owner if sender is not the owner
          unreadByOwner: messageData.senderId !== pinOwnerId
        });
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  // Mark conversation as read by owner
  async markConversationAsRead(pinId, conversationId) {
    try {
      await db.collection(PINS_COLLECTION)
        .doc(pinId)
        .collection('conversations')
        .doc(conversationId)
        .update({
          unreadByOwner: false
        });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },

  // Subscribe to unread conversations count for user's pins
  subscribeToUnreadCount(userId, callback) {
    return db.collection(PINS_COLLECTION)
      .where('userId', '==', userId)
      .where('resolved', '==', false)
      .onSnapshot(
        async (snapshot) => {
          let totalUnread = 0;
          const promises = [];
          
          snapshot.forEach(doc => {
            const promise = db.collection(PINS_COLLECTION)
              .doc(doc.id)
              .collection('conversations')
              .where('unreadByOwner', '==', true)
              .get()
              .then(convSnapshot => convSnapshot.size);
            promises.push(promise);
          });
          
          const counts = await Promise.all(promises);
          totalUnread = counts.reduce((sum, count) => sum + count, 0);
          callback(totalUnread);
        },
        (error) => {
          console.error('Error in unread count subscription:', error);
          callback(0);
        }
      );
  },

  // Subscribe to new messages for pin owner
  subscribeToNewMessages(userId, callback) {
    const conversationListeners = new Map();
    
    const mainUnsubscribe = db.collection(PINS_COLLECTION)
      .where('userId', '==', userId)
      .where('resolved', '==', false)
      .onSnapshot(
        (snapshot) => {
          snapshot.forEach(doc => {
            const pinId = doc.id;
            const pinData = doc.data();
            
            // Skip if already listening to this pin's conversations
            if (conversationListeners.has(pinId)) {
              return;
            }
            
            // Listen to conversations for this pin
            const convUnsubscribe = db.collection(PINS_COLLECTION)
              .doc(pinId)
              .collection('conversations')
              .where('unreadByOwner', '==', true)
              .onSnapshot((convSnapshot) => {
                convSnapshot.docChanges().forEach(convChange => {
                  if (convChange.type === 'modified') {
                    const convData = convChange.doc.data();
                    if (convData.unreadByOwner) {
                      callback({
                        pinId,
                        pinCategory: pinData.category,
                        conversationId: convChange.doc.id,
                        userAlias: convData.userAlias,
                        lastMessage: convData.lastMessage
                      });
                    }
                  }
                });
              });
            
            conversationListeners.set(pinId, convUnsubscribe);
          });
          
          // Clean up listeners for pins that were removed
          conversationListeners.forEach((unsubscribe, pinId) => {
            const stillExists = snapshot.docs.some(doc => doc.id === pinId);
            if (!stillExists) {
              unsubscribe();
              conversationListeners.delete(pinId);
            }
          });
        },
        (error) => {
          console.error('Error in new messages subscription:', error);
        }
      );
    
    // Return cleanup function
    return () => {
      mainUnsubscribe();
      conversationListeners.forEach(unsubscribe => unsubscribe());
      conversationListeners.clear();
    };
  }
};

// User operations
export const userService = {
  // Create or update user profile
  async updateUserProfile(userId, profileData) {
    try {
      await db.collection(USERS_COLLECTION).doc(userId).set({
        ...profileData,
        lastActive: window.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};
