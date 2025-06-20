// Security utilities for Reflection Edge

// File upload security
export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['text/csv', 'application/json'];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFileUpload = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > FILE_SIZE_LIMIT) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${FILE_SIZE_LIMIT / 1024 / 1024}MB`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not allowed. Only CSV and JSON files are supported.`
    };
  }

  // Check file extension
  const allowedExtensions = ['.csv', '.json'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension "${fileExtension}" is not allowed. Only .csv and .json files are supported.`
    };
  }

  return { isValid: true };
};

// Input validation
export const validateTradeSymbol = (symbol: string): boolean => {
  // Allow alphanumeric characters, dots, hyphens, and underscores
  // Limit length to prevent abuse
  const symbolRegex = /^[A-Za-z0-9._-]{1,10}$/;
  return symbolRegex.test(symbol.trim());
};

export const validateNumericInput = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validateTagName = (name: string): boolean => {
  // Allow letters, numbers, spaces, hyphens, and underscores
  // Limit length to prevent abuse
  const tagRegex = /^[A-Za-z0-9\s_-]{1,50}$/;
  return tagRegex.test(name.trim()) && name.trim().length > 0;
};

export const validateDateString = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date.getTime() > 0;
};

export const validateTimeString = (timeStr: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

// Input sanitization
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
};

export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Basic HTML sanitization - remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
};

// JSON parsing with security
export const safeJsonParse = (jsonString: string): { success: boolean; data?: any; error?: string } => {
  try {
    // Check for prototype pollution attempts
    if (jsonString.includes('__proto__') || jsonString.includes('constructor')) {
      return {
        success: false,
        error: 'Invalid JSON content detected'
      };
    }
    
    const parsed = JSON.parse(jsonString);
    
    // Additional validation for expected structure
    if (parsed && typeof parsed === 'object') {
      return { success: true, data: parsed };
    }
    
    return {
      success: false,
      error: 'Invalid JSON structure'
    };
  } catch (error) {
    return {
      success: false,
      error: `JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Rate limiting for user actions
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  clear(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Secure random ID generation
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Data integrity checks
export const calculateDataHash = (data: any): string => {
  const jsonString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// Content Security Policy validation
export const validateCSP = (): boolean => {
  // Check if CSP is properly configured
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  return meta !== null;
};

// Export security configuration
export const SECURITY_CONFIG = {
  MAX_FILE_SIZE: FILE_SIZE_LIMIT,
  ALLOWED_FILE_TYPES,
  MAX_SYMBOL_LENGTH: 10,
  MAX_TAG_NAME_LENGTH: 50,
  MAX_JOURNAL_LENGTH: 1000,
  RATE_LIMIT_ATTEMPTS: 10,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
} as const; 