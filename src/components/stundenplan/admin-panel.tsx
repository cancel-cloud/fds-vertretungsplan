'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface TeacherItem {
  id: string;
  code: string;
  fullName: string;
  isActive: boolean;
}

interface AdminUserItem {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  notificationsEnabled: boolean;
  notificationLookaheadSchoolDays: number;
  timetableCount: number;
  pushSubscriptionCount: number;
  createdAt: string;
  notificationStats: {
    totalFingerprints: number;
    activeStates: number;
    lastSentAt: string | null;
    lastTargetDate: number | null;
  } | null;
  subscriptionStats: {
    lastSeenAt: string | null;
    lastUpdatedAt: string | null;
  } | null;
}

interface UsersPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const USERS_PAGE_SIZE = 20;

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const formatTargetDate = (value: number | null): string => {
  if (!value) {
    return '—';
  }

  const date = String(value);
  if (!/^\d{8}$/.test(date)) {
    return String(value);
  }

  return `${date.slice(6, 8)}.${date.slice(4, 6)}.${date.slice(0, 4)}`;
};

interface AdminPanelProps {
  currentUserId: string;
  isDemoMode?: boolean;
}

interface UserUpdateResult {
  ok: boolean;
  selfDemoted: boolean;
  error: string | null;
}

interface UserUpdateOptions {
  suppressGlobalError?: boolean;
}

export function AdminPanel({ currentUserId, isDemoMode = false }: AdminPanelProps) {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [subjectCodes, setSubjectCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState<UsersPagination>({
    page: 1,
    pageSize: USERS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [newCode, setNewCode] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editingTeacherCode, setEditingTeacherCode] = useState('');
  const [editingTeacherName, setEditingTeacherName] = useState('');

  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [demoDataBusyUserId, setDemoDataBusyUserId] = useState<string | null>(null);
  const [demoDataMessage, setDemoDataMessage] = useState<string | null>(null);
  const [pushTestBusy, setPushTestBusy] = useState(false);
  const [pushTestMessage, setPushTestMessage] = useState<string | null>(null);
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [roleConfirmTarget, setRoleConfirmTarget] = useState<{ id: string; email: string; currentRole: 'USER' | 'ADMIN' } | null>(
    null
  );
  const [roleConfirmEmailInput, setRoleConfirmEmailInput] = useState('');
  const [roleConfirmBusy, setRoleConfirmBusy] = useState(false);
  const [roleConfirmError, setRoleConfirmError] = useState<string | null>(null);

  const load = useCallback(async (targetUsersPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const [teachersResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/teachers'),
        fetch(`/api/admin/users?page=${targetUsersPage}&pageSize=${USERS_PAGE_SIZE}`),
      ]);

      const teachersData = (await teachersResponse.json()) as {
        teachers?: TeacherItem[];
        subjectCodes?: string[];
        error?: string;
      };

      if (!teachersResponse.ok) {
        throw new Error(teachersData.error ?? 'Lehrer-Daten konnten nicht geladen werden.');
      }

      const usersData = (await usersResponse.json()) as {
        users?: AdminUserItem[];
        pagination?: UsersPagination;
        error?: string;
      };

      if (!usersResponse.ok) {
        throw new Error(usersData.error ?? 'User-Daten konnten nicht geladen werden.');
      }

      setTeachers(teachersData.teachers ?? []);
      setSubjectCodes(teachersData.subjectCodes ?? []);
      setUsers(usersData.users ?? []);
      setUsersPagination(
        usersData.pagination ?? {
          page: targetUsersPage,
          pageSize: USERS_PAGE_SIZE,
          total: usersData.users?.length ?? 0,
          totalPages: 1,
        }
      );
      setUsersPage(usersData.pagination?.page ?? targetUsersPage);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Admin-Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const addTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newCode,
          fullName: newFullName,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Lehrer konnte nicht erstellt werden.');
      }

      setNewCode('');
      setNewFullName('');
      await load(usersPage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Lehrer konnte nicht erstellt werden.');
    } finally {
      setSaving(false);
    }
  };

  const startTeacherEdit = (teacher: TeacherItem) => {
    setEditingTeacherId(teacher.id);
    setEditingTeacherCode(teacher.code);
    setEditingTeacherName(teacher.fullName);
  };

  const cancelTeacherEdit = () => {
    setEditingTeacherId(null);
    setEditingTeacherCode('');
    setEditingTeacherName('');
  };

  const saveTeacherEdit = async (teacherId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: teacherId,
          code: editingTeacherCode,
          fullName: editingTeacherName,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Lehrer konnte nicht aktualisiert werden.');
      }

      cancelTeacherEdit();
      await load(usersPage);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Lehrer konnte nicht aktualisiert werden.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTeacher = async (teacher: TeacherItem) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: teacher.id,
          isActive: !teacher.isActive,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Lehrer konnte nicht geändert werden.');
      }

      await load(usersPage);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Lehrer konnte nicht geändert werden.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTeacher = async (id: string) => {
    const confirmed = window.confirm('Lehrer wirklich löschen?');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Lehrer konnte nicht gelöscht werden.');
      }

      await load(usersPage);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Lehrer konnte nicht gelöscht werden.');
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (
    userId: string,
    changes: { role?: 'USER' | 'ADMIN'; notificationsEnabled?: boolean; confirmationEmail?: string },
    options?: UserUpdateOptions
  ): Promise<UserUpdateResult> => {
    setBusyUserId(userId);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, ...changes }),
      });

      const data = (await response.json()) as { error?: string; selfDemoted?: boolean };
      if (!response.ok) {
        throw new Error(data.error ?? 'Benutzer konnte nicht aktualisiert werden.');
      }

      const selfDemoted = data.selfDemoted === true;
      if (selfDemoted) {
        await signOut({ callbackUrl: '/stundenplan/login' });
        return { ok: true, selfDemoted: true, error: null };
      }

      await load(usersPage);
      return { ok: true, selfDemoted: false, error: null };
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Benutzer konnte nicht aktualisiert werden.';
      if (!options?.suppressGlobalError) {
        setError(message);
      }
      return { ok: false, selfDemoted: false, error: message };
    } finally {
      setBusyUserId(null);
    }
  };

  const resetRoleConfirm = () => {
    setRoleConfirmOpen(false);
    setRoleConfirmTarget(null);
    setRoleConfirmEmailInput('');
    setRoleConfirmError(null);
    setRoleConfirmBusy(false);
  };

  const openRoleConfirm = (user: AdminUserItem) => {
    setRoleConfirmTarget({ id: user.id, email: user.email, currentRole: user.role });
    setRoleConfirmEmailInput('');
    setRoleConfirmError(null);
    setRoleConfirmBusy(false);
    setRoleConfirmOpen(true);
  };

  const handleRoleAction = (user: AdminUserItem) => {
    if (user.role === 'ADMIN') {
      openRoleConfirm(user);
      return;
    }

    void updateUser(user.id, { role: 'ADMIN' });
  };

  const submitRoleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!roleConfirmTarget) {
      return;
    }

    const expectedEmail = normalizeEmail(roleConfirmTarget.email);
    const enteredEmail = normalizeEmail(roleConfirmEmailInput);
    if (enteredEmail !== expectedEmail) {
      setRoleConfirmError('Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.');
      return;
    }

    setRoleConfirmBusy(true);
    setRoleConfirmError(null);

    const result = await updateUser(
      roleConfirmTarget.id,
      {
        role: 'USER',
        confirmationEmail: roleConfirmEmailInput,
      },
      { suppressGlobalError: true }
    );

    if (!result.ok) {
      setRoleConfirmError(result.error ?? 'Benutzer konnte nicht aktualisiert werden.');
      setRoleConfirmBusy(false);
      return;
    }

    resetRoleConfirm();
  };

  const onboardingState = (user: AdminUserItem): string => {
    if (user.onboardingCompletedAt) {
      return 'Abgeschlossen';
    }

    if (user.onboardingSkippedAt) {
      return 'Übersprungen';
    }

    return 'Offen';
  };

  const sendPushTest = async () => {
    setPushTestBusy(true);
    setPushTestMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = (await response.json()) as {
        error?: string;
        sent?: number;
        traceId?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Test-Benachrichtigung konnte nicht gesendet werden.');
      }

      const sentCount = typeof data.sent === 'number' ? data.sent : 0;
      const trace = typeof data.traceId === 'string' && data.traceId.length > 0 ? ` Trace: ${data.traceId}` : '';
      setPushTestMessage(`Test-Benachrichtigung wurde an ${sentCount} Gerät(e) gesendet.${trace}`);
    } catch (sendError) {
      setPushTestMessage(
        sendError instanceof Error ? sendError.message : 'Test-Benachrichtigung konnte nicht gesendet werden.'
      );
    } finally {
      setPushTestBusy(false);
    }
  };

  const generateDemoDataForUser = async (user: AdminUserItem) => {
    setDemoDataBusyUserId(user.id);
    setDemoDataMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = (await response.json()) as {
        error?: string;
        selectedDates?: { past: number; today: number; future: number };
        guarantees?: { pastMatches: number; todayMatches: number; futureMatches: number };
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Demo-Daten konnten nicht erzeugt werden.');
      }

      const dates = data.selectedDates;
      const guarantees = data.guarantees;
      const summary = dates && guarantees
        ? `Demo-Daten für ${user.email} erzeugt. Past ${dates.past} (${guarantees.pastMatches}), Today ${dates.today} (${guarantees.todayMatches}), Future ${dates.future} (${guarantees.futureMatches}).`
        : `Demo-Daten für ${user.email} wurden erzeugt.`;
      setDemoDataMessage(summary);

      await load(usersPage);
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : 'Demo-Daten konnten nicht erzeugt werden.';
      setDemoDataMessage(message);
    } finally {
      setDemoDataBusyUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Push-Tests</h2>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Teste Push-Zustellung für den aktuell angemeldeten Admin-Account.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => void sendPushTest()} loading={pushTestBusy}>
            Test senden
          </Button>
        </div>
        {pushTestMessage ? (
          <p
            className="mt-3 rounded-md bg-[rgb(var(--color-background)/0.85)] px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))]"
            aria-live="polite"
          >
            {pushTestMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Lehrer-Verzeichnis</h2>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Ordne Lehrer-Kürzel den vollen Namen zu. Onboarding nutzt diese Liste als Autocomplete.
        </p>

        <form className="mt-4 grid gap-2 md:grid-cols-[180px_1fr_auto]" onSubmit={addTeacher}>
          <div>
            <label htmlFor="new-code" className="mb-1 block text-sm font-medium">Kürzel</label>
            <Input
              id="new-code"
              name="new-code"
              autoComplete="off"
              spellCheck={false}
              value={newCode}
              onChange={(event) => setNewCode(event.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label htmlFor="new-name" className="mb-1 block text-sm font-medium">Voller Name</label>
            <Input
              id="new-name"
              name="new-name"
              value={newFullName}
              onChange={(event) => setNewFullName(event.target.value)}
              required
            />
          </div>
          <div className="self-end">
            <Button type="submit" loading={saving}>
              Hinzufügen
            </Button>
          </div>
        </form>

        {loading ? <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">Lade Lehrer…</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--color-border)/0.2)] text-left">
                <th className="px-2 py-2">Kürzel</th>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => {
                const isEditing = editingTeacherId === teacher.id;

                return (
                  <tr key={teacher.id} className="border-b border-[rgb(var(--color-border)/0.15)]">
                    <td className="px-2 py-2 font-medium">
                      {isEditing ? (
                        <Input
                          value={editingTeacherCode}
                          onChange={(event) => setEditingTeacherCode(event.target.value.toUpperCase())}
                          autoComplete="off"
                          spellCheck={false}
                          aria-label="Lehrer-Kürzel bearbeiten"
                        />
                      ) : (
                        teacher.code
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {isEditing ? (
                        <Input
                          value={editingTeacherName}
                          onChange={(event) => setEditingTeacherName(event.target.value)}
                          aria-label="Lehrer-Name bearbeiten"
                        />
                      ) : (
                        teacher.fullName
                      )}
                    </td>
                    <td className="px-2 py-2">{teacher.isActive ? 'Aktiv' : 'Inaktiv'}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button type="button" size="sm" onClick={() => saveTeacherEdit(teacher.id)} loading={saving}>
                              Speichern
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={cancelTeacherEdit} disabled={saving}>
                              Abbrechen
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button type="button" size="sm" variant="outline" onClick={() => startTeacherEdit(teacher)}>
                              Bearbeiten
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => toggleTeacher(teacher)} loading={saving}>
                              {teacher.isActive ? 'Deaktivieren' : 'Aktivieren'}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => deleteTeacher(teacher.id)} loading={saving}>
                              Löschen
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Benutzer</h2>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Übersicht über alle Accounts, Rollen und Onboarding-Status.
        </p>

        {loading ? <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">Lade Benutzer…</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1140px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--color-border)/0.2)] text-left">
                <th className="px-2 py-2">E-Mail</th>
                <th className="px-2 py-2">Rolle</th>
                <th className="px-2 py-2">Onboarding</th>
                <th className="px-2 py-2">Stundenplan</th>
                <th className="px-2 py-2">Push Subs</th>
                <th className="px-2 py-2">Notifications</th>
                <th className="px-2 py-2">Lookahead</th>
                <th className="px-2 py-2">Push Debug</th>
                <th className="px-2 py-2">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[rgb(var(--color-border)/0.15)]">
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">{user.role}</td>
                  <td className="px-2 py-2">{onboardingState(user)}</td>
                  <td className="px-2 py-2">{user.timetableCount}</td>
                  <td className="px-2 py-2">{user.pushSubscriptionCount}</td>
                  <td className="px-2 py-2">{user.notificationsEnabled ? 'Aktiv' : 'Aus'}</td>
                  <td className="px-2 py-2">{user.notificationLookaheadSchoolDays}</td>
                  <td className="px-2 py-2 text-xs">
                    <div>Letzter Versand: {user.notificationStats?.lastSentAt ? new Date(user.notificationStats.lastSentAt).toLocaleString('de-DE') : '—'}</div>
                    <div>Ziel-Tag: {formatTargetDate(user.notificationStats?.lastTargetDate ?? null)}</div>
                    <div>Aktive States: {user.notificationStats?.activeStates ?? 0}</div>
                    <div>Fingerprints: {user.notificationStats?.totalFingerprints ?? 0}</div>
                    <div>Sub zuletzt gesehen: {user.subscriptionStats?.lastSeenAt ? new Date(user.subscriptionStats.lastSeenAt).toLocaleString('de-DE') : '—'}</div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleAction(user)}
                        loading={busyUserId === user.id}
                      >
                        {user.role === 'ADMIN' ? 'Zu USER' : 'Zu ADMIN'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void updateUser(user.id, {
                            notificationsEnabled: !user.notificationsEnabled,
                          })
                        }
                        loading={busyUserId === user.id}
                      >
                        Notifications {user.notificationsEnabled ? 'aus' : 'an'}
                      </Button>
                      {isDemoMode ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void generateDemoDataForUser(user)}
                          loading={demoDataBusyUserId === user.id}
                          disabled={user.timetableCount === 0}
                        >
                          Demo-Daten generieren
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Seite {usersPagination.page} von {usersPagination.totalPages} · {usersPagination.total} Benutzer
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={usersPage <= 1 || loading}
              onClick={() => {
                void load(usersPage - 1);
              }}
            >
              Zurück
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={usersPage >= usersPagination.totalPages || loading}
              onClick={() => {
                void load(usersPage + 1);
              }}
            >
              Weiter
            </Button>
          </div>
        </div>

        {isDemoMode && demoDataMessage ? (
          <p
            className="mt-3 rounded-md bg-[rgb(var(--color-background)/0.85)] px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))]"
            aria-live="polite"
          >
            {demoDataMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Fach-Kürzel (ohne Auflösung)</h2>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Liste aller aktuell verwendeten Fach-Kürzel aus den Nutzer-Stundenplänen.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {subjectCodes.length > 0 ? (
            subjectCodes.map((code) => (
              <span
                key={code}
                className="rounded-full border border-[rgb(var(--color-border)/0.25)] bg-[rgb(var(--color-background)/0.8)] px-3 py-1 text-sm"
              >
                {code}
              </span>
            ))
          ) : (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Noch keine Fach-Kürzel vorhanden.</p>
          )}
        </div>
      </section>

      {error ? (
        <p
          className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      <Dialog
        open={roleConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (roleConfirmBusy) {
              return;
            }
            resetRoleConfirm();
            return;
          }
          setRoleConfirmOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin-Rechte entfernen</DialogTitle>
            <DialogDescription>
              Bitte geben Sie zur Bestätigung die E-Mail-Adresse <strong>{roleConfirmTarget?.email ?? '—'}</strong> ein.
            </DialogDescription>
          </DialogHeader>
          {roleConfirmTarget?.id === currentUserId ? (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Dieses Konto wird nach Bestätigung sofort abgemeldet.
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={submitRoleConfirm}>
            <div className="space-y-2 pb-1">
              <label htmlFor="role-confirm-email" className="text-sm font-medium text-[rgb(var(--color-text))]">
                E-Mail zur Bestätigung
              </label>
              <Input
                id="role-confirm-email"
                type="email"
                value={roleConfirmEmailInput}
                onChange={(event) => setRoleConfirmEmailInput(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={roleConfirmBusy}
              />
            </div>
            {roleConfirmError ? (
              <p className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]">
                {roleConfirmError}
              </p>
            ) : null}
            <DialogFooter className="border-t border-[rgb(var(--color-border)/0.2)] pt-4">
              <Button type="button" variant="outline" onClick={resetRoleConfirm} disabled={roleConfirmBusy}>
                Abbrechen
              </Button>
              <Button
                type="submit"
                loading={roleConfirmBusy}
                disabled={
                  normalizeEmail(roleConfirmEmailInput) !== normalizeEmail(roleConfirmTarget?.email ?? '')
                }
              >
                Herabstufen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
