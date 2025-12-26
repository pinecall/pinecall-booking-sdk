/**
 * Resources - Manage bookable entities (tables, rooms, vehicles, etc.)
 */
export class Resources {
  #http;

  constructor(http) {
    this.#http = http;
  }

  /**
   * List resources for a configuration
   * @param {string} configId - Configuration ID
   * @param {Object} [filters] - Attribute filters
   * @returns {Promise<{resources: Array, count: number}>}
   */
  list(configId, filters = {}) {
    const query = { configId };
    
    for (const [key, value] of Object.entries(filters)) {
      query[`attr_${key}`] = typeof value === 'object' ? JSON.stringify(value) : value;
    }
    
    return this.#http.get('/api/bookings/resources', query);
  }

  /**
   * Get a resource by ID
   * @param {string} id - Resource ID
   * @returns {Promise<{resource: Object}>}
   */
  get(id) {
    return this.#http.get('/api/bookings/resources', { id });
  }

  /**
   * Create a single resource
   * @param {Object} params
   * @returns {Promise<{resource: Object}>}
   */
  create(params) {
    return this.#http.post('/api/bookings/resources', params);
  }

  /**
   * Bulk create resources
   * @param {Object} params
   * @returns {Promise<{created: number, resources: Array}>}
   */
  bulkCreate(params) {
    return this.#http.post('/api/bookings/resources', params);
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
   * Delete a resource
   * @param {string} id - Resource ID
   * @returns {Promise<{success: boolean}>}
   */
  delete(id) {
    return this.#http.delete('/api/bookings/resources', { resourceId: id });
  }
}
