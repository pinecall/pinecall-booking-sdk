# API Reference

Complete field-by-field documentation for the Pinecall Booking SDK.

## Table of Contents

- [Client](#client)
- [Configurations](#configurations)
- [Resources](#resources)
- [Availability](#availability)
- [Bookings](#bookings)
- [Helpers](#helpers)
- [Errors](#errors)
- [Constants](#constants)

---

## Client

### Constructor

```javascript
import { Pinecall } from '@pinecall/booking-sdk';

const client = new Pinecall(apiKey, options);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | string | Yes | Your API key (starts with `pk_`) |
| `options.baseUrl` | string | No | API base URL |
| `options.timeout` | number | No | Request timeout in ms (default: 30000) |
| `options.maxRetries` | number | No | Max retry attempts (default: 3) |

---

## Configurations

A configuration defines a booking system schema: what resources exist, what attributes bookings have, and business rules.

### client.configurations.list()

Returns all configurations for your organization.

```javascript
const { configurations } = await client.configurations.list();
```

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `configurations` | array | List of configuration objects |
| `configurations[]._id` | string | Configuration ID |
| `configurations[].name` | string | Display name |
| `configurations[].businessType` | string | Type (restaurant, spa, hotel, etc.) |
| `configurations[].resourceCount` | number | Number of resources |
| `configurations[].activeBookingsCount` | number | Pending + confirmed bookings |

---

### client.configurations.get(configId)

Get a single configuration by ID.

```javascript
const { configuration } = await client.configurations.get('cfg_xxx');
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `configId` | string | Yes | Configuration ID |

---

### client.configurations.create(data)

Create a new booking system configuration.

```javascript
const { configuration } = await client.configurations.create({
  name: 'My Restaurant',
  businessType: 'restaurant',
  resourceDefinition: {
    name: 'table',
    pluralName: 'tables',
    attributes: [
      { key: 'seats', type: 'number', required: true, min: 1, max: 20 },
      { key: 'location', type: 'string', enum: ['indoor', 'outdoor', 'terrace'] }
    ]
  },
  bookingDefinition: {
    attributes: [
      { key: 'partySize', type: 'number', required: true },
      { key: 'occasion', type: 'string' }
    ]
  },
  businessRules: {
    minBookingTime: '1h',
    maxBookingTime: '3h',
    bufferTime: '15m',
    autoConfirm: false
  },
  defaultSchedule: [
    { dayOfWeek: 0, isOpen: false },
    { dayOfWeek: 1, isOpen: true, shifts: [{ startTime: '12:00', endTime: '23:00' }] }
  ]
});
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Configuration name |
| `businessType` | string | Yes | Business type identifier |
| `description` | string | No | Description |
| `resourceDefinition` | object | No | Schema for resources |
| `bookingDefinition` | object | No | Schema for bookings |
| `businessRules` | object | No | Booking constraints |
| `defaultSchedule` | array | No | Operating hours by day |

**resourceDefinition:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Singular name (e.g., "table") |
| `pluralName` | string | Yes | Plural name (e.g., "tables") |
| `attributes` | array | Yes | Attribute definitions |

**Attribute Definition:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Attribute key |
| `type` | string | Yes | `string`, `number`, `boolean`, `array`, `date`, `email`, `phone` |
| `required` | boolean | No | Is this attribute required? |
| `enum` | array | No | Allowed values (for string type) |
| `min` | number | No | Minimum value (for number type) |
| `max` | number | No | Maximum value (for number type) |
| `defaultValue` | any | No | Default value |

**businessRules:**

| Field | Type | Description |
|-------|------|-------------|
| `minBookingTime` | string | Minimum duration (e.g., "30m", "1h") |
| `maxBookingTime` | string | Maximum duration |
| `bufferTime` | string | Buffer between bookings |
| `advanceBooking` | string | How far ahead bookings allowed (e.g., "30d") |
| `minAdvanceTime` | string | Minimum advance notice |
| `autoConfirm` | boolean | Auto-confirm new bookings |
| `allowOverlapping` | boolean | Allow overlapping bookings |

**defaultSchedule[] (Day Schedule):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dayOfWeek` | number | Yes | 0=Sunday, 1=Monday, ..., 6=Saturday |
| `isOpen` | boolean | Yes | Is the business open this day? |
| `shifts` | array | No | Operating shifts for the day |
| `shifts[].startTime` | string | Yes | Start time (HH:mm) |
| `shifts[].endTime` | string | Yes | End time (HH:mm) |

---

### client.configurations.update(configId, data)

Update an existing configuration.

```javascript
await client.configurations.update('cfg_xxx', {
  name: 'Updated Name',
  businessRules: { autoConfirm: true }
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `configId` | string | Yes | Configuration ID |
| `data` | object | Yes | Fields to update (same as create) |

---

## Resources

Resources are the bookable entities (tables, rooms, vehicles, etc.).

### client.resources.list(configId, filters?)

List resources for a configuration.

```javascript
// All resources
const { resources, count } = await client.resources.list('cfg_xxx');

// With attribute filters
const { resources } = await client.resources.list('cfg_xxx', {
  seats: { $gte: 4 },
  location: 'terrace'
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `configId` | string | Yes | Configuration ID |
| `filters` | object | No | Attribute filters |

**Filter Operators:**

| Operator | Example | Description |
|----------|---------|-------------|
| exact | `{ seats: 4 }` | Equals 4 |
| `$gte` | `{ seats: { $gte: 4 } }` | Greater than or equal |
| `$lte` | `{ seats: { $lte: 6 } }` | Less than or equal |
| `$gt` | `{ seats: { $gt: 2 } }` | Greater than |
| `$lt` | `{ seats: { $lt: 10 } }` | Less than |

---

### client.resources.get(resourceId)

Get a single resource.

```javascript
const { resource } = await client.resources.get('res_xxx');
```

---

### client.resources.create(data)

Create a single resource.

```javascript
const { resource } = await client.resources.create({
  configurationId: 'cfg_xxx',
  name: 'Table 1',
  code: 'T1',
  description: 'Window table',
  attributes: {
    seats: 4,
    location: 'indoor'
  }
});
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `configurationId` | string | Yes | Configuration ID |
| `name` | string | Yes | Resource name |
| `code` | string | No | Short code |
| `description` | string | No | Description |
| `attributes` | object | Yes | Attribute values |

---

### client.resources.bulkCreate(data)

Create multiple resources at once.

```javascript
const { created, resources, errors } = await client.resources.bulkCreate({
  configurationId: 'cfg_xxx',
  resources: [
    { name: 'Table 1', attributes: { seats: 2 } },
    { name: 'Table 2', attributes: { seats: 4 } },
    { name: 'Table 3', attributes: { seats: 6 } }
  ]
});
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `configurationId` | string | Yes | Configuration ID |
| `resources` | array | Yes | Resources to create |
| `resources[].name` | string | Yes | Resource name |
| `resources[].code` | string | No | Short code |
| `resources[].attributes` | object | Yes | Attribute values |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `created` | number | Count of created resources |
| `resources` | array | Created resource objects |
| `errors` | array | Validation errors (if any) |

---

### client.resources.update(resourceId, data)

Update a resource.

```javascript
await client.resources.update('res_xxx', {
  name: 'VIP Table',
  attributes: { seats: 6 }
});
```

---

### client.resources.delete(resourceId)

Delete (deactivate) a resource.

```javascript
await client.resources.delete('res_xxx');
```

---

## Availability

### client.availability.query(params)

Query available time slots.

```javascript
const result = await client.availability.query({
  configurationId: 'cfg_xxx',
  startDate: '2025-01-20',
  endDate: '2025-01-20',
  duration: 60,
  resourceFilters: { seats: { $gte: 4 } }
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `configurationId` | string | Yes | Configuration ID |
| `startDate` | string | Yes | Start date (YYYY-MM-DD) |
| `endDate` | string | Yes | End date (YYYY-MM-DD) |
| `duration` | number | No | Desired duration in minutes |
| `resourceFilters` | object | No | Filter resources by attributes |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `summary.totalResources` | number | Total matching resources |
| `summary.totalSlots` | number | Total slots in period |
| `summary.totalAvailableSlots` | number | Available slots |
| `resources` | array | Matching resources |
| `availableSlots` | array | All available slots |
| `availableSlots[].startTime` | string | Slot start (ISO 8601) |
| `availableSlots[].endTime` | string | Slot end (ISO 8601) |
| `availableSlots[].resourceId` | string | Resource ID |
| `availableSlots[].resourceName` | string | Resource name |
| `slotsByResource` | array | Slots grouped by resource |

---

### client.availability.check(params)

Check if a specific time slot is available.

```javascript
const { available, reason } = await client.availability.check({
  resourceId: 'res_xxx',
  startTime: '2025-01-20T19:00:00Z',
  endTime: '2025-01-20T21:00:00Z',
  excludeBookingId: 'bkg_xxx' // optional, for rescheduling
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resourceId` | string | Yes | Resource ID |
| `startTime` | string | Yes | Start time (ISO 8601) |
| `endTime` | string | Yes | End time (ISO 8601) |
| `excludeBookingId` | string | No | Booking to exclude (for rescheduling) |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `available` | boolean | Is the slot available? |
| `reason` | string | Reason if not available |

---

## Bookings

### client.bookings.create(data)

Create a new booking.

```javascript
const { booking } = await client.bookings.create({
  configurationId: 'cfg_xxx',
  resourceId: 'res_xxx',
  startTime: '2025-01-20T19:00:00Z',
  endTime: '2025-01-20T21:00:00Z',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  attributes: {
    partySize: 4,
    occasion: 'birthday',
    specialRequests: 'Window seat preferred'
  },
  source: 'api',
  internalNotes: 'VIP customer'
});
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `configurationId` | string | Yes | Configuration ID |
| `resourceId` | string | Yes | Resource ID |
| `startTime` | string | Yes | Start time (ISO 8601) |
| `endTime` | string | Conditional | End time (required if no duration) |
| `duration` | number | Conditional | Duration in minutes (required if no endTime) |
| `customer` | object | Yes | Customer information |
| `customer.name` | string | Yes | Customer name |
| `customer.email` | string | No | Customer email |
| `customer.phone` | string | No | Customer phone |
| `attributes` | object | No | Booking attributes |
| `source` | string | No | `admin`, `widget`, `api`, `llm` |
| `internalNotes` | string | No | Internal notes |

**Response Booking Object:**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Booking ID |
| `configurationId` | string | Configuration ID |
| `resourceId` | string | Resource ID |
| `resourceName` | string | Resource name |
| `startTime` | string | Start time |
| `endTime` | string | End time |
| `duration` | number | Duration in minutes |
| `customer` | object | Customer info |
| `attributes` | object | Booking attributes |
| `status` | string | `pending`, `confirmed`, `cancelled`, `completed`, `no_show` |
| `statusHistory` | array | Status change history |
| `source` | string | Booking source |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |

---

### client.bookings.get(bookingId)

Get a booking by ID.

```javascript
const { booking } = await client.bookings.get('bkg_xxx');
```

---

### client.bookings.list(params)

List bookings with filters.

```javascript
const { bookings } = await client.bookings.list({
  configurationId: 'cfg_xxx',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  status: 'confirmed',           // or ['pending', 'confirmed']
  resourceId: 'res_xxx',         // optional
  search: 'John'                 // search customer name/email
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `configurationId` | string | Yes | Configuration ID |
| `startDate` | string | Yes | Start date (YYYY-MM-DD) |
| `endDate` | string | Yes | End date (YYYY-MM-DD) |
| `status` | string/array | No | Filter by status |
| `resourceId` | string | No | Filter by resource |
| `search` | string | No | Search customer name/email |

---

### client.bookings.confirm(bookingId, reason?)

Confirm a pending booking.

```javascript
const { booking } = await client.bookings.confirm('bkg_xxx', 'Confirmed by phone');
```

---

### client.bookings.cancel(bookingId, reason?)

Cancel a booking.

```javascript
const { booking } = await client.bookings.cancel('bkg_xxx', 'Customer request');
```

---

### client.bookings.complete(bookingId, reason?)

Mark a booking as completed.

```javascript
const { booking } = await client.bookings.complete('bkg_xxx');
```

---

### client.bookings.noShow(bookingId, reason?)

Mark a booking as no-show.

```javascript
const { booking } = await client.bookings.noShow('bkg_xxx');
```

---

### client.bookings.reschedule(bookingId, params)

Reschedule a booking to a new time.

```javascript
const { booking } = await client.bookings.reschedule('bkg_xxx', {
  newStartTime: '2025-01-21T19:00:00Z',
  newEndTime: '2025-01-21T21:00:00Z'
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingId` | string | Yes | Booking ID |
| `newStartTime` | string | Yes | New start time (ISO 8601) |
| `newEndTime` | string | Yes | New end time (ISO 8601) |

---

### client.bookings.stats(configId, params?)

Get booking statistics.

```javascript
const { stats } = await client.bookings.stats('cfg_xxx', {
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `stats.total` | number | Total bookings |
| `stats.byStatus.pending` | number | Pending count |
| `stats.byStatus.confirmed` | number | Confirmed count |
| `stats.byStatus.cancelled` | number | Cancelled count |
| `stats.byStatus.completed` | number | Completed count |
| `stats.byStatus.no_show` | number | No-show count |
| `stats.totalRevenue` | number | Total revenue (if pricing enabled) |
| `stats.averageDuration` | number | Average booking duration in minutes |

---

## Helpers

Static methods for date handling.

### Pinecall.futureDate(daysAhead)

Generate a future date string.

```javascript
Pinecall.futureDate(7);  // "2025-01-27"
```

### Pinecall.futureDateTime(daysAhead, hour, minute)

Generate a future datetime string.

```javascript
Pinecall.futureDateTime(7, 19, 30);  // "2025-01-27T19:30:00.000Z"
```

### Pinecall.formatDate(date)

Format a date to YYYY-MM-DD.

```javascript
Pinecall.formatDate(new Date());  // "2025-01-20"
```

### Pinecall.formatDateTime(date)

Format a date to ISO 8601.

```javascript
Pinecall.formatDateTime(new Date());  // "2025-01-20T15:30:00.000Z"
```

---

## Errors

All errors extend `PinecallError`.

```javascript
import { 
  PinecallError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  NetworkError
} from '@pinecall/booking-sdk';
```

### Error Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | string | Error message |
| `code` | string | Error code (e.g., `VALIDATION_ERROR`) |
| `statusCode` | number | HTTP status code |

### Error Types

| Error | Status | When |
|-------|--------|------|
| `ValidationError` | 400 | Invalid request parameters |
| `AuthenticationError` | 401 | Invalid or missing API key |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Booking conflict or duplicate |
| `RateLimitError` | 429 | Too many requests |
| `NetworkError` | - | Connection failed |

---

## Constants

```javascript
import { BOOKING_STATUS, BUSINESS_TYPES } from '@pinecall/booking-sdk';
```

### BOOKING_STATUS

| Constant | Value |
|----------|-------|
| `BOOKING_STATUS.PENDING` | `'pending'` |
| `BOOKING_STATUS.CONFIRMED` | `'confirmed'` |
| `BOOKING_STATUS.CANCELLED` | `'cancelled'` |
| `BOOKING_STATUS.COMPLETED` | `'completed'` |
| `BOOKING_STATUS.NO_SHOW` | `'no_show'` |

### BUSINESS_TYPES

| Constant | Value |
|----------|-------|
| `BUSINESS_TYPES.RESTAURANT` | `'restaurant'` |
| `BUSINESS_TYPES.SPA` | `'spa'` |
| `BUSINESS_TYPES.SALON` | `'salon'` |
| `BUSINESS_TYPES.HOTEL` | `'hotel'` |
| `BUSINESS_TYPES.COWORKING` | `'coworking'` |
| `BUSINESS_TYPES.SPORTS` | `'sports'` |
| `BUSINESS_TYPES.HEALTHCARE` | `'healthcare'` |
| `BUSINESS_TYPES.TRANSPORTATION` | `'transportation'` |
| `BUSINESS_TYPES.CUSTOM` | `'custom'` |
