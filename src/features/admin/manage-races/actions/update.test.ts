import { db } from '@/shared/db';
import { ADMIN_ERRORS } from '@/shared/utils/admin';
import { revalidatePath } from 'next/cache';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeRace, updateRace } from './update';

vi.mock('@/shared/utils/admin', async () => {
  const actual = await vi.importActual('@/shared/utils/admin');
  return {
    ...actual,
    requireAdmin: vi.fn(),
  };
});

vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
vi.mock('@/shared/db', () => ({
  db: {
    update: vi.fn(),
    transaction: vi.fn((cb) => cb(db)),
    query: {
      raceInstances: {
        findFirst: vi.fn().mockResolvedValue({ id: '123', status: 'SCHEDULED' }),
      },
    },
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/sse/event-emitter', () => ({
  raceEventEmitter: {
    emit: vi.fn(),
  },
  RACE_EVENTS: {
    RACE_CLOSED: 'RACE_CLOSED',
  },
}));

describe('updateRace', () => {
  const mockUpdate = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();
  const mockTx = {
    update: mockUpdate,
    query: {
      raceInstances: {
        findFirst: vi.fn().mockResolvedValue({ id: '123', status: 'SCHEDULED' }),
      },
      venues: {
        findFirst: vi.fn().mockResolvedValue({ shortName: 'Tok' }),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    (db.transaction as unknown as Mock).mockImplementation(async (cb) => cb(mockTx));
    (db.update as unknown as Mock).mockImplementation(mockUpdate);
  });

  it('should throw Unauthorized if user is not admin', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockRejectedValue(new Error(ADMIN_ERRORS.UNAUTHORIZED));
    const formData = new FormData();

    await expect(updateRace('123', formData)).rejects.toThrow(ADMIN_ERRORS.UNAUTHORIZED);
  });

  it('should update race successfully', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    const formData = new FormData();
    formData.append('eventId', '550e8400-e29b-41d4-a716-446655440000');
    formData.append('date', '2024-01-02');

    formData.append('name', 'Kyoto Cup');
    formData.append('distance', '1600');
    formData.append('surface', '芝');
    formData.append('condition', '良');
    formData.append('venueId', 'venue_id');

    await updateRace('123', formData);

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Kyoto Cup',
        distance: 1600,
      })
    );
    expect(mockWhere).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/races');
  });
});

describe('closeRace', () => {
  const mockUpdate = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    (db.update as unknown as Mock).mockImplementation(mockUpdate);
  });

  it('should throw Unauthorized if user is not admin', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockRejectedValue(new Error(ADMIN_ERRORS.UNAUTHORIZED));

    await expect(closeRace('123')).rejects.toThrow(ADMIN_ERRORS.UNAUTHORIZED);
  });

  it('should close race and emit event', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    await closeRace('123');

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({ status: 'CLOSED' });
    expect(mockWhere).toHaveBeenCalled();

    const { raceEventEmitter } = await import('@/lib/sse/event-emitter');
    expect(raceEventEmitter.emit).toHaveBeenCalledWith('RACE_CLOSED', expect.objectContaining({ raceId: '123' }));

    expect(revalidatePath).toHaveBeenCalled();
  });
});
