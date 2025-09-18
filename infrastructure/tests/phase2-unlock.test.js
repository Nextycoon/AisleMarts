// tests/phase2-unlock.test.js
// Jest test suite for Phase 2 unlock system

const request = require('supertest');
const express = require('express');
const unlockRouter = require('../server/unlockController');

// Mock dependencies
jest.mock('ioredis');
jest.mock('pg');
jest.mock('node-fetch');

const app = express();
app.use('/api', unlockRouter);

describe('Phase 2 Unlock System', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set test environment variables
    process.env.DOWNLOAD_TARGET = '1000000';
    process.env.ADMIN_TOKENS = 'test-token-1,test-token-2';
    process.env.REQUIRED_APPROVALS = '2';
  });

  describe('GET /api/phase2/status', () => {
    test('should return current status', async () => {
      // Mock metrics API response
      const fetch = require('node-fetch');
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ totalDownloads: 500000 })
      });

      // Mock Redis response
      const Redis = require('ioredis');
      const mockRedis = { get: jest.fn().mockResolvedValue(null) };
      Redis.mockImplementation(() => mockRedis);

      const response = await request(app)
        .get('/api/phase2/status');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        unlocked: false,
        downloads: 500000,
        required: 1000000
      });
    });
  });

  describe('POST /api/phase2/unlock', () => {
    test('should auto-unlock when downloads >= target', async () => {
      // Mock metrics API with sufficient downloads
      const fetch = require('node-fetch');
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ totalDownloads: 1500000 })
      });

      // Mock Redis and Postgres
      const Redis = require('ioredis');
      const mockRedis = { set: jest.fn().mockResolvedValue('OK') };
      Redis.mockImplementation(() => mockRedis);

      const { Pool } = require('pg');
      const mockClient = { query: jest.fn(), release: jest.fn() };
      const mockPool = { connect: jest.fn().mockResolvedValue(mockClient) };
      Pool.mockImplementation(() => mockPool);

      const response = await request(app)
        .post('/api/phase2/unlock')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        method: 'auto',
        downloads: 1500000
      });
    });

    test('should require admin token for manual unlock', async () => {
      // Mock metrics API with insufficient downloads
      const fetch = require('node-fetch');
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ totalDownloads: 500000 })
      });

      const response = await request(app)
        .post('/api/phase2/unlock')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('adminToken required for manual unlock');
    });

    test('should handle multi-admin approval flow', async () => {
      // Mock insufficient downloads
      const fetch = require('node-fetch');
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ totalDownloads: 500000 })
      });

      // Mock Redis for approval tracking
      const Redis = require('ioredis');
      const mockRedis = { 
        sadd: jest.fn().mockResolvedValue(1),
        scard: jest.fn().mockResolvedValue(1)
      };
      Redis.mockImplementation(() => mockRedis);

      // Mock Postgres
      const { Pool } = require('pg');
      const mockClient = { query: jest.fn(), release: jest.fn() };
      const mockPool = { connect: jest.fn().mockResolvedValue(mockClient) };
      Pool.mockImplementation(() => mockPool);

      const response = await request(app)
        .post('/api/phase2/unlock')
        .send({ adminToken: 'test-token-1' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        method: 'pending',
        approvals: 1,
        requiredApprovals: 2
      });
    });
  });

  describe('GET /api/phase2/flag', () => {
    test('should return current flag status', async () => {
      const Redis = require('ioredis');
      const mockRedis = { 
        get: jest.fn().mockResolvedValue('{"by":"auto","at":1234567890,"downloads":1500000}')
      };
      Redis.mockImplementation(() => mockRedis);

      const response = await request(app)
        .get('/api/phase2/flag');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        unlocked: true,
        flag: {
          by: 'auto',
          at: 1234567890,
          downloads: 1500000
        }
      });
    });
  });
});

// Integration test example
describe('Phase 2 Unlock Integration', () => {
  test('complete unlock flow simulation', async () => {
    // This would test the full flow:
    // 1. Check initial status (locked)
    // 2. Submit first admin approval (pending)
    // 3. Submit second admin approval (unlocked)
    // 4. Verify flag is set
    // 5. Check audit log entry
    
    // Implementation would require test database and Redis instance
  });
});