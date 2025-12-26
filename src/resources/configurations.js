/**
 * Configuration resource - Manage booking system configurations
 * 
 * @example
 * ```js
 * // Create a restaurant configuration
 * const config = await client.configurations.create({
 *   name: 'My Restaurant',
 *   businessType: 'restaurant',
 *   resourceDefinition: {
 *     name: 'table',
 *     pluralName: 'tables',
 *     attributes: [{ key: 'seats', type: 'number', required: true }]
 *   }
 * });
 * ```
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
  retrieve(id) {
    return this.#http.get('/api/bookings/configure', { id });
  }

  /**
   * Create a new configuration
   * @param {Object} params
   * @param {string} params.name - Configuration name
   * @param {string} params.businessType - Business type (restaurant, spa, etc.)
   * @param {string} [params.description] - Description
   * @param {Object} [params.resourceDefinition] - Resource schema
   * @param {Object} [params.bookingDefinition] - Booking schema
   * @param {Object} [params.businessRules] - Business rules
   * @param {Array} [params.defaultSchedule] - Operating schedule
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
