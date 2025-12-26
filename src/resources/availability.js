/**
 * Availability - Query available time slots
 * 
 * @example
 * ```js
 * // Find available slots for tomorrow
 * const slots = await client.availability.query(configId, {
 *   startDate: '2025-01-20',
 *   endDate: '2025-01-20',
 *   filters: { seats: { $gte: 4 } }
 * });
 * 
 * // Check if specific slot is free
 * const { available } = await client.availability.check(resourceId, {
 *   startTime: '2025-01-20T19:00:00Z',
 *   endTime: '2025-01-20T21:00:00Z'
 * });
 * ```
 */
export class Availability {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * Query available slots
   * @param {string} configId - Configuration ID
   * @param {Object} params
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {number} [params.duration] - Slot duration in minutes
   * @param {Object} [params.filters] - Resource attribute filters
   * @returns {Promise<{summary: Object, resources: Array, availableSlots: Array}>}
   */
  query(configId, params) {
    const query = {
      configId,
      startDate: params.startDate,
      endDate: params.endDate
    };

    if (params.duration) {
      query.duration = params.duration;
    }

    if (params.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        query[`attr_${key}`] = typeof value === 'object' ? JSON.stringify(value) : value;
      }
    }

    return this.#http.get('/api/bookings/availability', query);
  }

  /**
   * Check if a specific slot is available
   * @param {string} resourceId - Resource ID
   * @param {Object} params
   * @param {string} params.startTime - Start time (ISO 8601)
   * @param {string} params.endTime - End time (ISO 8601)
   * @param {string} [params.excludeBookingId] - Booking ID to exclude (for rescheduling)
   * @returns {Promise<{available: boolean, reason?: string}>}
   */
  check(resourceId, params) {
    return this.#http.post('/api/bookings/availability', {
      resourceId,
      ...params
    });
  }
}
