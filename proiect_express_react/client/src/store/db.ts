import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

const DB_NAME = 'AppDatabase';
const STORE_NAME = 'thumbnails';

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export async function getDB(): Promise<IDBPDatabase<any>> {
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
}

export const db = {
    saveThumbnail: async (id: string, blob: Blob) => {
        try {
            const db = await getDB();
            await db.put(STORE_NAME, blob, id);
            console.log(`Thumbnail saved successfully with ID: ${id}`);
        } catch (error) {
            console.error("Failed to save thumbnail:", error);
        }
    },

    getThumbnail: async (id: string) => {
        try {
            const db = await getDB();
            const blob = await db.get(STORE_NAME, id);
            return blob;
        } catch (error) {
            console.error("Failed to retrieve thumbnail:", error);
            return null;
        }
    },

    getAllThumbnails: async () => {
        try {
            const db = await getDB();
            const blobs = await db.getAll(STORE_NAME);
            return blobs;
        } catch (error) {
            console.error("something failed while getting all blos ", error);
            return null;
        }
    },

    getAllThumbnailsKeys: async () => {
        try {
            const db = await getDB();
            const keys = await db.getAllKeys(STORE_NAME);
            return keys;
        } catch (error) {
            console.error("something failed while getting all keys ", error);
            return null;
        }
    }
}

console.log("getdb:", getDB);