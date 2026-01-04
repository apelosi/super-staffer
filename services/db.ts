export const DB_NAME = 'superstaffer_db';
export const DB_VERSION = 1;
export const STORE_USERS = 'users';
export const STORE_CARDS = 'cards';

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_USERS)) {
                db.createObjectStore(STORE_USERS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_CARDS)) {
                db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
            }
        };
    });
};

export const dbRequest = <T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            let request;
            try {
                request = callback(store);
            } catch (err) {
                reject(err);
                return;
            }

            transaction.oncomplete = () => {
                // If request was made, resolve with result, else just resolve (for void ops)
                if (request) {
                    resolve(request.result);
                } else {
                    resolve(undefined as T);
                }
            };

            transaction.onerror = () => reject(transaction.error);
        } catch (err) {
            reject(err);
        }
    });
};

export const dbGetAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
};
