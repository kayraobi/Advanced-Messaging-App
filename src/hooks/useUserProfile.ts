import { useState } from 'react';
import { usersService } from '../services/usersService';
import type { User } from '../types/user.types';

export interface ProfilePreview {
  senderId: string;
  senderName: string;
  initials: string;
  user?: User;
}

export function useUserProfile() {
  const [profilePreview, setProfilePreview] = useState<ProfilePreview | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const openProfile = async (senderId: string, senderName: string, initials: string) => {
    if (!senderId) return;
    setProfilePreview({ senderId, senderName, initials });
    setShowProfile(true);
    setProfileLoading(true);
    try {
      const user = await usersService.getById(senderId);
      setProfilePreview((prev) => (prev ? { ...prev, user } : prev));
    } catch {
      // API erişimi yoksa sadece isim/initials göster, hata verme
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfile = () => setShowProfile(false);

  return { profilePreview, profileLoading, showProfile, openProfile, closeProfile };
}
