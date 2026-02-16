'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button, buttonVariants } from '@/components/ui/button';

interface HeaderAuthActionsProps {
  role: 'USER' | 'ADMIN';
}

export function HeaderAuthActions({ role }: HeaderAuthActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link href="/stundenplan/stundenplan" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        Stundenplan bearbeiten
      </Link>
      <Link href="/stundenplan/settings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        Einstellungen
      </Link>
      {role === 'ADMIN' ? (
        <Link href="/stundenplan/admin" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Admin
        </Link>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          void signOut({ callbackUrl: '/' });
        }}
      >
        Logout
      </Button>
    </div>
  );
}
