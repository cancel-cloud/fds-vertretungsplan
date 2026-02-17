'use client';

import { Home, LayoutDashboard, LogIn, LogOut, Settings, Shield, UserPlus, Wrench } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import type { AuthRole } from '@/types/user-system';
import { resolveCommandSearchIntent } from '@/lib/command-menu/search-intent';

interface GlobalCommandMenuProps {
  isDemoMode: boolean;
}

type CommandMenuAuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'authenticated'; role: AuthRole };

type QuickQueryAction =
  | { kind: 'navigate'; href: string; label: string }
  | { kind: 'logout'; label: string }
  | null;

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  return Boolean(target.closest('[contenteditable="true"]'));
};

const normalizeCommandQuery = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const resolveQuickQueryAction = (options: {
  query: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
}): QuickQueryAction => {
  const normalized = normalizeCommandQuery(options.query);
  if (!normalized) {
    return null;
  }

  const has = (...aliases: string[]) => aliases.includes(normalized);

  if (has('home', 'start', 'homepage')) {
    return { kind: 'navigate', href: '/', label: 'Go to Home' };
  }

  if (has('dashboard', 'go to dashboard', 'board')) {
    return { kind: 'navigate', href: '/stundenplan/dashboard?scope=all', label: 'Go to Dashboard' };
  }

  if (!options.isAuthenticated && has('login', 'log in', 'signin', 'sign in', 'anmelden')) {
    return { kind: 'navigate', href: '/stundenplan/login', label: 'Log in' };
  }

  if (!options.isAuthenticated && has('register', 'signup', 'sign up', 'registrieren')) {
    return { kind: 'navigate', href: '/stundenplan/register', label: 'Register' };
  }

  if (options.isAuthenticated && has('logout', 'log out', 'sign out', 'abmelden')) {
    return { kind: 'logout', label: 'Log out' };
  }

  if (options.isAuthenticated && has('settings', 'setting', 'einstellungen')) {
    return { kind: 'navigate', href: '/stundenplan/settings', label: 'Settings' };
  }

  if (options.isAuthenticated && has('timetable', 'edit timetable', 'stundenplan')) {
    return { kind: 'navigate', href: '/stundenplan/stundenplan', label: 'Edit Timetable' };
  }

  if (options.isAdmin && has('admin', 'admin panel')) {
    return { kind: 'navigate', href: '/stundenplan/admin', label: 'Admin Panel' };
  }

  if (options.isAdmin && has('admin setup', 'setup')) {
    return { kind: 'navigate', href: '/stundenplan/admin-setup', label: 'Admin Setup' };
  }

  if (options.isAdmin && options.isDemoMode && has('generate test data', 'test data', 'demo data')) {
    return { kind: 'navigate', href: '/stundenplan/admin', label: 'Generate test data' };
  }

  return null;
};

export function GlobalCommandMenu({ isDemoMode }: GlobalCommandMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [authState, setAuthState] = useState<CommandMenuAuthState>({ status: 'guest' });

  const isAuthenticated = authState.status === 'authenticated';
  const isAdmin = authState.status === 'authenticated' && authState.role === 'ADMIN';
  const searchIntent = useMemo(
    () => resolveCommandSearchIntent({ query, isAuthenticated }),
    [isAuthenticated, query]
  );
  const quickQueryAction = useMemo(
    () => resolveQuickQueryAction({ query, isAuthenticated, isAdmin, isDemoMode }),
    [isAdmin, isAuthenticated, isDemoMode, query]
  );

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
  };

  const navigate = (href: string) => {
    closeMenu();
    router.push(href);
  };

  useEffect(() => {
    closeMenu();
  }, [pathname, searchParamsString]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (isTypingTarget(event.target)) {
          return;
        }
        event.preventDefault();
        setOpen((previous) => !previous);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    const loadAuthState = async () => {
      setAuthState({ status: 'loading' });
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!active || controller.signal.aborted) {
          return;
        }

        if (response.status === 401) {
          setAuthState({ status: 'guest' });
          return;
        }

        if (!response.ok) {
          setAuthState({ status: 'guest' });
          return;
        }

        const data = (await response.json()) as {
          user?: {
            role?: AuthRole;
          };
        };

        if (data.user?.role === 'ADMIN' || data.user?.role === 'USER') {
          setAuthState({ status: 'authenticated', role: data.user.role });
          return;
        }

        setAuthState({ status: 'guest' });
      } catch {
        if (!active || controller.signal.aborted) {
          return;
        }
        setAuthState({ status: 'guest' });
      }
    };

    void loadAuthState();

    return () => {
      active = false;
      controller.abort();
    };
  }, [open]);

  const runSearch = () => {
    if (query.trim().length === 0) {
      return;
    }
    navigate(searchIntent.href);
  };

  const executeQuickAction = (action: QuickQueryAction) => {
    if (!action) {
      return;
    }

    if (action.kind === 'navigate') {
      navigate(action.href);
      return;
    }

    closeMenu();
    void signOut({ callbackUrl: '/' });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery('');
        }
      }}
    >
      <CommandInput
        placeholder="Type a command or search..."
        value={query}
        onValueChange={setQuery}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') {
            return;
          }

          if (quickQueryAction) {
            event.preventDefault();
            executeQuickAction(quickQueryAction);
            return;
          }

          if (query.trim().length > 0) {
            event.preventDefault();
            runSearch();
          }
        }}
      />
      <p className="border-b border-[rgb(var(--color-border)/0.16)] px-4 py-2 text-xs text-[rgb(var(--color-text-secondary))]">
        {quickQueryAction
          ? `Press Enter to run: ${quickQueryAction.label}`
          : query.trim().length > 0
            ? 'Press Enter to search'
            : 'Tip: type "login" or "dashboard"'}
      </p>
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem value="go-home" onSelect={() => navigate('/')}>
            <Home />
            <span>Go to Home</span>
          </CommandItem>
          <CommandItem value="go-dashboard" onSelect={() => navigate('/stundenplan/dashboard?scope=all')}>
            <LayoutDashboard />
            <span>Go to Dashboard</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {authState.status === 'loading' ? (
          <>
            <CommandGroup heading="Account">
              <CommandItem value="loading-account" disabled>
                Loading account commands...
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}

        {authState.status === 'guest' ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Guest">
              <CommandItem value="log-in" onSelect={() => navigate('/stundenplan/login')}>
                <LogIn />
                <span>Log in</span>
              </CommandItem>
              <CommandItem value="register" onSelect={() => navigate('/stundenplan/register')}>
                <UserPlus />
                <span>Register</span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}

        {isAuthenticated ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem value="edit-timetable" onSelect={() => navigate('/stundenplan/stundenplan')}>
                <Wrench />
                <span>Edit Timetable</span>
              </CommandItem>
              <CommandItem value="settings" onSelect={() => navigate('/stundenplan/settings')}>
                <Settings />
                <span>Settings</span>
              </CommandItem>
              <CommandItem
                value="log-out"
                onSelect={() => {
                  closeMenu();
                  void signOut({ callbackUrl: '/' });
                }}
              >
                <LogOut />
                <span>Log out</span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}

        {isAdmin ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem value="admin-panel" onSelect={() => navigate('/stundenplan/admin')}>
                <Shield />
                <span>Admin Panel</span>
              </CommandItem>
              <CommandItem value="admin-setup" onSelect={() => navigate('/stundenplan/admin-setup')}>
                <Shield />
                <span>Admin Setup</span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}

        {isAdmin && isDemoMode ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Debug">
              <CommandItem value="generate-test-data" onSelect={() => navigate('/stundenplan/admin')}>
                <Wrench />
                <span>Generate test data</span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
