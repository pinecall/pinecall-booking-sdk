/**
 * Resources - Manage bookable entities (tables, rooms, vehicles, etc.)
 * 
 * @example
 * ```js
 * // Create tables for a restaurant
 * const tables = await client.resources.createMany(configId, [
 *   { name: 'Table 1', attributes: { seats: 2 } },
 *   { name: 'Table 2', attributes: { seats: 4 } }
 * ]);
 * 
 * // List resources with filters
 * const outdoor = await client.resources.list(configId, {
 *   filters: { location: 'outdoor' }
 * });
 * ```
 */
export class Resources {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * List resources for a configuration
   * @param {string} configId - Configuration ID
   * @param {Object} [options]
   * @param {Object} [options.filters] - Attribute filters
   * @returns {Promise<{resources: Array, count: number}>}
   */
  list(configId, options = {}) {
    const query = { configId };
    
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query[`attr_${key}`] = typeof value === 'object' ? JSON.stringify(value) : value;
      }
    }
    
    return this.#http.get('/api/bookings/resources', query);
  }

  /**
   * Get a resource by ID
   * @param {string} id - Resource ID
   * @param {Object} [options]
   * @param {string} [options.startDate] - Start date for stats
   * @param {string} [options.endDate] - End date for stats
   * @returns {Promise<{resource: Object}>}
   */
  retrieve(id, options = {}) {
    return this.#http.get('/api/bookings/resources', { id, ...options });
  }

  /**
   * Create a single resource
   * @param {string} configId - Configuration ID
   * @param {Object} params
   * @param {string} params.name - Resource name
   * @param {Object} params.attributes - Resource attributes
   * @param {string} [params.code] - Resource code
   * @param {string} [params.description] - Description
   * @returns {Promise<{resource: Object}>}
   */
  create(configId, params) {
    return this.#http.post('/api/bookings/resources', {
      configurationId: configId,
      ...params
    });
  }

  /**
   * Bulk create resources
   * @param {string} configId - Configuration ID
   * @param {Array<Object>} resources - Array of resources to create
   * @returns {Promise<{created: number, resources: Array}>}
   */
  createMany(configId, resources) {
    return this.#http.post('/api/bookings/resources', {
      configurationId: configId,
      resources
    });
  }

  /**
   * Update a resource
   * @param {string} id - Resource ID
   * @param {Object} params - Fields to update
   * @returns {Promise<{resource: Object}>}
   */
  update(id, params) {
    return this.#http.put('/api/bookings/resources', { resourceId: id, ...params });
  }

  /**
   * Delete (deactivate) a resource
   * @param {string} id - Resource ID
   * @returns {Promise<{success: boolean}>}
   */
  delete(id) {
    return this.#http.delete('/api/bookings/resources', { resourceId: id });
  }
}
