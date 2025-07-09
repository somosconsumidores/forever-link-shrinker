// Security utility functions

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes URL input
 */
export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  if (url.length > 2000) {
    return { isValid: false, error: 'URL is too long (max 2000 characters)' };
  }

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  if (dangerousProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
    return { isValid: false, error: 'URL contains dangerous protocol' };
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validates custom alias input
 */
export const validateCustomAlias = (alias: string): { isValid: boolean; error?: string } => {
  if (!alias) return { isValid: true }; // Optional field

  if (alias.length > 50) {
    return { isValid: false, error: 'Custom alias too long (max 50 characters)' };
  }

  if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
    return { isValid: false, error: 'Custom alias can only contain letters, numbers, and hyphens' };
  }

  const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'dashboard', 'auth', 'login', 'signup', 'analytics'];
  if (reservedWords.includes(alias.toLowerCase())) {
    return { isValid: false, error: 'This custom alias is reserved' };
  }

  return { isValid: true };
};

/**
 * Encrypts data for localStorage storage (basic obfuscation)
 */
export const encryptForStorage = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch {
    return JSON.stringify(data); // Fallback to plain JSON
  }
};

/**
 * Decrypts data from localStorage
 */
export const decryptFromStorage = (encryptedData: string): any => {
  try {
    const decoded = decodeURIComponent(escape(atob(encryptedData)));
    return JSON.parse(decoded);
  } catch {
    try {
      return JSON.parse(encryptedData); // Fallback for plain JSON
    } catch {
      return null;
    }
  }
};

/**
 * Generates a secure random string
 */
export const generateSecureId = (length: number = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};