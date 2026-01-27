
import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { AdventureMetadata, User } from '../types';

const ADVENTURE_COLLECTION = 'adventures';

// Create a new adventure
export const createAdventureInDb = async (adventure: AdventureMetadata, initialData: any) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventure.id);
        // Save as a single document containing both metadata and the full data blob
        // This is a simplified approach for the beginner tutorial.
        await setDoc(advRef, {
            metadata: adventure,
            data: initialData
        });
        return true;
    } catch (e) {
        console.error("Error creating adventure:", e);
        throw e; // Propagate error to UI
    }
};

// Join an existing adventure
export const joinAdventureInDb = async (adventureId: string, user: User) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
        const advSnap = await getDoc(advRef);

        if (!advSnap.exists()) {
            throw new Error("Adventure not found");
        }

        const currentData = advSnap.data();
        const memberIds = currentData.metadata.memberIds || [];
        
        if (!memberIds.includes(user.id)) {
            // 1. Update metadata memberIds
            await updateDoc(advRef, {
                'metadata.memberIds': arrayUnion(user.id)
            });

            // 2. Add member to the data.members array inside the data object
            const newMember = {
                id: user.id,
                name: user.name,
                themeIdx: Math.floor(Math.random() * 7),
                img: user.avatar,
                level: 1,
                exp: 0
            };
            
            const currentMembers = currentData.data.members || [];
            await updateDoc(advRef, {
                'data.members': [...currentMembers, newMember]
            });
        }
        return true;
    } catch (e) {
        console.error("Error joining adventure:", e);
        throw e; // Rethrow to handle in UI
    }
};

// Get list of adventures for a user (Initial Load)
export const getUserAdventures = async (userId: string): Promise<AdventureMetadata[]> => {
    try {
        // Query adventures where the memberIds array contains the userId
        const q = query(
            collection(db, ADVENTURE_COLLECTION),
            where('metadata.memberIds', 'array-contains', userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data().metadata as AdventureMetadata);
    } catch (e) {
        console.error("Error fetching user adventures:", e);
        // We throw the error now so the UI knows something is wrong (e.g. wrong API key or no DB)
        throw e;
    }
};

// Subscribe to a specific adventure (Real-time sync)
export const subscribeToAdventure = (adventureId: string, onUpdate: (data: any) => void) => {
    const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
    return onSnapshot(advRef, (doc) => {
        if (doc.exists()) {
            const fullDoc = doc.data();
            // Pass the inner 'data' object which contains events, expenses, etc.
            onUpdate(fullDoc.data);
        }
    });
};

// Update adventure data (Save)
export const updateAdventureData = async (adventureId: string, data: any) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
        
        // Update the 'data' field
        await updateDoc(advRef, {
            data: data
        });
        
        // If title changed, verify if we need to update metadata.title
        if (data.tripSettings?.title) {
             await updateDoc(advRef, {
                'metadata.title': data.tripSettings.title
            });
        }
    } catch (e) {
        console.error("Error updating adventure:", e);
        // Optional: Add toast notification via a global state or callback if needed
    }
};
