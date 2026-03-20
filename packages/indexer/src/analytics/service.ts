/**
 * Analytics Service for Querying and Aggregating Metrics
 */

import { AnalyticsRecorder, ProposalMetrics, UserMetrics, GovernanceMetrics } from './events';

export interface AnalyticsAggregationOptions {
  /**
   * Time window in milliseconds
   */
  timeWindow?: number;

  /**
   * Granularity: 'hour', 'day', 'week', 'month'
   */
  granularity?: 'hour' | 'day' | 'week' | 'month';

  /**
   * Limit results
   */
  limit?: number;
}

/**
 * Analytics service for querying metrics
 */
export class AnalyticsService {
  constructor(private recorder: AnalyticsRecorder) {}

  /**
   * Get proposal metrics
   */
  getProposalMetrics(proposalId: string): ProposalMetrics | null {
    const events = this.recorder
      .getAllEvents()
      .filter((e) => e.data.proposalId === proposalId);

    if (events.length === 0) return null;

    const voteEvents = events.filter((e) => e.type === 'proposal.voted');
    const uniqueVoters = new Set(voteEvents.map((e) => e.userId)).size;

    const forVotes = voteEvents.filter((e) => e.data.direction === 'for').length;
    const againstVotes = voteEvents.filter((e) => e.data.direction === 'against').length;
    const abstainVotes = voteEvents.filter((e) => e.data.direction === 'abstain').length;

    const totalVotes = voteEvents.length;
    const averageVoteWeight =
      totalVotes > 0
        ? voteEvents.reduce((sum, e) => sum + (e.data.weight || 0), 0) / totalVotes
        : 0;

    const totalStakeInvolved = BigInt(
      voteEvents.reduce((sum, e) => sum + (e.data.stake || 0), 0)
    );

    return {
      proposalId,
      totalVotes,
      uniqueVoters,
      forVotes,
      againstVotes,
      abstainVotes,
      averageVoteWeight,
      totalStakeInvolved,
      participationRate: 0, // Would be calculated with full proposal data
      createdAt: events[0].timestamp,
      updatedAt: events[events.length - 1].timestamp
    };
  }

  /**
   * Get user metrics
   */
  getUserMetrics(address: string): UserMetrics | null {
    const events = this.recorder.getAllEvents().filter((e) => e.userId === address);

    if (events.length === 0) return null;

    const stakes = events
      .filter((e) => e.type === 'stake.deposited' || e.type === 'stake.withdrawn')
      .map((e) => e.data.amount || 0);

    const totalStaked = BigInt(stakes.reduce((sum, a) => sum + a, 0));
    const proposalsCreated = events.filter((e) => e.type === 'proposal.created').length;
    const votesCount = events.filter((e) => e.type === 'proposal.voted').length;

    const sortedTimes = events.map((e) => e.timestamp).sort((a, b) => a - b);
    const firstActivityAt = sortedTimes[0];
    const lastActivityAt = sortedTimes[sortedTimes.length - 1];

    // Calculate reputation score
    const reputationScore =
      proposalsCreated * 10 + votesCount * 2 + (stakes.length > 0 ? 5 : 0);

    return {
      address,
      totalStaked,
      currentBalance: totalStaked,
      proposalsCreated,
      votesCount,
      participationRate: 0,
      firstActivityAt,
      lastActivityAt,
      reputationScore
    };
  }

  /**
   * Get governance metrics
   */
  getGovernanceMetrics(): GovernanceMetrics {
    const events = this.recorder.getAllEvents();

    const totalProposals = new Set(
      events
        .filter((e) => e.type === 'proposal.created')
        .map((e) => e.data.proposalId)
    ).size;

    const uniqueVoters = new Set(
      events.filter((e) => e.type === 'proposal.voted').map((e) => e.userId)
    ).size;

    const totalStakeLocked = BigInt(
      events
        .filter((e) => e.type === 'stake.deposited')
        .reduce((sum, e) => sum + (e.data.amount || 0), 0)
    );

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const dailyActiveUsers = new Set(
      events
        .filter((e) => e.timestamp >= oneDayAgo)
        .map((e) => e.userId)
    ).size;

    const weeklyActiveUsers = new Set(
      events
        .filter((e) => e.timestamp >= oneWeekAgo)
        .map((e) => e.userId)
    ).size;

    const monthlyActiveUsers = new Set(
      events
        .filter((e) => e.timestamp >= oneMonthAgo)
        .map((e) => e.userId)
    ).size;

    return {
      totalProposals,
      activeProposals: 0, // Would need additional data
      executedProposals: events.filter((e) => e.type === 'proposal.executed').length,
      totalUniqueVoters: uniqueVoters,
      totalStakeLocked,
      averageParticipation: 0,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      recordedAt: now
    };
  }

  /**
   * Get top proposals by votes
   */
  getTopProposalsByVotes(limit: number = 10): Array<{
    proposalId: string;
    votes: number;
  }> {
    const proposalVotes = new Map<string, number>();

    this.recorder
      .getAllEvents()
      .filter((e) => e.type === 'proposal.voted')
      .forEach((e) => {
        const id = e.data.proposalId;
        proposalVotes.set(id, (proposalVotes.get(id) || 0) + 1);
      });

    return Array.from(proposalVotes.entries())
      .map(([proposalId, votes]) => ({ proposalId, votes }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  /**
   * Get top users by activity
   */
  getTopUsersByActivity(limit: number = 10): Array<{
    address: string;
    activityCount: number;
  }> {
    const userActivity = new Map<string, number>();

    this.recorder
      .getAllEvents()
      .forEach((e) => {
        if (e.userId) {
          userActivity.set(e.userId, (userActivity.get(e.userId) || 0) + 1);
        }
      });

    return Array.from(userActivity.entries())
      .map(([address, activityCount]) => ({ address, activityCount }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, limit);
  }
}

/**
 * Create analytics service
 */
export function createAnalyticsService(recorder: AnalyticsRecorder): AnalyticsService {
  return new AnalyticsService(recorder);
}
