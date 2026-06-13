import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfilePicture, getUserInitials } from '@/hooks/useProfilePicture';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  user?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-24 w-24'
};

export default function ProfileAvatar({ 
  user, 
  size = 'md', 
  className,
  showFallback = true 
}: ProfileAvatarProps) {
  const { profilePicture } = useProfilePicture(user?.id);
  
  // Use the hook's profile picture or fall back to user's avatar/profile_picture
  const avatarSrc = profilePicture || user?.avatar || user?.profile_picture;
  const initials = getUserInitials(user);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarSrc && (
        <AvatarImage 
          src={avatarSrc} 
          alt={user?.full_name || user?.name || 'Profile'} 
        />
      )}
      {showFallback && (
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}