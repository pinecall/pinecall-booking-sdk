/**
 * Pinecall Booking SDK - Unit Tests (Mocked)
 * 
 * Run: npm test
 */

import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Pinecall, PinecallError, ValidationError, NotFoundError, BOOKING_STATUS } from '../src/index.js';

// Mock fetch globally
const mockFetch = mock.fn();
global.fetch = mockFetch;

function mockResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data)
  });
}

describe('Pinecall', () => {
  beforeEach(() => {
    mockFetch.mock.resetCalls();
  });

  describe('constructor', () => {
    it('should throw without API key', () => {
      assert.throws(() => new Pinecall(), /API key is required/);
      assert.throws(() => new Pinecall(''), /API key is required/);
    });

    it('should create client with API key', () => {
      const client = new Pinecall('pk_test_key');
      assert.ok(client);
      assert.ok(client.configurations);
      assert.ok(client.resources);
      assert.ok(client.availability);
      assert.ok(client.bookings);
    });

    it('should accept custom options', () => {
      const client = new Pinecall('pk_test_key', {
        timeout: 60000,
        maxRetries: 5
      });
      assert.ok(client);
    });
  });

  describe('configurations', () => {
    const client = new Pinecall('pk_test_key');

    it('should list configurations', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        configurations: [{ _id: 'cfg_1', name: 'Test' }]
      }));

      const result = await client.configurations.list();
      
      assert.ok(result.success);
      assert.strictEqual(result.configurations.length, 1);
    });

    it('should get configuration by ID', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        configuration: { _id: 'cfg_1', name: 'Test' }
      }));

      const result = await client.configurations.get('cfg_1');
      
      assert.ok(result.success);
      assert.strictEqual(result.configuration._id, 'cfg_1');
    });

    it('should create configuration', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        configuration: { _id: 'cfg_new', name: 'New Config' }
      }));

      const result = await client.configurations.create({
        name: 'New Config',
        businessType: 'restaurant'
      });

      assert.ok(result.success);
      assert.strictEqual(result.configuration.name, 'New Config');
    });

    it('should update configuration', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        configuration: { _id: 'cfg_1', name: 'Updated' }
      }));

      const result = await client.configurations.update('cfg_1', { name: 'Updated' });
      
      assert.ok(result.success);
    });
  });

  describe('resources', () => {
    const client = new Pinecall('pk_test_key');

    it('should list resources', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        resources: [{ _id: 'res_1', name: 'Table 1' }],
        count: 1
      }));

      const result = await client.resources.list('cfg_1');
      
      assert.ok(result.success);
      assert.strictEqual(result.resources.length, 1);
    });

    it('should list resources with filters', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        resources: [{ _id: 'res_1', name: 'Table 1', attributes: { seats: 4 } }],
        count: 1
      }));

      const result = await client.resources.list('cfg_1', { seats: { $gte: 4 } });
      
      assert.ok(result.success);
    });

    it('should get resource by ID', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        resource: { _id: 'res_1', name: 'Table 1' }
      }));

      const result = await client.resources.get('res_1');
      
      assert.ok(result.success);
    });

    it('should create resource', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        resource: { _id: 'res_new', name: 'Table 5' }
      }));

      const result = await client.resources.create({
        configurationId: 'cfg_1',
        name: 'Table 5',
        attributes: { seats: 4 }
      });

      assert.ok(result.success);
    });

    it('should bulk create resources', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        created: 3,
        resources: [
          { _id: 'res_1', name: 'Table 1' },
          { _id: 'res_2', name: 'Table 2' },
          { _id: 'res_3', name: 'Table 3' }
        ]
      }));

      const result = await client.resources.bulkCreate({
        configurationId: 'cfg_1',
        resources: [
          { name: 'Table 1', attributes: { seats: 2 } },
          { name: 'Table 2', attributes: { seats: 4 } },
          { name: 'Table 3', attributes: { seats: 6 } }
        ]
      });

      assert.ok(result.success);
      assert.strictEqual(result.created, 3);
    });

    it('should update resource', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        resource: { _id: 'res_1', name: 'VIP Table' }
      }));

      const result = await client.resources.update('res_1', { name: 'VIP Table' });
      
      assert.ok(result.success);
    });

    it('should delete resource', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        message: 'Resource deleted'
      }));

      const result = await client.resources.delete('res_1');
      
      assert.ok(result.success);
    });
  });

  describe('availability', () => {
    const client = new Pinecall('pk_test_key');

    it('should query availability', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        summary: { totalResources: 5, totalSlots: 100, totalAvailableSlots: 80 },
        resources: [],
        availableSlots: []
      }));

      const result = await client.availability.query({
        configurationId: 'cfg_1',
        startDate: '2025-01-20',
        endDate: '2025-01-20'
      });

      assert.ok(result.success);
      assert.strictEqual(result.summary.totalAvailableSlots, 80);
    });

    it('should check specific slot', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        available: true
      }));

      const result = await client.availability.check({
        resourceId: 'res_1',
        startTime: '2025-01-20T19:00:00Z',
        endTime: '2025-01-20T21:00:00Z'
      });

      assert.ok(result.success);
      assert.strictEqual(result.available, true);
    });

    it('should return unavailable with reason', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        available: false,
        reason: 'Slot already booked'
      }));

      const result = await client.availability.check({
        resourceId: 'res_1',
        startTime: '2025-01-20T19:00:00Z',
        endTime: '2025-01-20T21:00:00Z'
      });

      assert.strictEqual(result.available, false);
      assert.strictEqual(result.reason, 'Slot already booked');
    });
  });

  describe('bookings', () => {
    const client = new Pinecall('pk_test_key');

    it('should create booking', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: {
          _id: 'bkg_1',
          status: 'pending',
          customer: { name: 'John Doe' }
        }
      }));

      const result = await client.bookings.create({
        configurationId: 'cfg_1',
        resourceId: 'res_1',
        startTime: '2025-01-20T19:00:00Z',
        endTime: '2025-01-20T21:00:00Z',
        customer: { name: 'John Doe', email: 'john@example.com' }
      });

      assert.ok(result.success);
      assert.strictEqual(result.booking.status, 'pending');
    });

    it('should get booking', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: { _id: 'bkg_1', customer: { name: 'John Doe' } }
      }));

      const result = await client.bookings.get('bkg_1');
      
      assert.ok(result.success);
      assert.strictEqual(result.booking._id, 'bkg_1');
    });

    it('should list bookings', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        bookings: [{ _id: 'bkg_1' }, { _id: 'bkg_2' }]
      }));

      const result = await client.bookings.list({
        configurationId: 'cfg_1',
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      });

      assert.ok(result.success);
      assert.strictEqual(result.bookings.length, 2);
    });

    it('should confirm booking', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: { _id: 'bkg_1', status: 'confirmed' }
      }));

      const result = await client.bookings.confirm('bkg_1');
      
      assert.strictEqual(result.booking.status, 'confirmed');
    });

    it('should cancel booking', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: { _id: 'bkg_1', status: 'cancelled' }
      }));

      const result = await client.bookings.cancel('bkg_1', 'Customer request');
      
      assert.strictEqual(result.booking.status, 'cancelled');
    });

    it('should complete booking', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: { _id: 'bkg_1', status: 'completed' }
      }));

      const result = await client.bookings.complete('bkg_1');
      
      assert.strictEqual(result.booking.status, 'completed');
    });

    it('should mark no-show', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: { _id: 'bkg_1', status: 'no_show' }
      }));

      const result = await client.bookings.noShow('bkg_1');
      
      assert.strictEqual(result.booking.status, 'no_show');
    });

    it('should reschedule booking', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        booking: { _id: 'bkg_1', startTime: '2025-01-21T19:00:00Z' }
      }));

      const result = await client.bookings.reschedule('bkg_1', {
        newStartTime: '2025-01-21T19:00:00Z',
        newEndTime: '2025-01-21T21:00:00Z'
      });

      assert.ok(result.success);
    });

    it('should get stats', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse({
        success: true,
        stats: {
          total: 100,
          byStatus: { pending: 10, confirmed: 70, cancelled: 15, completed: 5, no_show: 0 }
        }
      }));

      const result = await client.bookings.stats('cfg_1');
      
      assert.strictEqual(result.stats.total, 100);
    });
  });

  describe('error handling', () => {
    const client = new Pinecall('pk_test_key');

    it('should throw ValidationError on 400', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse(
        { success: false, error: 'Invalid input' },
        400
      ));

      await assert.rejects(
        () => client.configurations.create({}),
        ValidationError
      );
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mock.mockImplementationOnce(() => mockResponse(
        { success: false, error: 'Not found' },
        404
      ));

      await assert.rejects(
        () => client.bookings.get('invalid'),
        NotFoundError
      );
    });
  });

  describe('static helpers', () => {
    it('should generate future date', () => {
      const date = Pinecall.futureDate(7);
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    });

    it('should generate future datetime', () => {
      const datetime = Pinecall.futureDateTime(7, 19, 30);
      assert.match(datetime, /^\d{4}-\d{2}-\d{2}T19:30:00/);
    });

    it('should format date', () => {
      const date = Pinecall.formatDate(new Date('2025-01-15'));
      assert.strictEqual(date, '2025-01-15');
    });

    it('should format datetime', () => {
      const datetime = Pinecall.formatDateTime(new Date('2025-01-15T19:00:00Z'));
      assert.ok(datetime.includes('2025-01-15'));
    });
  });

  describe('constants', () => {
    it('should export BOOKING_STATUS', () => {
      assert.strictEqual(BOOKING_STATUS.PENDING, 'pending');
      assert.strictEqual(BOOKING_STATUS.CONFIRMED, 'confirmed');
      assert.strictEqual(BOOKING_STATUS.CANCELLED, 'cancelled');
      assert.strictEqual(BOOKING_STATUS.COMPLETED, 'completed');
      assert.strictEqual(BOOKING_STATUS.NO_SHOW, 'no_show');
    });
  });
});
