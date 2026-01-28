
import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { AdventureMetadata, User } from '../types';

const ADVENTURE_COLLECTION = 'adventures';

export const createAdventureInDb = async (adventure: AdventureMetadata, initialData: any) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventure.id);
        await setDoc(advRef, {
            metadata: adventure,
            data: initialData
        });
        return true;
    } catch (e) {
        console.error("Error creating adventure:", e);
        throw e;
    }
};

export const joinAdventureInDb = async (adventureId: string, user: User) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
        const advSnap = await getDoc(advRef);

        if (!advSnap.exists()) {
            throw new Error("Adventure not found");
        }

        const currentData = advSnap.data() as { metadata: AdventureMetadata; data: any };
        const memberIds = currentData.metadata.memberIds || [];
        
        if (!memberIds.includes(user.id)) {
            await updateDoc(advRef, {
                'metadata.memberIds': arrayUnion(user.id)
            });

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
        throw e;
    }
};

export const getUserAdventures = async (userId: string): Promise<AdventureMetadata[]> => {
    try {
        const q = query(
            collection(db, ADVENTURE_COLLECTION),
            where('metadata.memberIds', 'array-contains', userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const meta = data.metadata as AdventureMetadata;
            // Inject totalDays from the detailed data if available, default to 5
            return {
                ...meta,
                totalDays: data.data?.totalDays || 5
            };
        });
    } catch (e) {
        console.error("Error fetching user adventures:", e);
        throw e;
    }
};

export const deleteAdventure = async (adventureId: string) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
        await deleteDoc(advRef);
        return true;
    } catch (e) {
        console.error("Error deleting adventure:", e);
        throw e;
    }
};

export const subscribeToAdventure = (adventureId: string, onUpdate: (data: any) => void) => {
    const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
    return onSnapshot(advRef, (doc) => {
        if (doc.exists()) {
            const fullDoc = doc.data() as { data: any; metadata: AdventureMetadata };
            onUpdate(fullDoc.data);
        }
    });
};

export const updateAdventureData = async (adventureId: string, data: any) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
        
        await updateDoc(advRef, {
            data: data
        });
        
        if (data.tripSettings?.title) {
             await updateDoc(advRef, {
                'metadata.title': data.tripSettings.title
            });
        }
    } catch (e) {
        console.error("Error updating adventure:", e);
    }
};
