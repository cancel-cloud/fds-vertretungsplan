'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StundenplanRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allowedDomainsText, setAllowedDomainsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }

    setIsSubmitting(true);

    const allowedDomains = allowedDomainsText
      .split(/[\s,;]+/)
      .map((entry) => entry.trim().toLowerCase().replace(/^@/, ''))
      .filter((entry) => entry.length > 0);

    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, allowedDomains }),
    });

    const registerData = (await registerResponse.json()) as {
      error?: string;
      requiresAdminSetup?: boolean;
    };
    if (!registerResponse.ok) {
      setError(registerData.error ?? 'Registrierung fehlgeschlagen.');
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!signInResult || signInResult.error) {
      setError('Registrierung erfolgreich, aber Login fehlgeschlagen. Bitte manuell anmelden.');
      setIsSubmitting(false);
      return;
    }

    router.push(registerData.requiresAdminSetup ? '/stundenplan/admin-setup' : '/stundenplan/onboarding');
    router.refresh();
  };

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text))]">Registrieren</h1>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">Erstelle einen eigenen Account mit persönlichem Stundenplan.</p>

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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="confirm-password">Passwort wiederholen</label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="allowed-domains">
              Erlaubte E-Mail-Domains
            </label>
            <Input
              id="allowed-domains"
              name="allowed-domains"
              autoComplete="off"
              spellCheck={false}
              placeholder="schule.de, fds-limburg.de"
              value={allowedDomainsText}
              onChange={(event) => setAllowedDomainsText(event.target.value)}
            />
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              Nur bei der ersten Admin-Registrierung erforderlich. Domains mit Komma oder Leerzeichen trennen.
            </p>
          </div>

          {error ? (
            <p className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]" aria-live="polite">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Account erstellen
          </Button>
        </form>

        <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">
          Bereits registriert?{' '}
          <Link href="/stundenplan/login" className="font-medium text-[rgb(var(--color-primary))] hover:underline">
            Zum Login
          </Link>
        </p>
      </section>
    </main>
  );
}
