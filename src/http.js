import { PinecallError, AuthenticationError, NotFoundError, ValidationError, RateLimitError } from './errors.js';

/**
 * HTTP client with retry logic and error handling
 */
export class HttpClient {
  #apiKey;
  #baseUrl;
  #timeout;
  #maxRetries;

  /**
   * @param {Object} config
   * @param {string} config.apiKey - API key
   * @param {string} [config.baseUrl] - Base URL
   * @param {number} [config.timeout] - Request timeout in ms
   * @param {number} [config.maxRetries] - Max retry attempts
   */
  constructor({ apiKey, baseUrl = 'https://api.pinecall.com', timeout = 30000, maxRetries = 3 }) {
    this.#apiKey = apiKey;
    this.#baseUrl = baseUrl.replace(/\/$/, '');
    this.#timeout = timeout;
    this.#maxRetries = maxRetries;
  }

  /**
   * Make HTTP request with automatic retry
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} [options] - Request options
   * @returns {Promise<any>}
   */
  async request(method, path, options = {}) {
    const url = `${this.#baseUrl}${path}`;
    const { body, query, headers: customHeaders = {} } = options;

    // Build URL with query params
    const urlWithQuery = query 
      ? `${url}?${new URLSearchParams(this.#flattenQuery(query))}` 
      : url;

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.#apiKey,
      'User-Agent': '@pinecall/booking-sdk/1.0.0',
      ...customHeaders
    };

    const fetchOptions = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    return this.#executeWithRetry(urlWithQuery, fetchOptions);
  }

  /**
   * Execute request with retry logic
   */
  async #executeWithRetry(url, options, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.#timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw this.#createError(response.status, data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors or 5xx
      if (this.#shouldRetry(error, attempt)) {
        const delay = this.#getRetryDelay(attempt);
        await this.#sleep(delay);
        return this.#executeWithRetry(url, options, attempt + 1);
      }

      if (error.name === 'AbortError') {
        throw new PinecallError(`Request timeout after ${this.#timeout}ms`, 'TIMEOUT', 408);
      }

      throw error instanceof PinecallError ? error : new PinecallError(error.message);
    }
  }

  /**
   * Create appropriate error from response
   */
  #createError(status, data) {
    const message = data.error || data.message || 'Unknown error';

    switch (status) {
      case 400: return new ValidationError(message, data.details);
      case 401: return new AuthenticationError(message);
      case 404: return new NotFoundError(message);
      case 429: return new RateLimitError(message, data.retryAfter);
      default: return new PinecallError(message, data.code || 'API_ERROR', status, data);
    }
  }

  #shouldRetry(error, attempt) {
    if (attempt >= this.#maxRetries) return false;
    if (error instanceof RateLimitError) return true;
    if (error.status >= 500) return true;
    if (error.name === 'AbortError') return true;
    return false;
  }

  #getRetryDelay(attempt) {
    // Exponential backoff: 1s, 2s, 4s...
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  #flattenQuery(query, prefix = '') {
    const params = {};
    
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      
      const paramKey = prefix ? `${prefix}_${key}` : key;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        // For attribute filters, stringify the object
        if (key.startsWith('attr') || prefix === 'attr') {
          params[paramKey] = JSON.stringify(value);
        } else {
          Object.assign(params, this.#flattenQuery(value, paramKey));
        }
      } else if (Array.isArray(value)) {
        params[paramKey] = value.join(',');
      } else {
        params[paramKey] = String(value);
      }
    }
    
    return params;
  }

  // Convenience methods
  get(path, query) { return this.request('GET', path, { query }); }
  post(path, body) { return this.request('POST', path, { body }); }
  put(path, body) { return this.request('PUT', path, { body }); }
  delete(path, body) { return this.request('DELETE', path, { body }); }
}
