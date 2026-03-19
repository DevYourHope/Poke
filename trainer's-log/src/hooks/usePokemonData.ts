import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function usePokemonData<T>(collectionName: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state for non-logged users (clears on refresh)
  const [localData, setLocalData] = useState<T[]>([]);

  useEffect(() => {
    if (!user) {
      setData(localData);
      setLoading(false);
      return;
    }

    const path = `users/${user.uid}/${collectionName}`;
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [user, collectionName, localData]);

  const addItem = async (item: any) => {
    if (!user) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      setLocalData(prev => [...prev, newItem]);
      return;
    }

    const path = `users/${user.uid}/${collectionName}`;
    try {
      await addDoc(collection(db, path), {
        ...item,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateItem = async (id: string, updates: any) => {
    if (!user) {
      setLocalData(prev => prev.map(item => (item as any).id === id ? { ...item, ...updates } : item));
      return;
    }

    const path = `users/${user.uid}/${collectionName}/${id}`;
    try {
      await updateDoc(doc(db, `users/${user.uid}/${collectionName}`, id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const removeItem = async (id: string) => {
    if (!user) {
      setLocalData(prev => prev.filter(item => (item as any).id !== id));
      return;
    }

    const path = `users/${user.uid}/${collectionName}/${id}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return { data, addItem, updateItem, removeItem, loading };
}
