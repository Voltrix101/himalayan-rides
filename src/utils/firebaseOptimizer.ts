import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  writeBatch,
  onSnapshot,
  Unsubscribe,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Cache management
class FirebaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(keyPattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const firebaseCache = new FirebaseCache();

// Optimized Firestore operations
export class OptimizedFirestore {
  private listeners = new Map<string, Unsubscribe>();

  // Batch operations for performance
  async batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    path: string;
    data?: any;
  }>) {
    const batch = writeBatch(db);
    
    operations.forEach(({ type, path, data }) => {
      const docRef = doc(db, path);
      
      switch (type) {
        case 'set':
          batch.set(docRef, data);
          break;
        case 'update':
          batch.update(docRef, data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });

    await batch.commit();
    
    // Invalidate cache for affected collections
    operations.forEach(({ path }) => {
      const collectionName = path.split('/')[0];
      firebaseCache.invalidate(collectionName);
    });
  }

  // Optimized query with caching
  async getCollection(
    collectionName: string,
    constraints: any[] = [],
    useCache = true,
    cacheTTL = 5 * 60 * 1000
  ) {
    const cacheKey = `collection_${collectionName}_${JSON.stringify(constraints)}`;
    
    if (useCache) {
      const cached = firebaseCache.get(cacheKey);
      if (cached) return cached;
    }

    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (useCache) {
      firebaseCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  }

  // Optimized document get with caching
  async getDocument(path: string, useCache = true, cacheTTL = 5 * 60 * 1000) {
    const cacheKey = `doc_${path}`;
    
    if (useCache) {
      const cached = firebaseCache.get(cacheKey);
      if (cached) return cached;
    }

    const docRef = doc(db, path);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) return null;
    
    const data = { id: snapshot.id, ...snapshot.data() };
    
    if (useCache) {
      firebaseCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  }

  // Real-time listener with automatic cleanup
  subscribeToCollection(
    collectionName: string,
    callback: (data: any[]) => void,
    constraints: any[] = [],
    listenerKey?: string
  ) {
    const key = listenerKey || `${collectionName}_${Date.now()}`;
    
    // Clean up existing listener
    if (this.listeners.has(key)) {
      this.listeners.get(key)!();
    }

    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update cache
      const cacheKey = `collection_${collectionName}_${JSON.stringify(constraints)}`;
      firebaseCache.set(cacheKey, data);
      
      callback(data);
    });

    this.listeners.set(key, unsubscribe);
    return () => {
      unsubscribe();
      this.listeners.delete(key);
    };
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  // Network optimization
  async goOffline() {
    await disableNetwork(db);
  }

  async goOnline() {
    await enableNetwork(db);
  }
}

// Optimized Storage operations
export class OptimizedStorage {
  private uploadProgress = new Map<string, number>();

  // Optimized file upload with progress tracking
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storageRef = ref(storage, path);
    
    // Track upload progress
    const uploadTask = uploadBytes(storageRef, file);
    
    if (onProgress) {
      this.uploadProgress.set(path, 0);
      // Simulate progress updates (Firebase doesn't provide real progress for uploadBytes)
      const progressInterval = setInterval(() => {
        const current = this.uploadProgress.get(path) || 0;
        if (current < 90) {
          const newProgress = current + Math.random() * 10;
          this.uploadProgress.set(path, newProgress);
          onProgress(newProgress);
        }
      }, 100);

      uploadTask.finally(() => {
        clearInterval(progressInterval);
        this.uploadProgress.set(path, 100);
        onProgress(100);
        setTimeout(() => this.uploadProgress.delete(path), 1000);
      });
    }

    const snapshot = await uploadTask;
    return await getDownloadURL(snapshot.ref);
  }

  // Batch file upload
  async uploadMultipleFiles(
    files: Array<{ file: File; path: string }>,
    onProgress?: (overall: number, individual: { [path: string]: number }) => void
  ): Promise<string[]> {
    const uploads = files.map(({ file, path }) => 
      this.uploadFile(file, path, (progress) => {
        if (onProgress) {
          this.uploadProgress.set(path, progress);
          const individual = Object.fromEntries(this.uploadProgress.entries());
          const overall = Array.from(this.uploadProgress.values()).reduce((sum, p) => sum + p, 0) / files.length;
          onProgress(overall, individual);
        }
      })
    );

    return Promise.all(uploads);
  }

  // Optimized file deletion
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  // Batch file deletion
  async deleteMultipleFiles(paths: string[]): Promise<void> {
    const deletions = paths.map(path => this.deleteFile(path));
    await Promise.all(deletions);
  }
}

// Global instances
export const optimizedFirestore = new OptimizedFirestore();
export const optimizedStorage = new OptimizedStorage();

// React hooks for optimized Firebase operations
export const useOptimizedFirestore = () => {
  return {
    getCollection: optimizedFirestore.getCollection.bind(optimizedFirestore),
    getDocument: optimizedFirestore.getDocument.bind(optimizedFirestore),
    batchWrite: optimizedFirestore.batchWrite.bind(optimizedFirestore),
    subscribe: optimizedFirestore.subscribeToCollection.bind(optimizedFirestore),
    cleanup: optimizedFirestore.cleanup.bind(optimizedFirestore),
    goOffline: optimizedFirestore.goOffline.bind(optimizedFirestore),
    goOnline: optimizedFirestore.goOnline.bind(optimizedFirestore)
  };
};

export const useOptimizedStorage = () => {
  return {
    uploadFile: optimizedStorage.uploadFile.bind(optimizedStorage),
    uploadMultiple: optimizedStorage.uploadMultipleFiles.bind(optimizedStorage),
    deleteFile: optimizedStorage.deleteFile.bind(optimizedStorage),
    deleteMultiple: optimizedStorage.deleteMultipleFiles.bind(optimizedStorage)
  };
};

// Performance monitoring for Firebase operations
export const measureFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    
    console.log(`Firebase ${operationName} completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`Firebase ${operationName} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
    throw error;
  }
};
