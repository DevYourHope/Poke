import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../lib/api';

export function useUserProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi('/profile');
        if (data) {
          setProfile(data);
        } else {
          await initializeProfile();
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
        // Fallback to local storage if DB fails or not initialized
        const savedProfile = localStorage.getItem(`rotomdex_profile_${user.id}`);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          await initializeProfile();
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, [user, t]);

  const initializeProfile = async () => {
    const initialProfile: UserProfile = {
      displayName: user?.user_metadata?.full_name || t('defaultTrainerName'),
      photoURL: user?.user_metadata?.avatar_url || '',
      joinDate: Date.now(),
      trainerTitle: t('profile.defaultTrainerTitle'),
      bio: t('profile.defaultBio'),
      themeColor: '#ef4444' // red-600
    };
    
    setProfile(initialProfile);
    if (user) {
      try {
        await fetchApi('/profile', {
          method: 'POST',
          body: JSON.stringify(initialProfile)
        });
      } catch (e) {
        console.error("Error initializing profile in DB:", e);
        localStorage.setItem(`rotomdex_profile_${user.id}`, JSON.stringify(initialProfile));
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    
    if (user) {
      try {
        await fetchApi('/profile', {
          method: 'POST',
          body: JSON.stringify(newProfile)
        });
      } catch (e) {
        console.error("Error updating profile in DB:", e);
        localStorage.setItem(`rotomdex_profile_${user.id}`, JSON.stringify(newProfile));
      }
    }
  };

  return { profile, updateProfile, loading };
}
