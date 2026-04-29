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
import Entities from './entities.entity';

@Entity({ name: 'documents' })
export default class Documents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: Compliance })
  chosenCompliance: Compliance;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileType?: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 1024 })
  filePath: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Entities, (entity) => entity.document)
  entities: Entities[];
}
