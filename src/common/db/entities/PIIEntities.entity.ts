import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Confidence, PIIEntityType } from '@common/constants';
// eslint-disable-next-line import/no-cycle
import Documents from './documents.entity';

@Entity({ name: 'PIIEntities' })
export default class PIIEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_PIIENTITIES_DOCUMENT_ID')
  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Documents, (document) => document.piiEntities, {
    onDelete: 'CASCADE',
  })
  document: Documents;

  @Column({ type: 'enum', enum: PIIEntityType })
  entityType: PIIEntityType;

  @Column({ type: 'int' })
  start: number;

  @Column({ type: 'int' })
  end: number;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'enum', enum: Confidence })
  confidence: Confidence;

  @Column({ type: 'varchar', length: 20, nullable: true })
  deIdMethod: string | null = null;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
