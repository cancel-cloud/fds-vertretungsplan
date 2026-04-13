import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTeacher, deleteTeacher, fetchTeacherDirectory, updateTeacher } from '@/lib/teacher-directory-client';

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const teacher = {
  id: 'teacher-1',
  code: 'AB',
  fullName: 'Alice Becker',
  isActive: true,
  createdAt: '2026-02-16T10:00:00.000Z',
  updatedAt: '2026-02-16T10:00:00.000Z',
};

describe('teacher-directory-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the teacher directory for valid GET responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          teachers: [teacher],
          subjectCodes: ['MATH'],
        })
      )
    );

    await expect(fetchTeacherDirectory()).resolves.toEqual({
      teachers: [teacher],
      subjectCodes: ['MATH'],
    });
  });

  it('rejects 2xx non-json teacher directory responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>ok</html>', { status: 200, headers: { 'Content-Type': 'text/html' } }))
    );

    await expect(fetchTeacherDirectory()).rejects.toThrow('Ungültige Serverantwort.');
  });

  it('rejects 2xx responses with malformed success shapes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          teachers: [],
          subjectCodes: 'MATH',
        })
      )
    );

    await expect(fetchTeacherDirectory()).rejects.toThrow('Ungültige Serverantwort.');
  });

  it('surfaces JSON error payloads for non-2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse(
          {
            error: 'Lehrer-Daten konnten nicht geladen werden.',
          },
          400
        )
      )
    );

    await expect(fetchTeacherDirectory()).rejects.toThrow('Lehrer-Daten konnten nicht geladen werden.');
  });

  it('falls back to the generic message when non-2xx responses are not parseable JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('upstream down', { status: 500 })));

    await expect(fetchTeacherDirectory()).rejects.toThrow('Lehrer-Daten konnten nicht geladen werden.');
  });

  it('requires teacher payloads for successful mutations and ok=true for deletes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ teacher }, 201))
      .mockResolvedValueOnce(createJsonResponse({ teacher }))
      .mockResolvedValueOnce(createJsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(createTeacher({ code: 'AB', fullName: 'Alice Becker' })).resolves.toBeUndefined();
    await expect(updateTeacher({ id: 'teacher-1', fullName: 'Alice Updated' })).resolves.toBeUndefined();
    await expect(deleteTeacher('teacher-1')).resolves.toBeUndefined();
  });
});
