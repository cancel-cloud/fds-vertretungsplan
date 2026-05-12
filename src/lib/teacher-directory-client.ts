import type {
  TeacherDeleteResponse,
  TeacherDirectoryResponse,
  TeacherDto,
  TeacherMutationResponse,
} from '@/types/user-system';

interface TeacherErrorResponse {
  error?: string;
}

export interface TeacherMutationInput {
  id?: string;
  code?: string;
  fullName?: string;
  isActive?: boolean;
}

const hasJsonContentType = (response: Response): boolean =>
  response.headers.get('content-type')?.toLowerCase().includes('application/json') ?? false;

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function readErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  if (!hasJsonContentType(response)) {
    return fallbackMessage;
  }

  try {
    const data = await parseJsonResponse<TeacherErrorResponse>(response);
    return data.error ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

const isTeacherDto = (value: unknown): value is TeacherDto =>
  Boolean(value) &&
  typeof value === 'object' &&
  typeof (value as TeacherDto).id === 'string' &&
  typeof (value as TeacherDto).code === 'string' &&
  typeof (value as TeacherDto).fullName === 'string' &&
  typeof (value as TeacherDto).isActive === 'boolean' &&
  typeof (value as TeacherDto).createdAt === 'string' &&
  typeof (value as TeacherDto).updatedAt === 'string';

const isTeacherDirectoryResponse = (value: unknown): value is TeacherDirectoryResponse =>
  Boolean(value) &&
  typeof value === 'object' &&
  Array.isArray((value as TeacherDirectoryResponse).teachers) &&
  (value as TeacherDirectoryResponse).teachers.every(isTeacherDto) &&
  Array.isArray((value as TeacherDirectoryResponse).subjectCodes) &&
  (value as TeacherDirectoryResponse).subjectCodes.every((item) => typeof item === 'string');

const isTeacherMutationResponse = (value: unknown): value is TeacherMutationResponse =>
  Boolean(value) && typeof value === 'object' && isTeacherDto((value as TeacherMutationResponse).teacher);

const isTeacherDeleteResponse = (value: unknown): value is TeacherDeleteResponse =>
  Boolean(value) && typeof value === 'object' && (value as TeacherDeleteResponse).ok === true;

async function assertTeacherDirectorySuccess<T>(
  response: Response,
  fallbackMessage: string,
  validator: (value: unknown) => value is T
): Promise<T> {
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackMessage));
  }

  if (!hasJsonContentType(response)) {
    throw new Error('Ungültige Serverantwort.');
  }

  let data: unknown;

  try {
    data = await parseJsonResponse(response);
  } catch {
    throw new Error('Ungültige Serverantwort.');
  }

  if (!validator(data)) {
    throw new Error('Ungültige Serverantwort.');
  }

  return data;
}

export async function fetchTeacherDirectory(): Promise<TeacherDirectoryResponse> {
  const response = await fetch('/api/admin/teachers');
  return assertTeacherDirectorySuccess(response, 'Lehrer-Daten konnten nicht geladen werden.', isTeacherDirectoryResponse);
}

export async function createTeacher(input: TeacherMutationInput): Promise<void> {
  const response = await fetch('/api/admin/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  await assertTeacherDirectorySuccess(response, 'Lehrer konnte nicht erstellt werden.', isTeacherMutationResponse);
}

export async function updateTeacher(input: TeacherMutationInput): Promise<void> {
  const response = await fetch('/api/admin/teachers', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  await assertTeacherDirectorySuccess(response, 'Lehrer konnte nicht aktualisiert werden.', isTeacherMutationResponse);
}

export async function deleteTeacher(id: string): Promise<void> {
  const response = await fetch('/api/admin/teachers', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  await assertTeacherDirectorySuccess(response, 'Lehrer konnte nicht gelöscht werden.', isTeacherDeleteResponse);
}
