import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Confidence, EntityType } from '@common/constants';
import Documents from './documents.entity';

@Entity({ name: 'entities' })
export default class Entities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Documents, (document) => document.entities, {
    onDelete: 'CASCADE',
  })
  document: Documents;

  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column({ type: 'int' })
  posStart: number;

  @Column({ type: 'int' })
  posEnd: number;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'enum', enum: Confidence })
  confidence: Confidence;

  @CreateDateColumn()
  createdAt: Date;
}
