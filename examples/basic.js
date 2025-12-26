/**
 * Basic Example - Restaurant Booking System
 */

import { Pinecall } from '@pinecall/booking-sdk';

const client = new Pinecall(process.env.PINECALL_API_KEY);

async function main() {
  // 1. Create a restaurant configuration
  const { configuration } = await client.configurations.create({
    name: 'Demo Restaurant',
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
      bufferTime: '15m'
    },
    defaultSchedule: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isOpen: i !== 0, // Closed on Sunday
      shifts: i !== 0 ? [
        { startTime: '12:00', endTime: '15:00' },
        { startTime: '19:00', endTime: '23:00' }
      ] : []
    }))
  });

  console.log('Configuration created:', configuration._id);

  // 2. Create tables
  const { created, resources } = await client.resources.bulkCreate({
    configurationId: configuration._id,
    resources: [
      { name: 'Table 1', code: 'T1', attributes: { seats: 2, location: 'indoor' } },
      { name: 'Table 2', code: 'T2', attributes: { seats: 4, location: 'indoor' } },
      { name: 'Table 3', code: 'T3', attributes: { seats: 4, location: 'terrace' } },
      { name: 'Table 4', code: 'T4', attributes: { seats: 6, location: 'indoor' } },
      { name: 'Table 5', code: 'T5', attributes: { seats: 8, location: 'outdoor' } }
    ]
  });

  console.log(`Created ${created} tables`);

  // 3. Check availability for next week
  const startDate = Pinecall.futureDate(7);
  
  const availability = await client.availability.query({
    configurationId: configuration._id,
    startDate,
    endDate: startDate,
    resourceFilters: { seats: { $gte: 4 } }
  });

  console.log(`Found ${availability.summary.totalAvailableSlots} slots for 4+ seats`);

  // 4. Create a booking
  const { booking } = await client.bookings.create({
    configurationId: configuration._id,
    resourceId: resources[1]._id, // Table 2
    startTime: Pinecall.futureDateTime(7, 19, 0),
    endTime: Pinecall.futureDateTime(7, 21, 0),
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    attributes: {
      partySize: 4,
      occasion: 'anniversary'
    }
  });

  console.log('Booking created:', booking._id);
  console.log('Status:', booking.status);

  // 5. Confirm the booking
  const { booking: confirmed } = await client.bookings.confirm(booking._id);
  console.log('Booking confirmed:', confirmed.status);

  // 6. Get statistics
  const { stats } = await client.bookings.stats(configuration._id);
  console.log('Statistics:', stats);
}

main().catch(console.error);
