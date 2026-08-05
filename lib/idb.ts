/**
 * Minimal IndexedDB wrapper for storing uploaded video blobs in demo mode.
 * (localStorage can't hold binary data of video size; IndexedDB can.)
 */
const DB_NAME = "firsttouch";
const STORE = "videos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

export function putVideo(key: string, blob: Blob): Promise<IDBValidKey> {
  return tx("readwrite", (s) => s.put(blob, key));
}

export function getVideo(key: string): Promise<Blob | undefined> {
  return tx("readonly", (s) => s.get(key) as IDBRequest<Blob | undefined>);
}

export function deleteVideo(key: string): Promise<undefined> {
  return tx("readwrite", (s) => s.delete(key) as IDBRequest<undefined>);
}
