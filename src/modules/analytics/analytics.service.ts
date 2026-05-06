import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import UserService from '@modules/user/user.service';
import DashboardDto from './dto/dashboard.dto';
import DashboardStatsDto from './dto/dashboard-stats.dto';
import EntityTypeStatDto from './dto/entity-type-stat.dto';
import ComplianceUsageDto from './dto/compliance-usage.dto';
import ProcessingHistoryDto from './dto/processing-history.dto';
import ConfidenceRangeDto from './dto/confidence-range.dto';
import RecentActivityDto from './dto/recent-activity.dto';

const HISTORY_DAYS = 7;
const RECENT_ACTIVITY_LIMIT = 10;

@Injectable()
export default class AnalyticsService {
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepo: Repository<Documents>,
    @InjectRepository(PIIEntities)
    private readonly piiEntitiesRepo: Repository<PIIEntities>,
    private readonly userService: UserService,
  ) {}

  async getDashboard(email: string): Promise<DashboardDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const { uuid: userId } = user;

    const [
      stats,
      entityTypes,
      complianceUsage,
      processingHistory,
      confidenceDistribution,
      recentActivity,
    ] = await Promise.all([
      this.getStats(userId),
      this.getEntityTypes(userId),
      this.getComplianceUsage(userId),
      this.getProcessingHistory(userId, HISTORY_DAYS),
      this.getConfidenceDistribution(userId),
      this.getRecentActivity(userId, RECENT_ACTIVITY_LIMIT),
    ]);

    return {
      stats,
      entityTypes,
      complianceUsage,
      processingHistory,
      confidenceDistribution,
      recentActivity,
    };
  }

  private async getStats(userId: string): Promise<DashboardStatsDto> {
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
        ? Math.round((totalEntities / totalDocuments) * 10) / 10
        : 0;

    const monthly = await this.documentsRepo
      .createQueryBuilder('d')
      .select(
        `SUM(CASE WHEN DATE_FORMAT(d.createdAt, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END)`,
        'thisMonthDocs',
      )
      .addSelect(
        `SUM(CASE WHEN DATE_FORMAT(d.createdAt, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m') THEN 1 ELSE 0 END)`,
        'lastMonthDocs',
      )
      .where('d.userId = :userId', { userId })
      .andWhere('d.createdAt >= DATE_SUB(NOW(), INTERVAL 2 MONTH)')
      .getRawOne<{ thisMonthDocs: string; lastMonthDocs: string }>();

    const monthlyEntities = await this.piiEntitiesRepo
      .createQueryBuilder('e')
      .innerJoin('e.document', 'd')
      .select(
        `SUM(CASE WHEN DATE_FORMAT(d.createdAt, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END)`,
        'thisMonthEntities',
      )
      .addSelect(
        `SUM(CASE WHEN DATE_FORMAT(d.createdAt, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m') THEN 1 ELSE 0 END)`,
        'lastMonthEntities',
      )
      .where('d.userId = :userId', { userId })
      .andWhere('d.createdAt >= DATE_SUB(NOW(), INTERVAL 2 MONTH)')
      .getRawOne<{ thisMonthEntities: string; lastMonthEntities: string }>();

    return {
      totalDocuments,
      totalEntities,
      avgEntitiesPerDoc,
      successRate: 100,
      trends: {
        documentsVsLastMonth: AnalyticsService.calcTrend(
          Number(monthly?.thisMonthDocs ?? 0),
          Number(monthly?.lastMonthDocs ?? 0),
        ),
        entitiesVsLastMonth: AnalyticsService.calcTrend(
          Number(monthlyEntities?.thisMonthEntities ?? 0),
          Number(monthlyEntities?.lastMonthEntities ?? 0),
        ),
      },
    };
  }

  private async getEntityTypes(userId: string): Promise<EntityTypeStatDto[]> {
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
  }

  private async getComplianceUsage(
    userId: string,
  ): Promise<ComplianceUsageDto[]> {
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
        total > 0 ? Math.round((Number(r.count) / total) * 1000) / 10 : 0;
      return {
        frameworkCode: r.frameworkCode,
        count: Number(r.count),
        percentage: pct,
      };
    });
  }

  private async getProcessingHistory(
    userId: string,
    days: number,
  ): Promise<ProcessingHistoryDto[]> {
    const rows = await this.documentsRepo
      .createQueryBuilder('d')
      .leftJoin('d.piiEntities', 'e')
      .select('DATE(d.createdAt)', 'date')
      .addSelect('COUNT(DISTINCT d.id)', 'documents')
      .addSelect('COUNT(e.id)', 'entities')
      .where('d.userId = :userId', { userId })
      .andWhere('d.createdAt >= DATE_SUB(NOW(), INTERVAL :days DAY)', { days })
      .groupBy('DATE(d.createdAt)')
      .orderBy('DATE(d.createdAt)', 'ASC')
      .getRawMany<{ date: string; documents: string; entities: string }>();

    return rows.map((r) => ({
      date: r.date,
      documents: Number(r.documents),
      entities: Number(r.entities),
    }));
  }

  private async getConfidenceDistribution(
    userId: string,
  ): Promise<ConfidenceRangeDto[]> {
    const ORDER: Record<string, number> = {
      '90-100': 0,
      '80-90': 1,
      '70-80': 2,
      '60-70': 3,
      '<60': 4,
    };

    const rows = await this.piiEntitiesRepo
      .createQueryBuilder('e')
      .innerJoin('e.document', 'd')
      .select(
        `CASE
          WHEN e.score >= 0.9 THEN '90-100'
          WHEN e.score >= 0.8 THEN '80-90'
          WHEN e.score >= 0.7 THEN '70-80'
          WHEN e.score >= 0.6 THEN '60-70'
          ELSE '<60'
        END`,
        'scoreRange',
      )
      .addSelect('COUNT(e.id)', 'count')
      .where('d.userId = :userId', { userId })
      .groupBy('scoreRange')
      .getRawMany<{ scoreRange: string; count: string }>();

    return rows
      .map((r) => ({ range: r.scoreRange, count: Number(r.count) }))
      .sort((a, b) => (ORDER[a.range] ?? 99) - (ORDER[b.range] ?? 99));
  }

  private async getRecentActivity(
    userId: string,
    limit: number,
  ): Promise<RecentActivityDto[]> {
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
  }

  private static calcTrend(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }
}
