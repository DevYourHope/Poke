import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export function useUserProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const path = `users/${user.uid}/profile/data`;
    const docRef = doc(db, path);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: UserProfile = {
          displayName: user.displayName || t('defaultTrainerName'),
          photoURL: '',
          joinDate: Date.now(),
          trainerTitle: t('profile.defaultTrainerTitle'),
          bio: t('profile.defaultBio'),
          themeColor: '#ef4444' // red-600
        };
        setDoc(docRef, initialProfile);
        setProfile(initialProfile);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, t]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}/profile/data`;
    try {
      await updateDoc(doc(db, path), updates);
      
      // Also update Firebase Auth profile for consistency
      const authUpdates: any = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateAuthProfile(user, authUpdates);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return { profile, updateProfile, loading };
}
