import {
  Avatar as ShadcnAvatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar.tsx';

const Avatar = ({ src, alt = 'User', size = 'md', className = '', online = false }) => {
  const sizeStyles = {
    sm: 'size-8',
    md: '',
    lg: 'size-12',
    xl: 'size-16',
  };
  const initials = alt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <ShadcnAvatar
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      className={`${sizeStyles[size]} ${className}`}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback aria-label={alt}>{initials || 'U'}</AvatarFallback>
      {online && <AvatarBadge className="bg-emerald-500 ring-2 ring-white" />}
    </ShadcnAvatar>
  );
};

export default Avatar;
