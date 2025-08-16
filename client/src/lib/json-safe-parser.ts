/**
 * Safe JSON parsing utilities to prevent JSON.parse errors
 */

interface ParseResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Safely parse JSON string with fallback handling
 */
export function safeJSONParse<T = any>(jsonString: string | null | undefined, fallback: T = null as T): ParseResult<T> {
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      success: false,
      data: fallback,
      error: 'Invalid input: not a string'
    };
  }

  try {
    // Handle empty or whitespace-only strings
    const trimmed = jsonString.trim();
    if (!trimmed) {
      return {
        success: false,
        data: fallback,
        error: 'Empty JSON string'
      };
    }

    // Basic validation - check if it looks like JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return {
        success: false,
        data: fallback,
        error: 'String does not appear to be JSON format'
      };
    }

    const parsed = JSON.parse(trimmed);
    return {
      success: true,
      data: parsed,
      error: undefined
    };
  } catch (error) {
    console.warn('JSON parsing error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      input: jsonString.substring(0, 100) + (jsonString.length > 100 ? '...' : ''),
      inputLength: jsonString.length
    });
    
    return {
      success: false,
      data: fallback,
      error: error instanceof Error ? error.message : 'JSON parsing failed'
    };
  }
}

/**
 * Safely extract WordPress data with proper typing
 */
export function safeParseWPData(wpData: string | null | undefined): any {
  const result = safeJSONParse(wpData, {});
  return result.data;
}

/**
 * Safely handle WRM API response data
 */
export function safeParseWRMResponse(response: any): {
  isArray: boolean;
  data: any[];
  success: boolean;
} {
  // Handle null/undefined
  if (!response) {
    return {
      isArray: false,
      data: [],
      success: false
    };
  }

  // Handle direct array response
  if (Array.isArray(response)) {
    return {
      isArray: true,
      data: response,
      success: true
    };
  }

  // Handle object with success/data structure
  if (typeof response === 'object') {
    if (response.success && Array.isArray(response.data)) {
      return {
        isArray: true,
        data: response.data,
        success: true
      };
    }

    // Handle nested array properties (plugins, themes, users)
    const possibleArrayKeys = ['plugins', 'themes', 'users', 'data'];
    for (const key of possibleArrayKeys) {
      if (Array.isArray(response[key])) {
        return {
          isArray: true,
          data: response[key],
          success: true
        };
      }
    }
  }

  // Fallback to empty array
  return {
    isArray: false,
    data: [],
    success: false
  };
}

/**
 * Debug helper to log data structure issues
 */
export function debugDataStructure(data: any, context: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}] Data structure debug:`, {
      type: typeof data,
      isArray: Array.isArray(data),
      isNull: data === null,
      isUndefined: data === undefined,
      hasSuccess: data?.success !== undefined,
      keys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
      length: Array.isArray(data) ? data.length : 'N/A'
    });
  }
}