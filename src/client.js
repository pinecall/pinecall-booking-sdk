import { HttpClient } from './http.js';
import { Configurations } from './resources/configurations.js';
import { Resources } from './resources/resources.js';
import { Availability } from './resources/availability.js';
import { Bookings } from './resources/bookings.js';
import { ValidationError } from './errors.js';

/**
 * Pinecall Booking SDK Client
 * 
 * A simple, elegant client for the Pinecall Booking API.
 * Inspired by Stripe's SDK design.
 * 
 * @example
 * ```js
 * import { Pinecall } from '@pinecall/booking-sdk';
 * 
 * const client = new Pinecall('pk_your_api_key');
 * 
 * // Or with options
 * const client = new Pinecall('pk_your_api_key', {
 *   baseUrl: 'https://api.pinecall.com',
 *   timeout: 30000
 * });
 * ```
 */
export class Pinecall {
  /** @type {Configurations} */
  configurations;
  
  /** @type {Resources} */
  resources;
  
  /** @type {Availability} */
  availability;
  
  /** @type {Bookings} */
  bookings;

  /**
   * Create a new Pinecall client
   * @param {string} apiKey - Your Pinecall API key
   * @param {Object} [options]
   * @param {string} [options.baseUrl='https://api.pinecall.com'] - API base URL
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @param {number} [options.maxRetries=3] - Maximum retry attempts
   */
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new ValidationError('API key is required');
    }

    const http = new HttpClient({
      apiKey,
      baseUrl: options.baseUrl || 'https://api.pinecall.com',
      timeout: options.timeout || 30000,
      maxRetries: options.maxRetries || 3
    });

    // Initialize resource managers
    this.configurations = new Configurations(http);
    this.resources = new Resources(http);
    this.availability = new Availability(http);
    this.bookings = new Bookings(http);
  }

  // ═══════════════════════════════════════════════════════════════
  // STATIC HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get a date string for N days in the future
   * @param {number} [days=1] - Days ahead
   * @returns {string} Date string (YYYY-MM-DD)
   * 
   * @example
   * Pinecall.futureDate(7) // '2025-01-27'
   */
  static futureDate(days = 1) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get a datetime string for N days in the future at specific time
   * @param {number} [days=1] - Days ahead
   * @param {number} [hour=12] - Hour (0-23)
   * @param {number} [minute=0] - Minute (0-59)
   * @returns {string} ISO 8601 datetime string
   * 
   * @example
   * Pinecall.futureDateTime(7, 19, 0) // '2025-01-27T19:00:00.000Z'
   */
  static futureDateTime(days = 1, hour = 12, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setUTCHours(hour, minute, 0, 0);
    return date.toISOString();
  }

  /**
   * Format a Date object to API date format
   * @param {Date|string} date - Date to format
   * @returns {string} Date string (YYYY-MM-DD)
   */
  static formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  /**
   * Format a Date object to API datetime format
   * @param {Date|string} date - Date to format
   * @returns {string} ISO 8601 datetime string
   */
  static formatDateTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  }
}
