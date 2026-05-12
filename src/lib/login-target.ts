import { DASHBOARD_SCOPE_PARAM, type DashboardScope } from '@/lib/dashboard-scope';

type SearchParamsInput = URLSearchParams | string | null | undefined;

interface BuildLoginHrefOptions {
  scopeOverride?: DashboardScope;
}

const toSearchParams = (input: SearchParamsInput): URLSearchParams => {
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input.toString());
  }

  return new URLSearchParams(input ?? '');
};

export const buildPathWithSearchParams = (
  pathname: string,
  searchParams: SearchParamsInput,
  options: BuildLoginHrefOptions = {}
): string => {
  const params = toSearchParams(searchParams);

  if (options.scopeOverride) {
    params.set(DASHBOARD_SCOPE_PARAM, options.scopeOverride);
  }

  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ''}`;
};

export const buildLoginHref = (
  pathname: string,
  searchParams: SearchParamsInput,
  options: BuildLoginHrefOptions = {}
): string => `/stundenplan/login?next=${encodeURIComponent(buildPathWithSearchParams(pathname, searchParams, options))}`;
