'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StundenplanLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const candidate = searchParams.get('next');
    if (!candidate || !candidate.startsWith('/')) {
      return '/stundenplan';
    }
    return candidate;
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!result || result.error) {
      setError('Login fehlgeschlagen. Prüfe deine E-Mail und dein Passwort.');
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text))]">Anmelden</h1>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">Dein persönlicher Stundenplan & Push-Benachrichtigungen.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">E-Mail</label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Passwort</label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]" aria-live="polite">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Anmelden
          </Button>
        </form>

        <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">
          Noch kein Account?{' '}
          <Link href="/stundenplan/register" className="font-medium text-[rgb(var(--color-primary))] hover:underline">
            Registrieren
          </Link>
        </p>
      </section>
    </main>
  );
}
