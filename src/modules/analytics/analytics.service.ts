import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import UserService from '@modules/user/user.service';
import { YEAR_MONTH_FORMAT } from '@common/constants';
import {
  ANALYTICS_DEFAULT_SUCCESS_RATE,
  ANALYTICS_HISTORY_DAYS,
  ANALYTICS_PERCENTAGE_DIVISOR,
  ANALYTICS_PERCENTAGE_MULTIPLIER,
  ANALYTICS_RECENT_ACTIVITY_LIMIT,
  CONFIDENCE_RANGE_ORDER,
  CONFIDENCE_RANGE_80_90,
  CONFIDENCE_RANGE_70_80,
  CONFIDENCE_RANGE_60_70,
  CONFIDENCE_RANGE_90_100,
  CONFIDENCE_RANGE_BELOW_60,
  CONFIDENCE_SCORE_HIGH,
  CONFIDENCE_SCORE_LOW,
  CONFIDENCE_SCORE_MEDIUM,
  CONFIDENCE_SCORE_MEDIUM_HIGH,
} from './constants/analytics.constants';
import {
  ComplianceUsageData,
  ConfidenceRangeData,
  DashboardData,
  EntityTypeData,
  ProcessingHistoryData,
  RecentActivityData,
  StatsData,
} from './types/dashboard-data.types';

@Injectable()
export default class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepo: Repository<Documents>,
    @InjectRepository(PIIEntities)
    private readonly piiEntitiesRepo: Repository<PIIEntities>,
    private readonly userService: UserService,
  ) {}

  async getDashboard(email: string): Promise<DashboardData> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const { uuid: userId } = user;

    const [
      statsResult,
      entityTypesResult,
      complianceUsageResult,
      processingHistoryResult,
      confidenceDistributionResult,
      recentActivityResult,
    ] = await Promise.allSettled([
      this.getStats(userId),
      this.getEntityTypes(userId),
      this.getComplianceUsage(userId),
      this.getProcessingHistory(userId, ANALYTICS_HISTORY_DAYS),
      this.getConfidenceDistribution(userId),
      this.getRecentActivity(userId, ANALYTICS_RECENT_ACTIVITY_LIMIT),
    ]);

    if (statsResult.status === 'rejected')
      this.logger.error('getStats failed', statsResult.reason);
    if (entityTypesResult.status === 'rejected')
      this.logger.error('getEntityTypes failed', entityTypesResult.reason);
    if (complianceUsageResult.status === 'rejected')
      this.logger.error(
        'getComplianceUsage failed',
        complianceUsageResult.reason,
      );
    if (processingHistoryResult.status === 'rejected')
      this.logger.error(
        'getProcessingHistory failed',
        processingHistoryResult.reason,
      );
    if (confidenceDistributionResult.status === 'rejected')
      this.logger.error(
        'getConfidenceDistribution failed',
        confidenceDistributionResult.reason,
      );
    if (recentActivityResult.status === 'rejected')
      this.logger.error(
        'getRecentActivity failed',
        recentActivityResult.reason,
      );

    return {
      stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
      entityTypes:
        entityTypesResult.status === 'fulfilled' ? entityTypesResult.value : [],
      complianceUsage:
        complianceUsageResult.status === 'fulfilled'
          ? complianceUsageResult.value
          : [],
      processingHistory:
        processingHistoryResult.status === 'fulfilled'
          ? processingHistoryResult.value
          : [],
      confidenceDistribution:
        confidenceDistributionResult.status === 'fulfilled'
          ? confidenceDistributionResult.value
          : [],
      recentActivity:
        recentActivityResult.status === 'fulfilled'
          ? recentActivityResult.value
          : [],
    };
  }

  private async getStats(userId: string): Promise<StatsData> {
    try {
      const totals = await this.documentsRepo
        .createQueryBuilder('d')
        .leftJoin('d.piiEntities', 'e')
        .select('COUNT(DISTINCT d.id)', 'totalDocuments')
        .addSelect('COUNT(e.id)', 'totalEntities')
        .where('d.userId = :userId', { userId })
        .getRawOne<{ totalDocuments: string; totalEntities: string }>();

      const totalDocuments = Number(totals?.totalDocuments ?? 0);
      const totalEntities = Number(totals?.totalEntities ?? 0);
      const avgEntitiesPerDoc =
        totalDocuments > 0
          ? Math.round(
              (totalEntities / totalDocuments) * ANALYTICS_PERCENTAGE_DIVISOR,
            ) / ANALYTICS_PERCENTAGE_DIVISOR
          : 0;

      const monthly = await this.documentsRepo
        .createQueryBuilder('d')
        .leftJoin('d.piiEntities', 'e')
        .select(
          `COUNT(DISTINCT CASE WHEN DATE_FORMAT(d.createdAt, '${YEAR_MONTH_FORMAT}') = DATE_FORMAT(NOW(), '${YEAR_MONTH_FORMAT}') THEN d.id END)`,
          'thisMonthDocs',
        )
        .addSelect(
          `COUNT(DISTINCT CASE WHEN DATE_FORMAT(d.createdAt, '${YEAR_MONTH_FORMAT}') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '${YEAR_MONTH_FORMAT}') THEN d.id END)`,
          'lastMonthDocs',
        )
        .addSelect(
          `SUM(CASE WHEN DATE_FORMAT(d.createdAt, '${YEAR_MONTH_FORMAT}') = DATE_FORMAT(NOW(), '${YEAR_MONTH_FORMAT}') THEN 1 ELSE 0 END)`,
          'thisMonthEntities',
        )
        .addSelect(
          `SUM(CASE WHEN DATE_FORMAT(d.createdAt, '${YEAR_MONTH_FORMAT}') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '${YEAR_MONTH_FORMAT}') THEN 1 ELSE 0 END)`,
          'lastMonthEntities',
        )
        .where('d.userId = :userId', { userId })
        .andWhere(`d.createdAt >= DATE_SUB(NOW(), INTERVAL 2 MONTH)`)
        .getRawOne<{
          thisMonthDocs: string;
          lastMonthDocs: string;
          thisMonthEntities: string;
          lastMonthEntities: string;
        }>();

      return {
        totalDocuments,
        totalEntities,
        avgEntitiesPerDoc,
        successRate: ANALYTICS_DEFAULT_SUCCESS_RATE,
        trends: {
          documentsVsLastMonth: AnalyticsService.calcTrend(
            Number(monthly?.thisMonthDocs ?? 0),
            Number(monthly?.lastMonthDocs ?? 0),
          ),
          entitiesVsLastMonth: AnalyticsService.calcTrend(
            Number(monthly?.thisMonthEntities ?? 0),
            Number(monthly?.lastMonthEntities ?? 0),
          ),
        },
      };
    } catch (err) {
      this.logger.error('getStats query failed', err);
      throw new InternalServerErrorException('Failed to load stats');
    }
  }

  private async getEntityTypes(userId: string): Promise<EntityTypeData[]> {
    try {
      const rows = await this.piiEntitiesRepo
        .createQueryBuilder('e')
        .innerJoin('e.document', 'd')
        .select('e.entityType', 'entityType')
        .addSelect('COUNT(e.id)', 'count')
        .where('d.userId = :userId', { userId })
        .groupBy('e.entityType')
        .orderBy('count', 'DESC')
        .getRawMany<{ entityType: string; count: string }>();

      return rows.map((r) => ({
        entityType: r.entityType,
        count: Number(r.count),
      }));
    } catch (err) {
      this.logger.error('getEntityTypes query failed', err);
      throw new InternalServerErrorException('Failed to load entity types');
    }
  }

  private async getComplianceUsage(
    userId: string,
  ): Promise<ComplianceUsageData[]> {
    try {
      const rows = await this.documentsRepo
        .createQueryBuilder('d')
        .select('d.chosenCompliance', 'frameworkCode')
        .addSelect('COUNT(d.id)', 'count')
        .where('d.userId = :userId', { userId })
        .groupBy('d.chosenCompliance')
        .getRawMany<{ frameworkCode: string; count: string }>();

      const total = rows.reduce((sum, r) => sum + Number(r.count), 0);

      return rows.map((r) => {
        const pct =
          total > 0
            ? Math.round(
                (Number(r.count) / total) * ANALYTICS_PERCENTAGE_MULTIPLIER,
              ) / ANALYTICS_PERCENTAGE_DIVISOR
            : 0;
        return {
          frameworkCode: r.frameworkCode,
          count: Number(r.count),
          percentage: pct,
        };
      });
    } catch (err) {
      this.logger.error('getComplianceUsage query failed', err);
      throw new InternalServerErrorException('Failed to load compliance usage');
    }
  }

  private async getProcessingHistory(
    userId: string,
    days: number,
  ): Promise<ProcessingHistoryData[]> {
    try {
      const rows = await this.documentsRepo
        .createQueryBuilder('d')
        .leftJoin('d.piiEntities', 'e')
        .select('DATE(d.createdAt)', 'historyDate')
        .addSelect('COUNT(DISTINCT d.id)', 'docCount')
        .addSelect('COUNT(e.id)', 'entityCount')
        .where('d.userId = :userId', { userId })
        .andWhere('d.createdAt >= DATE_SUB(NOW(), INTERVAL :days DAY)', {
          days,
        })
        .groupBy('DATE(d.createdAt)')
        .orderBy('DATE(d.createdAt)', 'ASC')
        .getRawMany<{
          historyDate: string | Date;
          docCount: string;
          entityCount: string;
        }>();

      return rows.map((r) => ({
        date:
          r.historyDate instanceof Date
            ? r.historyDate.toISOString()
            : String(r.historyDate ?? ''),
        documents: Number(r.docCount),
        entities: Number(r.entityCount),
      }));
    } catch (err) {
      this.logger.error('getProcessingHistory query failed', err);
      throw new InternalServerErrorException(
        'Failed to load processing history',
      );
    }
  }

  private async getConfidenceDistribution(
    userId: string,
  ): Promise<ConfidenceRangeData[]> {
    try {
      const rows = await this.piiEntitiesRepo
        .createQueryBuilder('e')
        .innerJoin('e.document', 'd')
        .select(
          `CASE
            WHEN e.score >= ${CONFIDENCE_SCORE_HIGH} THEN '${CONFIDENCE_RANGE_90_100}'
            WHEN e.score >= ${CONFIDENCE_SCORE_MEDIUM_HIGH} THEN '${CONFIDENCE_RANGE_80_90}'
            WHEN e.score >= ${CONFIDENCE_SCORE_MEDIUM} THEN '${CONFIDENCE_RANGE_70_80}'
            WHEN e.score >= ${CONFIDENCE_SCORE_LOW} THEN '${CONFIDENCE_RANGE_60_70}'
            ELSE '${CONFIDENCE_RANGE_BELOW_60}'
          END`,
          'scoreRange',
        )
        .addSelect('COUNT(e.id)', 'count')
        .where('d.userId = :userId', { userId })
        .groupBy('scoreRange')
        .getRawMany<{ scoreRange: string; count: string }>();

      return rows
        .map((r) => ({ range: r.scoreRange, count: Number(r.count) }))
        .sort(
          (a, b) =>
            (CONFIDENCE_RANGE_ORDER[a.range] ?? 99) -
            (CONFIDENCE_RANGE_ORDER[b.range] ?? 99),
        );
    } catch (err) {
      this.logger.error('getConfidenceDistribution query failed', err);
      throw new InternalServerErrorException(
        'Failed to load confidence distribution',
      );
    }
  }

  private async getRecentActivity(
    userId: string,
    limit: number,
  ): Promise<RecentActivityData[]> {
    try {
      const rows = await this.documentsRepo
        .createQueryBuilder('d')
        .leftJoin('d.piiEntities', 'e')
        .select('d.id', 'id')
        .addSelect('d.fileName', 'fileName')
        .addSelect('d.chosenCompliance', 'frameworkCode')
        .addSelect('d.createdAt', 'createdAt')
        .addSelect('COUNT(e.id)', 'entityCount')
        .where('d.userId = :userId', { userId })
        .groupBy('d.id')
        .addGroupBy('d.fileName')
        .addGroupBy('d.chosenCompliance')
        .addGroupBy('d.createdAt')
        .orderBy('d.createdAt', 'DESC')
        .limit(limit)
        .getRawMany<{
          id: string;
          fileName: string;
          frameworkCode: string;
          createdAt: Date;
          entityCount: string;
        }>();

      return rows.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        frameworkCode: r.frameworkCode,
        entityCount: Number(r.entityCount),
        createdAt: r.createdAt,
      }));
    } catch (err) {
      this.logger.error('getRecentActivity query failed', err);
      throw new InternalServerErrorException('Failed to load recent activity');
    }
  }

  private static calcTrend(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return (
      Math.round(
        ((current - previous) / previous) * ANALYTICS_PERCENTAGE_MULTIPLIER,
      ) / ANALYTICS_PERCENTAGE_DIVISOR
    );
  }
}
