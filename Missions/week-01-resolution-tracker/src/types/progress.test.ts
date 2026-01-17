import { describe, it, expect } from 'vitest';
import { 
  progressUpdateSchema, 
  progressUpdateStorageSchema,
  isProgressUpdate 
} from './progress';

describe('progressUpdateSchema', () => {
  const validProgressUpdate = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    missionId: '550e8400-e29b-41d4-a716-446655440000',
    content: 'Test progress update',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  };

  it('validates complete progress update', () => {
    expect(() => progressUpdateSchema.parse(validProgressUpdate)).not.toThrow();
    
    const parsed = progressUpdateSchema.parse(validProgressUpdate);
    expect(parsed.id).toBe(validProgressUpdate.id);
    expect(parsed.missionId).toBe(validProgressUpdate.missionId);
    expect(parsed.content).toBe(validProgressUpdate.content);
    expect(parsed.timestamp).toBeInstanceOf(Date);
  });

  it('validates progress update with string timestamp', () => {
    const progressWithStringTimestamp = {
      ...validProgressUpdate,
      timestamp: '2024-01-15T10:00:00.000Z',
    };

    expect(() => progressUpdateSchema.parse(progressWithStringTimestamp)).not.toThrow();
    
    const parsed = progressUpdateSchema.parse(progressWithStringTimestamp);
    expect(parsed.timestamp).toBeInstanceOf(Date);
    expect(parsed.timestamp).toEqual(new Date('2024-01-15T10:00:00.000Z'));
  });

  it('enforces content length (1-1000)', () => {
    const validContent = 'x'.repeat(1000);
    const invalidContentEmpty = '';
    const invalidContentTooLong = 'x'.repeat(1001);

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      content: validContent,
    })).not.toThrow();

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      content: invalidContentEmpty,
    })).toThrow();

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      content: invalidContentTooLong,
    })).toThrow();
  });

  it('validates UUID format for id', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440001';
    const invalidUUIDs = [
      'not-a-uuid',
      '12345678-1234-1234-1234-1234567890123', // Too long
      '12345678-1234-1234-1234-12345678901', // Too short
      'g23e8400-e29b-41d4-a716-446655440001', // Invalid character
    ];

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      id: validUUID,
    })).not.toThrow();

    invalidUUIDs.forEach(invalidUUID => {
      expect(() => progressUpdateSchema.parse({
        ...validProgressUpdate,
        id: invalidUUID,
      })).toThrow();
    });
  });

  it('validates UUID format for missionId', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUUID = 'not-a-uuid';

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      missionId: validUUID,
    })).not.toThrow();

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      missionId: invalidUUID,
    })).toThrow();
  });

  it('rejects missing required fields', () => {
    // Missing id
    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      id: '',
    })).toThrow();

    // Missing missionId
    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      missionId: '',
    })).toThrow();

    // Missing content
    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      content: undefined,
    })).toThrow();

    // Missing timestamp
    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      timestamp: undefined,
    })).toThrow();
  });

  it('handles whitespace content correctly', () => {
    const whitespaceOnlyContent = '   ';
    const contentWithSpaces = '  valid content  ';

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      content: whitespaceOnlyContent,
    })).not.toThrow(); // Whitespace is still content

    expect(() => progressUpdateSchema.parse({
      ...validProgressUpdate,
      content: contentWithSpaces,
    })).not.toThrow();
  });
});

describe('progressUpdateStorageSchema', () => {
  const validStorageProgressUpdate = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    missionId: '550e8400-e29b-41d4-a716-446655440000',
    content: 'Test progress update',
    timestamp: '2024-01-15T10:00:00.000Z',
  };

  it('validates storage progress update with string timestamp', () => {
    expect(() => progressUpdateStorageSchema.parse(validStorageProgressUpdate)).not.toThrow();
    
    const parsed = progressUpdateStorageSchema.parse(validStorageProgressUpdate);
    expect(parsed.timestamp).toBeInstanceOf(Date);
    expect(parsed.timestamp).toEqual(new Date('2024-01-15T10:00:00.000Z'));
  });

  it('transforms string timestamp to Date object', () => {
    const parsed = progressUpdateStorageSchema.parse(validStorageProgressUpdate);
    
    expect(parsed.timestamp).toBeInstanceOf(Date);
    expect(parsed.timestamp.getTime()).toBe(new Date('2024-01-15T10:00:00.000Z').getTime());
  });

  it('rejects Date objects in storage schema', () => {
    const progressWithDateObject = {
      ...validStorageProgressUpdate,
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() => progressUpdateStorageSchema.parse(progressWithDateObject)).toThrow();
  });

  it('enforces same validation as runtime schema', () => {
    // Test content length validation
    expect(() => progressUpdateStorageSchema.parse({
      ...validStorageProgressUpdate,
      content: '',
    })).toThrow();

    expect(() => progressUpdateStorageSchema.parse({
      ...validStorageProgressUpdate,
      content: 'x'.repeat(1001),
    })).toThrow();

    // Test UUID validation
    expect(() => progressUpdateStorageSchema.parse({
      ...validStorageProgressUpdate,
      id: 'not-a-uuid',
    })).toThrow();

    expect(() => progressUpdateStorageSchema.parse({
      ...validStorageProgressUpdate,
      missionId: 'not-a-uuid',
    })).toThrow();
  });
});

describe('isProgressUpdate type guard', () => {
  const validProgressUpdate = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    missionId: '550e8400-e29b-41d4-a716-446655440000',
    content: 'Test progress update',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  };

  it('returns true for valid progress update', () => {
    expect(isProgressUpdate(validProgressUpdate)).toBe(true);
  });

  it('returns true for valid progress update with string timestamp', () => {
    const progressWithStringTimestamp = {
      ...validProgressUpdate,
      timestamp: '2024-01-15T10:00:00.000Z',
    };

    expect(isProgressUpdate(progressWithStringTimestamp)).toBe(true);
  });

  it('returns false for invalid data', () => {
    const invalidProgressUpdates = [
      null,
      undefined,
      {},
      { id: 'invalid' },
      { id: validProgressUpdate.id }, // Missing required fields
      { ...validProgressUpdate, content: '' }, // Empty content
      { ...validProgressUpdate, content: 'x'.repeat(1001) }, // Too long
      { ...validProgressUpdate, id: 'not-a-uuid' }, // Invalid UUID
      { ...validProgressUpdate, missionId: 'not-a-uuid' }, // Invalid UUID
      'string-data',
      123,
      [],
    ];

    invalidProgressUpdates.forEach(invalidProgress => {
      expect(isProgressUpdate(invalidProgress)).toBe(false);
    });
  });

  it('handles edge cases gracefully', () => {
    // Partial progress update
    expect(isProgressUpdate({ id: validProgressUpdate.id })).toBe(false);
    
    // Progress update with extra properties
    expect(isProgressUpdate({ ...validProgressUpdate, extraProperty: 'extra' })).toBe(true);
    
    // Progress update with wrong property types
    expect(isProgressUpdate({ ...validProgressUpdate, content: 123 })).toBe(false);
    expect(isProgressUpdate({ ...validProgressUpdate, timestamp: 'not-a-date' })).toBe(false);
  });

  it('validates timestamp transformation', () => {
    const progressWithVariousTimestamps = [
      '2024-01-15T10:00:00.000Z',
      '2024-01-15T10:00:00Z',
      '2024-01-15',
    ].forEach(timestamp => {
      const progress = {
        ...validProgressUpdate,
        timestamp,
      };
      
      expect(isProgressUpdate(progress)).toBe(true);
    });
  });
});
