/**
 * Array Safety Utilities - Prevents "t.map is not a function" errors in production
 * 
 * This module provides safe wrappers for array operations to prevent runtime errors
 * when data from APIs might be null, undefined, or not arrays.
 */

/**
 * Safely maps over an array, returning empty array if input is not an array
 * @param data - The data to map over
 * @param mapFn - The mapping function
 * @returns Mapped array or empty array if input is invalid
 */
export function safeMap<T, R>(data: any, mapFn: (item: T, index: number) => R): R[] {
  try {
    if (!Array.isArray(data)) {
      console.warn('safeMap: Input is not an array:', typeof data, data);
      return [];
    }
    return data.map(mapFn);
  } catch (error) {
    console.error('safeMap: Error during mapping:', error);
    return [];
  }
}

/**
 * Ensures input is an array, returns empty array if not
 * @param data - The data to ensure is an array
 * @returns Array or empty array
 */
export function ensureArray<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  console.warn('ensureArray: Input is not an array:', typeof data, data);
  return [];
}

/**
 * Safely filters an array
 * @param data - The data to filter
 * @param filterFn - The filter function
 * @returns Filtered array or empty array if input is invalid
 */
export function safeFilter<T>(data: any, filterFn: (item: T, index: number) => boolean): T[] {
  try {
    if (!Array.isArray(data)) {
      console.warn('safeFilter: Input is not an array:', typeof data, data);
      return [];
    }
    return data.filter(filterFn);
  } catch (error) {
    console.error('safeFilter: Error during filtering:', error);
    return [];
  }
}

/**
 * Gets safe length of an array-like object
 * @param data - The data to get length from
 * @returns Length or 0 if not array
 */
export function safeLength(data: any): number {
  if (Array.isArray(data)) {
    return data.length;
  }
  return 0;
}

/**
 * Safely checks if array has items
 * @param data - The data to check
 * @returns Boolean indicating if array has items
 */
export function hasItems(data: any): boolean {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Production-safe array access that prevents minification errors
 * @param data - The data that should be an array
 * @param errorContext - Context for error reporting
 * @returns Safe array
 */
export function productionSafeArray<T>(data: any, errorContext: string = 'unknown'): T[] {
  if (data === null || data === undefined) {
    console.warn(`productionSafeArray [${errorContext}]: Input is null/undefined`);
    return [];
  }
  
  if (!Array.isArray(data)) {
    console.warn(`productionSafeArray [${errorContext}]: Input is not array, type: ${typeof data}`, data);
    return [];
  }
  
  return data;
}