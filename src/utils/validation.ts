/**
 * Validation Utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * Get password strength label
 */
export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  label: string;
} {
  if (password.length < 8) {
    return { strength: 'weak', label: 'Too short' };
  }

  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score < 3) {
    return { strength: 'weak', label: 'Weak' };
  } else if (score < 4) {
    return { strength: 'medium', label: 'Medium' };
  } else {
    return { strength: 'strong', label: 'Strong' };
  }
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format credit card number with spaces
 */
export function formatCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.replace(/(\d{4})/g, '$1 ').trim();
}
