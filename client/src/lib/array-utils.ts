/**
 * Utility functions for safe array operations
 * Prevents "map is not a function" and similar errors
 */

export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export function safeMap<T, R>(
  value: unknown, 
  mapFn: (item: T, index: number, array: T[]) => R
): R[] {
  const arr = safeArray<T>(value);
  return arr.map(mapFn);
}

export function safeFilter<T>(
  value: unknown,
  filterFn: (item: T, index: number, array: T[]) => boolean
): T[] {
  const arr = safeArray<T>(value);
  return arr.filter(filterFn);
}

export function safeFlatMap<T, R>(
  value: unknown,
  mapFn: (item: T, index: number, array: T[]) => R | R[]
): R[] {
  const arr = safeArray<T>(value);
  return arr.flatMap(mapFn);
}

export function safeReduce<T, R>(
  value: unknown,
  reduceFn: (acc: R, item: T, index: number, array: T[]) => R,
  initialValue: R
): R {
  const arr = safeArray<T>(value);
  return arr.reduce(reduceFn, initialValue);
}

export function safeForEach<T>(
  value: unknown,
  forEachFn: (item: T, index: number, array: T[]) => void
): void {
  const arr = safeArray<T>(value);
  arr.forEach(forEachFn);
}