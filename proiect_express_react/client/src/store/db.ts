import { openDB } from 'idb';

const DB_NAME = 'AppDatabase';
const STORE_NAME = 'thumbnails';

let dbPromise = null;

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    
    return dbPromise;
};

export const saveThumbnail = async (id, blob) => {
    try {
        const db = await getDB(); 
        await db.put(STORE_NAME, blob, id); 
        console.log(`Thumbnail saved successfully with ID: ${id}`);
    } catch (error) {
        console.error("Failed to save thumbnail:", error);
    }
};

export const getThumbnail = async (id) => {
    try {
        const db = await getDB();
        const blob = await db.get(STORE_NAME, id);
        return blob; 
    } catch (error) {
        console.error("Failed to retrieve thumbnail:", error);
        return null;
    }
};