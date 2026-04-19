import { openDB } from 'idb';

export const dbPromise = openDB('ThumbnailStore', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('thumbnails')) {
      db.createObjectStore('thumbnails', { keyPath: 'id' });
    }
  },
});