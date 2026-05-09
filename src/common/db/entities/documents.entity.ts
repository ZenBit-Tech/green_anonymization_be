import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Compliance } from '@common/constants';
// eslint-disable-next-line import/no-cycle
import PIIEntities from './PIIEntities.entity';

@Entity({ name: 'documents' })
export default class Documents {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('IDX_DOCUMENTS_USER_ID')
  @Column({ type: 'uuid' })
  userId: string = '';

  @Column({ type: 'enum', enum: Compliance })
  chosenCompliance!: Compliance;

  @Column({ type: 'varchar', length: 50 })
  frameworkCode: string = '';

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileType?: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string = '';

  @Column({ type: 'varchar', length: 1024 })
  filePath: string = '';

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date = new Date();

  @OneToMany(() => PIIEntities, (entity) => entity.document)
  piiEntities!: PIIEntities[];
}
