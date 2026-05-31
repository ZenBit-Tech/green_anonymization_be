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
  | 'basic_report'
  | 'advanced_deid'
  | 'synthetic_data'
  | 'custom_rules'
  | 'priority_support';

export const FREE_PLAN_DOCUMENTS_PER_DAY = 5;
export const FREE_PLAN_EDITS_PER_DAY = 3;
export const DEFAULT_TIMEZONE = 'UTC';
export const PRO_PLAN_PRICE_CENTS = 4900;
export const PRO_PLAN_SUBSCRIPTION_DAYS = 30;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const DAILY_LIMIT_REACHED_CODE = 'DAILY_LIMIT_REACHED';
export const DAILY_EDIT_LIMIT_REACHED_CODE = 'DAILY_EDIT_LIMIT_REACHED';
