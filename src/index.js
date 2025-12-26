/**
 * @pinecall/booking-sdk
 * 
 * Simple, elegant SDK for Pinecall Booking API.
 * Zero dependencies. Full JSDoc support.
 * 
 * @example
 * ```js
 * import { Pinecall } from '@pinecall/booking-sdk';
 * 
 * const client = new Pinecall('pk_your_api_key');
 * const config = await client.configurations.create({ name: 'My Restaurant' });
 * ```
 * 
 * @module @pinecall/booking-sdk
 */

export { Pinecall } from './client.js';
export { PinecallError, ValidationError, NotFoundError, ConflictError } from './errors.js';
export { BOOKING_STATUS, BUSINESS_TYPES } from './constants.js';
