import { describe, it, expect } from 'vitest';
import { 
  missionSchema, 
  missionStorageSchema,
  isMission 
} from './mission';
import { MissionStatus } from './mission';

describe('missionSchema', () => {
  const validMission = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Mission',
    description: 'Test Description',
    status: 'not_started',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  it('validates complete mission object', () => {
    expect(() => missionSchema.parse(validMission)).not.toThrow();
    
    const parsed = missionSchema.parse(validMission);
    expect(parsed.id).toBe(validMission.id);
    expect(parsed.title).toBe(validMission.title);
    expect(parsed.status).toBe(MissionStatus.NotStarted);
    expect(parsed.createdAt).toBeInstanceOf(Date);
    expect(parsed.updatedAt).toBeInstanceOf(Date);
  });

  it('validates mission with string dates', () => {
    const missionWithStringDates = {
      ...validMission,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
    };

    expect(() => missionSchema.parse(missionWithStringDates)).not.toThrow();
    
    const parsed = missionSchema.parse(missionWithStringDates);
    expect(parsed.createdAt).toBeInstanceOf(Date);
    expect(parsed.updatedAt).toBeInstanceOf(Date);
  });

  it('rejects missing required fields (id, title, status)', () => {
    // Missing id
    expect(() => missionSchema.parse({
      ...validMission,
      id: '',
    })).toThrow();

    // Missing title
    expect(() => missionSchema.parse({
      ...validMission,
      title: '',
    })).toThrow();

    // Missing status
    expect(() => missionSchema.parse({
      ...validMission,
      status: undefined,
    })).toThrow();

    // Missing isActive
    expect(() => missionSchema.parse({
      ...validMission,
      isActive: undefined,
    })).toThrow();
  });

  it('enforces title max length (100)', () => {
    const validTitle = 'x'.repeat(100);
    const invalidTitle = 'x'.repeat(101);

    expect(() => missionSchema.parse({
      ...validMission,
      title: validTitle,
    })).not.toThrow();

    expect(() => missionSchema.parse({
      ...validMission,
      title: invalidTitle,
    })).toThrow();
  });

  it('enforces description max length (500)', () => {
    const validDescription = 'x'.repeat(500);
    const invalidDescription = 'x'.repeat(501);

    expect(() => missionSchema.parse({
      ...validMission,
      description: validDescription,
    })).not.toThrow();

    expect(() => missionSchema.parse({
      ...validMission,
      description: invalidDescription,
    })).toThrow();
  });

  it('accepts optional description', () => {
    expect(() => missionSchema.parse({
      ...validMission,
      description: undefined,
    })).not.toThrow();

    expect(() => missionSchema.parse({
      ...validMission,
      description: null,
    })).not.toThrow();
  });

  it('validates status enum values', () => {
    const validStatuses = ['not_started', 'in_progress', 'completed', 'blocked'];
    const invalidStatus = 'invalid_status';

    validStatuses.forEach(status => {
      expect(() => missionSchema.parse({
        ...validMission,
        status,
      })).not.toThrow();
    });

    expect(() => missionSchema.parse({
      ...validMission,
      status: invalidStatus,
    })).toThrow();
  });

  it('validates UUID format for id', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUUIDs = [
      'not-a-uuid',
      '12345678-1234-1234-1234-1234567890123', // Too long
      '12345678-1234-1234-1234-12345678901', // Too short
      'g23e8400-e29b-41d4-a716-446655440000', // Invalid character
    ];

    expect(() => missionSchema.parse({
      ...validMission,
      id: validUUID,
    })).not.toThrow();

    invalidUUIDs.forEach(invalidUUID => {
      expect(() => missionSchema.parse({
        ...validMission,
        id: invalidUUID,
      })).toThrow();
    });
  });

  it('validates boolean isActive', () => {
    expect(() => missionSchema.parse({
      ...validMission,
      isActive: true,
    })).not.toThrow();

    expect(() => missionSchema.parse({
      ...validMission,
      isActive: false,
    })).not.toThrow();

    expect(() => missionSchema.parse({
      ...validMission,
      isActive: 'true' as any,
    })).toThrow();

    expect(() => missionSchema.parse({
      ...validMission,
      isActive: 1 as any,
    })).toThrow();
  });
});

describe('missionStorageSchema', () => {
  const validStorageMission = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Mission',
    description: 'Test Description',
    status: 'not_started',
    isActive: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  };

  it('validates storage mission with string dates', () => {
    expect(() => missionStorageSchema.parse(validStorageMission)).not.toThrow();
    
    const parsed = missionStorageSchema.parse(validStorageMission);
    expect(parsed.createdAt).toBeInstanceOf(Date);
    expect(parsed.updatedAt).toBeInstanceOf(Date);
  });

  it('transforms string dates to Date objects', () => {
    const parsed = missionStorageSchema.parse(validStorageMission);
    
    expect(parsed.createdAt).toEqual(new Date('2024-01-15T10:00:00.000Z'));
    expect(parsed.updatedAt).toEqual(new Date('2024-01-15T10:00:00.000Z'));
  });

  it('rejects Date objects in storage schema', () => {
    const missionWithDateObjects = {
      ...validStorageMission,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() => missionStorageSchema.parse(missionWithDateObjects)).toThrow();
  });
});

describe('isMission type guard', () => {
  const validMission = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Mission',
    description: 'Test Description',
    status: 'not_started',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  it('returns true for valid mission', () => {
    expect(isMission(validMission)).toBe(true);
  });

  it('returns true for valid mission with string dates', () => {
    const missionWithStringDates = {
      ...validMission,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
    };

    expect(isMission(missionWithStringDates)).toBe(true);
  });

  it('returns false for invalid data', () => {
    const invalidMissions = [
      null,
      undefined,
      {},
      { id: 'invalid' },
      { id: '550e8400-e29b-41d4-a716-446655440000' }, // Missing required fields
      { ...validMission, title: '' }, // Empty title
      { ...validMission, status: 'invalid' }, // Invalid status
      { ...validMission, id: 'not-a-uuid' }, // Invalid UUID
      { ...validMission, isActive: 'true' }, // Wrong type for boolean
      'string-data',
      123,
      [],
    ];

    invalidMissions.forEach(invalidMission => {
      expect(isMission(invalidMission)).toBe(false);
    });
  });

  it('handles edge cases gracefully', () => {
    // Partial mission
    expect(isMission({ id: validMission.id })).toBe(false);
    
    // Mission with extra properties
    expect(isMission({ ...validMission, extraProperty: 'extra' })).toBe(true);
    
    // Mission with wrong property types
    expect(isMission({ ...validMission, title: 123 })).toBe(false);
  });
});
