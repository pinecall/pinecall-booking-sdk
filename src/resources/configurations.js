/**
 * Configuration resource - Manage booking system configurations
 */
export class Configurations {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * List all configurations
   * @returns {Promise<{configurations: Array}>}
   */
  list() {
    return this.#http.get('/api/bookings/configure');
  }

  /**
   * Get a configuration by ID
   * @param {string} id - Configuration ID
   * @returns {Promise<{configuration: Object}>}
   */
  get(id) {
    return this.#http.get('/api/bookings/configure', { id });
  }

  /**
   * Create a new configuration
   * @param {Object} params
   * @returns {Promise<{configuration: Object}>}
   */
  create(params) {
    return this.#http.post('/api/bookings/configure', params);
  }

  /**
   * Update a configuration
   * @param {string} id - Configuration ID
   * @param {Object} params - Fields to update
   * @returns {Promise<{configuration: Object}>}
   */
  update(id, params) {
    return this.#http.put('/api/bookings/configure', { configurationId: id, ...params });
  }
}
