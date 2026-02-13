import Link from 'next/link';
import { getServerAuthSession } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { HeaderAuthActions } from '@/components/layout/header-auth-actions';

export async function LandingHeader() {
  const session = await getServerAuthSession();
  const hasSession = Boolean(session?.user?.id);
  const userRole = session?.user?.role ?? 'USER';

  return (
    <header className="sticky top-0 z-10 border-b border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/"
          className="rounded-sm px-2 py-1 text-xl font-semibold text-[rgb(var(--color-text))] transition-colors duration-150 hover:bg-[rgb(var(--color-secondary)/0.12)] hover:text-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-offset-2 -mx-2 -my-1"
        >
          FDS Vertretungsplan
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasSession ? <HeaderAuthActions role={userRole} /> : null}
          <ThemeToggle />
          {!hasSession ? (
            <Link href="/stundenplan/login" className={buttonVariants({ size: 'sm' })}>
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
