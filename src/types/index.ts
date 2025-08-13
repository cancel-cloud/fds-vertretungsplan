/**
 * Type definitions for the Vertretungsplan application
 */

export interface SubstitutionData {
  data: string[];
  group: string;
  [key: string]: any;
}

export interface SubstitutionApiResponse {
  payload?: {
    rows: SubstitutionData[];
  };
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
}

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}