/**
 * Base error class for Pinecall SDK
 */
export class PinecallError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} [code] - Error code
   * @param {number} [status] - HTTP status code
   * @param {Object} [details] - Additional error details
   */
  constructor(message, code = 'PINECALL_ERROR', status = 500, details = {}) {
    super(message);
    this.name = 'PinecallError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details
    };
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends PinecallError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends PinecallError {
  constructor(message = 'Resource not found', details = {}) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (409) - e.g., double booking
 */
export class ConflictError extends PinecallError {
  constructor(message = 'Resource conflict', details = {}) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends PinecallError {
  constructor(message = 'Invalid API key') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends PinecallError {
  constructor(message = 'Rate limit exceeded', retryAfter = 60) {
    super(message, 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}
