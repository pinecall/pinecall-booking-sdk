/**
 * Spa Example - Appointment Booking System
 */

import { Pinecall } from '@pinecall/booking-sdk';

const client = new Pinecall(process.env.PINECALL_API_KEY);

async function main() {
  // 1. Create a spa configuration
  const { configuration } = await client.configurations.create({
    name: 'Serenity Spa',
    businessType: 'spa',
    resourceDefinition: {
      name: 'room',
      pluralName: 'rooms',
      attributes: [
        { key: 'type', type: 'string', required: true, enum: ['massage', 'facial', 'sauna', 'jacuzzi'] },
        { key: 'capacity', type: 'number', required: true },
        { key: 'hasShower', type: 'boolean' }
      ]
    },
    bookingDefinition: {
      attributes: [
        { key: 'treatment', type: 'string', required: true },
        { key: 'therapist', type: 'string' },
        { key: 'guests', type: 'number' }
      ]
    },
    businessRules: {
      minBookingTime: '30m',
      maxBookingTime: '2h',
      bufferTime: '15m',
      minAdvanceTime: '2h'
    },
    defaultSchedule: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isOpen: true,
      shifts: [{ startTime: '09:00', endTime: '21:00' }]
    }))
  });

  console.log('Spa configuration created:', configuration._id);

  // 2. Create rooms
  const { created, resources } = await client.resources.bulkCreate({
    configurationId: configuration._id,
    resources: [
      { name: 'Zen Room', code: 'ZEN', attributes: { type: 'massage', capacity: 2, hasShower: true } },
      { name: 'Lotus Room', code: 'LOT', attributes: { type: 'massage', capacity: 1, hasShower: true } },
      { name: 'Orchid Room', code: 'ORC', attributes: { type: 'facial', capacity: 1, hasShower: false } },
      { name: 'Cedar Sauna', code: 'SAU', attributes: { type: 'sauna', capacity: 6, hasShower: true } },
      { name: 'Blue Lagoon', code: 'JAC', attributes: { type: 'jacuzzi', capacity: 4, hasShower: true } }
    ]
  });

  console.log(`Created ${created} rooms`);

  // 3. Check availability for massage rooms
  const startDate = Pinecall.futureDate(3);
  
  const availability = await client.availability.query({
    configurationId: configuration._id,
    startDate,
    endDate: startDate,
    duration: 60,
    resourceFilters: { type: 'massage' }
  });

  console.log(`Found ${availability.summary.totalAvailableSlots} massage slots`);

  // 4. Book a couples massage
  const zenRoom = resources.find(r => r.code === 'ZEN');
  
  const { booking } = await client.bookings.create({
    configurationId: configuration._id,
    resourceId: zenRoom._id,
    startTime: Pinecall.futureDateTime(3, 14, 0),
    duration: 90,
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1987654321'
    },
    attributes: {
      treatment: 'Couples Swedish Massage',
      therapist: 'Maria',
      guests: 2
    }
  });

  console.log('Appointment created:', booking._id);

  // 5. Confirm the appointment
  await client.bookings.confirm(booking._id);
  console.log('Appointment confirmed');

  // 6. Later: mark as completed
  // await client.bookings.complete(booking._id);
}

main().catch(console.error);
