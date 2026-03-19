export type DashboardScope = 'personal' | 'all';

export const DASHBOARD_SCOPE_PARAM = 'scope';
export const DASHBOARD_SCOPE_DEFAULT: DashboardScope = 'personal';

export const parseDashboardScope = (value: string | null | undefined): DashboardScope =>
  value === 'all' ? 'all' : DASHBOARD_SCOPE_DEFAULT;

export const resolveDashboardScope = (
  value: string | null | undefined,
  fallback: DashboardScope = DASHBOARD_SCOPE_DEFAULT
): DashboardScope => (value == null ? fallback : parseDashboardScope(value));
