export type TrendsData = {
  documentsVsLastMonth: number | null;
  entitiesVsLastMonth: number | null;
};

export type StatsData = {
  totalDocuments: number;
  totalEntities: number;
  avgEntitiesPerDoc: number;
  successRate: number;
  trends: TrendsData;
};

export type EntityTypeData = {
  entityType: string;
  count: number;
};

export type ComplianceUsageData = {
  frameworkCode: string;
  count: number;
  percentage: number;
};

export type ProcessingHistoryData = {
  date: string;
  documents: number;
  entities: number;
};

export type ConfidenceRangeData = {
  range: string;
  count: number;
};

export type RecentActivityData = {
  id: string;
  fileName: string;
  frameworkCode: string;
  entityCount: number;
  createdAt: Date;
};

export type DeIdMethodData = {
  method: string;
  count: number;
  percentage: number;
};

export type DashboardData = {
  stats: StatsData | null;
  entityTypes: EntityTypeData[];
  complianceUsage: ComplianceUsageData[];
  processingHistory: ProcessingHistoryData[];
  confidenceDistribution: ConfidenceRangeData[];
  recentActivity: RecentActivityData[];
  deIdMethodUsage: DeIdMethodData[];
};
