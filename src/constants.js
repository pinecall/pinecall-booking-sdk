/**
 * Booking status constants
 * @readonly
 * @enum {string}
 */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show'
});

/**
 * Common business types
 * @readonly
 * @enum {string}
 */
export const BUSINESS_TYPES = Object.freeze({
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  SALON: 'salon',
  HOTEL: 'hotel',
  SPORTS: 'sports',
  COWORKING: 'coworking',
  MEDICAL: 'medical',
  CUSTOM: 'custom'
});

/**
 * Booking actions
 * @readonly
 * @enum {string}
 */
export const BOOKING_ACTIONS = Object.freeze({
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  COMPLETE: 'complete',
  NO_SHOW: 'no_show',
  RESCHEDULE: 'reschedule'
});
