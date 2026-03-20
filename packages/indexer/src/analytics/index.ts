/**
 * @sf-protocol/indexer - Analytics Module
 */

export {
  AnalyticsRecorder,
  createAnalyticsRecorder,
  globalAnalyticsRecorder
} from './events';
export type {
  AnalyticsEvent,
  ProposalMetrics,
  UserMetrics,
  GovernanceMetrics
} from './events';

export { AnalyticsService, createAnalyticsService } from './service';
export type { AnalyticsAggregationOptions } from './service';

export {
  AnalyticsExporter,
  createAnalyticsExporter,
  CommonTargets
} from './exporter';
export type { ExportOptions, ExportTarget } from './exporter';
