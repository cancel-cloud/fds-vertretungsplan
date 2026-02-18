import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoginPromoCardProps {
  className?: string;
}

export function LoginPromoCard({ className }: LoginPromoCardProps) {
  return (
    <Card
      interactive
      className={cn(
        'gap-4 border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 shadow-sm',
        className
      )}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Mehr mit deinem Account</h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          Melde dich an, um deinen persönlichen Stundenplan zu verwalten und Push-Benachrichtigungen zu erhalten.
        </p>
      </div>
      <Link href="/stundenplan/login?next=/" className={cn(buttonVariants({ size: 'sm' }), 'w-full')}>
        Zum Login
      </Link>
    </Card>
  );
}
