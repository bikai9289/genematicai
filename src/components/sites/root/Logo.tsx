import { LogoMark } from '@/components/brand/logo';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = 'size-8' }: LogoProps) {
  return <LogoMark className={`text-primary ${className}`} />;
}
