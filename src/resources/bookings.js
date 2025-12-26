import { BOOKING_ACTIONS } from '../constants.js';

/**
 * Bookings - Create and manage reservations
 * 
 * @example
 * ```js
 * // Create a booking
 * const booking = await client.bookings.create({
 *   configurationId: configId,
 *   resourceId: tableId,
 *   startTime: '2025-01-20T19:00:00Z',
 *   endTime: '2025-01-20T21:00:00Z',
 *   customer: { name: 'John Doe', email: 'john@example.com' }
 * });
 * 
 * // Confirm it
 * await client.bookings.confirm(booking.booking._id);
 * ```
 */
export class Bookings {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * List bookings
   * @param {string} configId - Configuration ID
   * @param {Object} params
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string|string[]} [params.status] - Filter by status
   * @param {string} [params.resourceId] - Filter by resource
   * @param {string} [params.search] - Search customer name/email
   * @returns {Promise<{bookings: Array}>}
   */
  list(configId, params) {
    const query = {
      configId,
      startDate: params.startDate,
      endDate: params.endDate
    };

    if (params.status) {
      query.status = Array.isArray(params.status) ? params.status.join(',') : params.status;
    }
    if (params.resourceId) query.resourceId = params.resourceId;
    if (params.search) query.search = params.search;

    return this.#http.get('/api/bookings/manage', query);
  }

  /**
   * Get a booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<{booking: Object}>}
   */
  retrieve(id) {
    return this.#http.get('/api/bookings/manage', { id });
  }

  /**
   * Create a new booking
   * @param {Object} params
   * @param {string} params.configurationId - Configuration ID
   * @param {string} params.resourceId - Resource ID
   * @param {string} params.startTime - Start time (ISO 8601)
   * @param {string} [params.endTime] - End time (ISO 8601)
   * @param {number} [params.duration] - Duration in minutes (alternative to endTime)
   * @param {Object} params.customer - Customer info
   * @param {string} params.customer.name - Customer name
   * @param {string} [params.customer.email] - Customer email
   * @param {string} [params.customer.phone] - Customer phone
   * @param {Object} [params.attributes] - Booking attributes
   * @param {string} [params.internalNotes] - Internal notes
   * @returns {Promise<{booking: Object}>}
   */
  create(params) {
    return this.#http.post('/api/bookings/create', params);
  }

  /**
   * Confirm a booking
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason for confirmation
   * @returns {Promise<{booking: Object}>}
   */
  confirm(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.CONFIRM, { reason });
  }

  /**
   * Cancel a booking
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason for cancellation
   * @returns {Promise<{booking: Object}>}
   */
  cancel(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.CANCEL, { reason });
  }

  /**
   * Mark booking as completed
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason/notes
   * @returns {Promise<{booking: Object}>}
   */
  complete(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.COMPLETE, { reason });
  }

  /**
   * Mark booking as no-show
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason/notes
   * @returns {Promise<{booking: Object}>}
   */
  noShow(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.NO_SHOW, { reason });
  }

  /**
   * Reschedule a booking
   * @param {string} id - Booking ID
   * @param {Object} params
   * @param {string} params.startTime - New start time (ISO 8601)
   * @param {string} params.endTime - New end time (ISO 8601)
   * @returns {Promise<{booking: Object}>}
   */
  reschedule(id, params) {
    return this.#action(id, BOOKING_ACTIONS.RESCHEDULE, {
      newStartTime: params.startTime,
      newEndTime: params.endTime
    });
  }

  /**
   * Get booking statistics
   * @param {string} configId - Configuration ID
   * @param {Object} [params]
   * @param {string} [params.startDate] - Start date
   * @param {string} [params.endDate] - End date
   * @returns {Promise<{stats: Object}>}
   */
  stats(configId, params = {}) {
    return this.#http.get('/api/bookings/manage', {
      configId,
      stats: 'true',
      ...params
    });
  }

  #action(bookingId, action, params = {}) {
    return this.#http.post('/api/bookings/manage', {
      bookingId,
      action,
      ...params
    });
  }
}
