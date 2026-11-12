import { describe, expect, it } from 'vitest';
import { ActivityType, getActivityCapabilities } from './activity';

describe('getActivityCapabilities', () => {
  it('online_collect allows submission (closes FE gate miss)', () => {
    expect(getActivityCapabilities(ActivityType.ONLINE_COLLECT).allowsSubmission).toBe(true);
    expect(getActivityCapabilities(ActivityType.COLLECTION).allowsSubmission).toBe(true);
  });

  it('only offline_meet allows album/sign-in surface', () => {
    expect(getActivityCapabilities(ActivityType.OFFLINE_MEET).allowsOffline).toBe(true);
    expect(getActivityCapabilities(ActivityType.ONLINE_VOTE).allowsOffline).toBe(false);
    expect(getActivityCapabilities(ActivityType.ONLINE_COLLECT).allowsOffline).toBe(false);
  });

  it('vote UI for vote-like types only', () => {
    expect(getActivityCapabilities(ActivityType.ONLINE_VOTE).allowsVote).toBe(true);
    expect(getActivityCapabilities(ActivityType.ONLINE_COLLECT).allowsVote).toBe(false);
  });
});
