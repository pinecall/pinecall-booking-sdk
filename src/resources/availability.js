/**
 * Availability - Query available time slots
 */
export class Availability {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * Query available slots
   * @param {Object} params
   * @returns {Promise<{summary: Object, resources: Array, availableSlots: Array}>}
   */
  query(params) {
    const query = {
      configId: params.configurationId,
      startDate: params.startDate,
      endDate: params.endDate
    };

    if (params.duration) {
      query.duration = params.duration;
    }

    if (params.resourceFilters) {
      for (const [key, value] of Object.entries(params.resourceFilters)) {
        query[`attr_${key}`] = typeof value === 'object' ? JSON.stringify(value) : value;
      }
    }

    return this.#http.get('/api/bookings/availability', query);
  }

  /**
   * Check if a specific slot is available
   * @param {Object} params
   * @returns {Promise<{available: boolean, reason?: string}>}
   */
  check(params) {
    return this.#http.post('/api/bookings/availability', params);
  }
}
