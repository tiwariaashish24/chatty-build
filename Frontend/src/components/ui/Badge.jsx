import { Badge as ShadcnBadge } from '@/components/ui/badge.tsx';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <ShadcnBadge
      variant="outline"
      className={`${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
