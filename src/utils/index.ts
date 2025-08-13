/**
 * Utility functions for the Vertretungsplan application
 */

import { SubstitutionData } from "@/types";

/**
 * Generates a date string in YYYYMMDD format
 * @param offset - Number of days to offset from today (0 = today, 1 = tomorrow, etc.)
 * @returns Formatted date string
 */
export function generateDate(offset: number = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, consider using a library like DOMPurify
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Remove potentially dangerous tags and attributes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sorts substitution data by hour (first column)
 * @param data - Array of substitution data
 * @returns Sorted array
 */
export function sortSubstitutionsByHour(data: SubstitutionData[]): SubstitutionData[] {
  return [...data].sort((a: SubstitutionData, b: SubstitutionData) => {
    const stundeA = parseInt(a.data[0], 10);
    const stundeB = parseInt(b.data[0], 10);
    if (isNaN(stundeA) || isNaN(stundeB)) return 0;
    return stundeA - stundeB;
  });
}

/**
 * Filters substitution data based on search query
 * @param data - Array of substitution data
 * @param query - Search query string
 * @returns Filtered array
 */
export function filterSubstitutions(data: SubstitutionData[], query: string): SubstitutionData[] {
  if (!query.trim()) return data;
  
  const lowercaseQuery = query.toLowerCase();
  return data.filter(
    (item) =>
      item.group.toLowerCase().includes(lowercaseQuery) ||
      item.data.some((cell: string) =>
        cell.toLowerCase().includes(lowercaseQuery)
      )
  );
}

/**
 * Validates if a string contains potentially safe HTML content
 * @param content - Content to validate
 * @returns Boolean indicating if content appears safe
 */
export function isHtmlContentSafe(content: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /data:text\/html/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(content));
}