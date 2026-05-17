export enum PlanName {
  FREE = 'Free',
  PRO = 'Pro',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export type FeatureKey =
  | 'pii_detection'
  | 'standard_deid'
  | 'advanced_deid'
  | 'custom_rules'
  | 'batch'
  | 'audit_logs'
  | 'priority_support';

export const FREE_PLAN_DOCUMENTS_PER_DAY = 5;
export const PRO_PLAN_PRICE_CENTS = 4900;
export const PRO_PLAN_SUBSCRIPTION_DAYS = 30;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const DAILY_LIMIT_REACHED_CODE = 'DAILY_LIMIT_REACHED';
