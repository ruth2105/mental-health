import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export function useProfilePicture(userId?: string) {
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    // If no specific userId provided, use current user
    if (!userId) {
      // Check user context for avatar
      if (user?.avatar) {
        setProfilePicture(user.avatar);
        return;
      }
    }
    
    // If no profile picture found, set to null
    setProfilePicture(null);
  }, [user, userId]);

  const updateProfilePicture = (newPicture: string | null) => {
    setProfilePicture(newPicture);
    
    // Update user context if it's the current user
    if (!userId && user) {
      const updatedUser = { ...user, avatar: newPicture || undefined };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return {
    profilePicture,
    updateProfilePicture,
    hasProfilePicture: !!profilePicture
  };
}

// Utility function to get profile picture for any user
export function getProfilePictureUrl(user: any): string | null {
  // Check user object for avatar field
  if (user?.avatar) {
    return user.avatar;
  }
  
  // Fallback to profile_picture for backward compatibility
  if (user?.profile_picture) {
    return user.profile_picture;
  }
  
  return null;
}

// Utility function to get user initials for avatar fallback
export function getUserInitials(user: any): string {
  if (user?.full_name) {
    return user.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (user?.name) {
    return user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (user?.email) {
    return user.email[0].toUpperCase();
  }
  
  return 'U';
}