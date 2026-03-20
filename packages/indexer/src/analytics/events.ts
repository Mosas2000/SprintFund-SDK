/**
 * Analytics Data Model and Events
 * 
 * Tracks governance metrics and user activity.
 */

export interface AnalyticsEvent {
  /**
   * Event ID
   */
  id: string;

  /**
   * Event type
   */
  type:
    | 'proposal.created'
    | 'proposal.voted'
    | 'proposal.executed'
    | 'stake.deposited'
    | 'stake.withdrawn'
    | 'user.joined'
    | 'error.occurred';

  /**
   * User/account address
   */
  userId?: string;

  /**
   * Event data
   */
  data: Record<string, any>;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Session ID for tracking
   */
  sessionId?: string;
}

export interface ProposalMetrics {
  /**
   * Proposal ID
   */
  proposalId: string;

  /**
   * Total votes cast
   */
  totalVotes: number;

  /**
   * Unique voters
   */
  uniqueVoters: number;

  /**
   * For votes
   */
  forVotes: number;

  /**
   * Against votes
   */
  againstVotes: number;

  /**
   * Abstain votes
   */
  abstainVotes: number;

  /**
   * Average vote weight
   */
  averageVoteWeight: number;

  /**
   * Total stake involved
   */
  totalStakeInvolved: bigint;

  /**
   * Participation rate
   */
  participationRate: number;

  /**
   * Created at
   */
  createdAt: number;

  /**
   * Last updated
   */
  updatedAt: number;
}

export interface UserMetrics {
  /**
   * User address
   */
  address: string;

  /**
   * Total stakes
   */
  totalStaked: bigint;

  /**
   * Current balance
   */
  currentBalance: bigint;

  /**
   * Proposals created
   */
  proposalsCreated: number;

  /**
   * Total votes cast
   */
  votesCount: number;

  /**
   * Participation rate (%)
   */
  participationRate: number;

  /**
   * First activity
   */
  firstActivityAt: number;

  /**
   * Last activity
   */
  lastActivityAt: number;

  /**
   * Reputation score
   */
  reputationScore: number;
}

export interface GovernanceMetrics {
  /**
   * Total proposals
   */
  totalProposals: number;

  /**
   * Active proposals
   */
  activeProposals: number;

  /**
   * Executed proposals
   */
  executedProposals: number;

  /**
   * Total unique voters
   */
  totalUniqueVoters: number;

  /**
   * Total stake locked
   */
  totalStakeLocked: bigint;

  /**
   * Average participation
   */
  averageParticipation: number;

  /**
   * Daily active users
   */
  dailyActiveUsers: number;

  /**
   * Weekly active users
   */
  weeklyActiveUsers: number;

  /**
   * Monthly active users
   */
  monthlyActiveUsers: number;

  /**
   * Recorded at
   */
  recordedAt: number;
}

/**
 * Analytics event recorder
 */
export class AnalyticsRecorder {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 10000;

  /**
   * Record event
   */
  recordEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): AnalyticsEvent {
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Keep array size under control
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    return fullEvent;
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events for user
   */
  getEventsForUser(userId: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.userId === userId);
  }

  /**
   * Get events in time range
   */
  getEventsInRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  /**
   * Get all events
   */
  getAllEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this.events.length;
  }
}

/**
 * Create analytics recorder
 */
export function createAnalyticsRecorder(): AnalyticsRecorder {
  return new AnalyticsRecorder();
}

export const globalAnalyticsRecorder = new AnalyticsRecorder();
