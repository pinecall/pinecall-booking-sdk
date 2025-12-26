import { BOOKING_ACTIONS } from '../constants.js';

/**
 * Bookings - Create and manage reservations
 */
export class Bookings {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * List bookings
   * @param {Object} params
   * @returns {Promise<{bookings: Array}>}
   */
  list(params) {
    const query = {
      configId: params.configurationId,
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
  get(id) {
    return this.#http.get('/api/bookings/manage', { id });
  }

  /**
   * Create a new booking
   * @param {Object} params
   * @returns {Promise<{booking: Object}>}
   */
  create(params) {
    return this.#http.post('/api/bookings/create', params);
  }

  /**
   * Confirm a booking
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason
   * @returns {Promise<{booking: Object}>}
   */
  confirm(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.CONFIRM, { reason });
  }

  /**
   * Cancel a booking
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason
   * @returns {Promise<{booking: Object}>}
   */
  cancel(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.CANCEL, { reason });
  }

  /**
   * Mark booking as completed
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason
   * @returns {Promise<{booking: Object}>}
   */
  complete(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.COMPLETE, { reason });
  }

  /**
   * Mark booking as no-show
   * @param {string} id - Booking ID
   * @param {string} [reason] - Reason
   * @returns {Promise<{booking: Object}>}
   */
  noShow(id, reason) {
    return this.#action(id, BOOKING_ACTIONS.NO_SHOW, { reason });
  }

  /**
   * Reschedule a booking
   * @param {string} id - Booking ID
   * @param {Object} params
   * @returns {Promise<{booking: Object}>}
   */
  reschedule(id, params) {
    return this.#action(id, BOOKING_ACTIONS.RESCHEDULE, {
      newStartTime: params.newStartTime,
      newEndTime: params.newEndTime
    });
  }

  /**
   * Get booking statistics
   * @param {string} configId - Configuration ID
   * @param {Object} [params]
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
