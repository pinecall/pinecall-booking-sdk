<div align="center">

# @pinecall/pinecall-booking-sdk

**Official JavaScript SDK for the Pinecall Booking API**

[![npm version](https://img.shields.io/npm/v/@pinecall/pinecall-booking-sdk.svg)](https://www.npmjs.com/package/@pinecall/pinecall-booking-sdk)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Installation](#installation) •
[Quick Start](#quick-start) •
[API Reference](#api-reference) •
[Examples](#examples) •
[License](#license)

</div>

---

## Installation

```bash
npm install @pinecall/pinecall-booking-sdk
```

---

## Quick Start

```javascript
import { Pinecall } from '@pinecall/pinecall-booking-sdk';

const client = new Pinecall('pk_your_api_key');

// Create a restaurant booking system
const config = await client.configurations.create({
  name: 'My Restaurant',
  businessType: 'restaurant',
  resourceDefinition: {
    name: 'table',
    pluralName: 'tables',
    attributes: [
      { key: 'seats', type: 'number', required: true }
    ]
  },
  businessRules: {
    minBookingTime: '1h',
    maxBookingTime: '3h',
    bufferTime: '15m'
  }
});

// Create tables
await client.resources.bulkCreate({
  configurationId: config.configuration._id,
  resources: [
    { name: 'Table 1', attributes: { seats: 2 } },
    { name: 'Table 2', attributes: { seats: 4 } },
    { name: 'Table 3', attributes: { seats: 6 } }
  ]
});

// Check availability
const availability = await client.availability.query({
  configurationId: config.configuration._id,
  startDate: '2025-01-20',
  endDate: '2025-01-20'
});

// Create a booking
const booking = await client.bookings.create({
  configurationId: config.configuration._id,
  resourceId: availability.resources[0]._id,
  startTime: '2025-01-20T19:00:00Z',
  endTime: '2025-01-20T21:00:00Z',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  attributes: {
    partySize: 4
  }
});

// Confirm the booking
await client.bookings.confirm(booking.booking._id);
```

---

## API Reference

### Client Initialization

```javascript
import { Pinecall } from '@pinecall/pinecall-booking-sdk';

// Simple
const client = new Pinecall('pk_your_api_key');

// With options
const client = new Pinecall('pk_your_api_key', {
  baseUrl: 'https://api.example.com',  // Custom API URL
  timeout: 30000,                       // Request timeout (ms)
  maxRetries: 3                         // Retry attempts
});
```

### Configurations

```javascript
// List all configurations
const configs = await client.configurations.list();

// Get a specific configuration
const config = await client.configurations.get('config_id');

// Create a configuration
const config = await client.configurations.create({
  name: 'My Business',
  businessType: 'restaurant',
  resourceDefinition: { ... },
  bookingDefinition: { ... },
  businessRules: { ... },
  defaultSchedule: [ ... ]
});

// Update a configuration
await client.configurations.update('config_id', { name: 'New Name' });
```

### Resources

```javascript
// List resources
const resources = await client.resources.list('config_id');

// List with filters
const tables = await client.resources.list('config_id', {
  seats: { $gte: 4 }
});

// Get a resource
const resource = await client.resources.get('resource_id');

// Create a resource
const resource = await client.resources.create({
  configurationId: 'config_id',
  name: 'Table 5',
  attributes: { seats: 4, location: 'terrace' }
});

// Bulk create resources
const result = await client.resources.bulkCreate({
  configurationId: 'config_id',
  resources: [
    { name: 'Table 1', attributes: { seats: 2 } },
    { name: 'Table 2', attributes: { seats: 4 } }
  ]
});

// Update a resource
await client.resources.update('resource_id', { name: 'VIP Table' });

// Delete a resource
await client.resources.delete('resource_id');
```

### Availability

```javascript
// Query available slots
const availability = await client.availability.query({
  configurationId: 'config_id',
  startDate: '2025-01-20',
  endDate: '2025-01-20'
});

// Query with filters
const availability = await client.availability.query({
  configurationId: 'config_id',
  startDate: '2025-01-20',
  endDate: '2025-01-20',
  duration: 60,
  resourceFilters: { seats: { $gte: 4 } }
});

// Check specific slot
const isAvailable = await client.availability.check(
  'resource_id',
  '2025-01-20T19:00:00Z',
  '2025-01-20T21:00:00Z'
);
```

### Bookings

```javascript
// Create a booking
const booking = await client.bookings.create({
  configurationId: 'config_id',
  resourceId: 'resource_id',
  startTime: '2025-01-20T19:00:00Z',
  endTime: '2025-01-20T21:00:00Z',
  customer: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  attributes: {
    partySize: 4
  }
});

// Get a booking
const booking = await client.bookings.get('booking_id');

// List bookings
const bookings = await client.bookings.list({
  configurationId: 'config_id',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

// List with filters
const bookings = await client.bookings.list({
  configurationId: 'config_id',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  status: 'confirmed',
  resourceId: 'resource_id'
});

// Confirm a booking
await client.bookings.confirm('booking_id');

// Cancel a booking
await client.bookings.cancel('booking_id', 'Customer request');

// Reschedule a booking
await client.bookings.reschedule(
  'booking_id',
  '2025-01-21T19:00:00Z',
  '2025-01-21T21:00:00Z'
);

// Mark as completed
await client.bookings.complete('booking_id');

// Mark as no-show
await client.bookings.noShow('booking_id');

// Get statistics
const stats = await client.bookings.stats('config_id', '2025-01-01', '2025-01-31');
```

### Static Helpers

```javascript
import { Pinecall } from '@pinecall/pinecall-booking-sdk';

// Get date N days in the future (YYYY-MM-DD)
Pinecall.futureDate(7);        // '2025-01-27'

// Get datetime N days in the future at specific time
Pinecall.futureDateTime(7, 19, 0);  // '2025-01-27T19:00:00.000Z'

// Format date for API
Pinecall.formatDate(new Date());     // '2025-01-20'

// Format datetime for API
Pinecall.formatDateTime(new Date()); // '2025-01-20T15:30:00.000Z'
```

---

## Error Handling

```javascript
import { Pinecall, PinecallError, ValidationError, NotFoundError, ConflictError } from '@pinecall/pinecall-booking-sdk';

try {
  const booking = await client.bookings.create({ ... });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Invalid data:', error.message);
  } else if (error instanceof NotFoundError) {
    console.log('Resource not found:', error.message);
  } else if (error instanceof ConflictError) {
    console.log('Booking conflict:', error.message);
  } else if (error instanceof PinecallError) {
    console.log('API error:', error.message, error.statusCode);
  }
}
```

---

## Constants

```javascript
import { BOOKING_STATUS, BUSINESS_TYPES } from '@pinecall/pinecall-booking-sdk';

BOOKING_STATUS.PENDING    // 'pending'
BOOKING_STATUS.CONFIRMED  // 'confirmed'
BOOKING_STATUS.CANCELLED  // 'cancelled'
BOOKING_STATUS.COMPLETED  // 'completed'
BOOKING_STATUS.NO_SHOW    // 'no_show'

BUSINESS_TYPES.RESTAURANT // 'restaurant'
BUSINESS_TYPES.SPA        // 'spa'
BUSINESS_TYPES.HOTEL      // 'hotel'
BUSINESS_TYPES.CLINIC     // 'clinic'
BUSINESS_TYPES.SPORTS     // 'sports'
BUSINESS_TYPES.COWORKING  // 'coworking'
BUSINESS_TYPES.CUSTOM     // 'custom'
```

---

## Examples

See the [examples](./examples) directory for complete working examples:

- [Restaurant Booking](./examples/basic.js) - Tables, time slots, reservations
- [Spa Appointments](./examples/spa.js) - Therapists, treatments, scheduling

---

## Requirements

- Node.js >= 18.0.0
- ES Modules support

---

## License

MIT © [Pinecall](https://pinecall.io)
