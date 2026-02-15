
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
            // Merge metadata info (like coverImage) into the data object for the frontend to use easily if needed,
            // though usually we pass them separately.
            const resultData = {
                ...fullDoc.data,
                coverImage: fullDoc.metadata.coverImage // Ensure coverImage is available in data stream
            };
            onUpdate(resultData);
        }
    });
};

export const updateAdventureData = async (adventureId: string, data: any, coverImage?: string) => {
    try {
        const advRef = doc(db, ADVENTURE_COLLECTION, adventureId);
        
        await updateDoc(advRef, {
            data: data
        });
        
        // Update metadata fields if present
        const metadataUpdates: any = {};
        if (data.tripSettings?.title) {
            metadataUpdates['metadata.title'] = data.tripSettings.title;
        }
        if (coverImage) {
            metadataUpdates['metadata.coverImage'] = coverImage;
        }

        if (Object.keys(metadataUpdates).length > 0) {
            await updateDoc(advRef, metadataUpdates);
        }
    } catch (e) {
        console.error("Error updating adventure:", e);
        // 增加使用者提示，因為資料庫有單一文件 1MB 限制
        alert("存檔失敗！可能是檔案或圖片過大導致 (資料庫限制 1MB)。\n\n請嘗試：\n1. 刪除過大的 PDF 憑證\n2. 改用手機截圖上傳 (系統會自動壓縮圖片)");
    }
};
