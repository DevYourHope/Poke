import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../lib/api';

export function usePokemonData<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (!user) {
        let savedData = localStorage.getItem(`rotomdex_data_guest_${collectionName}`);
        
        // Migration for old data
        if (!savedData) {
          if (collectionName === 'teams') {
            savedData = localStorage.getItem('rotomdex_teams') || localStorage.getItem('auradex_all_teams');
            if (savedData) {
              localStorage.setItem(`rotomdex_data_guest_teams`, savedData);
            }
          }
        }

        if (savedData) {
          try {
            setData(JSON.parse(savedData));
          } catch (e) {
            setData([]);
          }
        } else {
          setData([]);
        }
        setLoading(false);
        return;
      }

      try {
        const remoteData = await fetchApi(`/data/${collectionName}`);
        
        // If remote data is empty, check if we need to migrate local data to remote
        if ((!remoteData || remoteData.length === 0) && collectionName === 'teams') {
          const oldLocalTeams = localStorage.getItem('rotomdex_teams') || localStorage.getItem('auradex_all_teams');
          if (oldLocalTeams) {
            try {
              const parsed = JSON.parse(oldLocalTeams);
              if (parsed.length > 0) {
                await fetchApi(`/data/${collectionName}`, {
                  method: 'POST',
                  body: JSON.stringify(parsed)
                });
                setData(parsed);
                setLoading(false);
                return;
              }
            } catch (e) {}
          }
        }

        setData(remoteData || []);
      } catch (e) {
        console.error(`Error fetching ${collectionName}:`, e);
        // Fallback to local storage
        const savedData = localStorage.getItem(`rotomdex_data_${user.id}_${collectionName}`);
        if (savedData) {
          try {
            setData(JSON.parse(savedData));
          } catch (err) {
            setData([]);
          }
        } else {
          setData([]);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [user, collectionName]);

  const saveToDb = async (newData: T[]) => {
    if (user) {
      try {
        await fetchApi(`/data/${collectionName}`, {
          method: 'POST',
          body: JSON.stringify(newData)
        });
      } catch (e) {
        console.error(`Error saving ${collectionName} to DB:`, e);
      }
    }
  };

  const saveToLocal = (newData: T[]) => {
    const key = user 
      ? `rotomdex_data_${user.id}_${collectionName}` 
      : `rotomdex_data_guest_${collectionName}`;
    localStorage.setItem(key, JSON.stringify(newData));
    setData(newData);
    saveToDb(newData);
  };

  const addItem = async (item: any) => {
    const newItem = { 
      ...item, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    const newData = [newItem, ...data];
    saveToLocal(newData);
  };

  const updateItem = async (id: string, updates: any) => {
    const newData = data.map(item => (item as any).id === id ? { ...item, ...updates } : item);
    saveToLocal(newData);
  };

  const removeItem = async (id: string) => {
    const newData = data.filter(item => (item as any).id !== id);
    saveToLocal(newData);
  };

  return { data, addItem, updateItem, removeItem, loading };
}
