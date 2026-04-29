import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Confidence, EntityType } from '@common/constants';
// this is literally how 1:n relations are done in typeorm docs;
// if that is not correct idk what is
// and so, eslint can be ignored here
// eslint-disable-next-line import/no-cycle
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
