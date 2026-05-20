import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'user' })
@Index('IDX_USER_EMAIL', ['email'])
export default class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string = '';

  @Column({ length: 500, unique: true })
  email: string = '';

  @Column({ length: 255 })
  firstName: string = '';

  @Column({ length: 255 })
  lastName: string = '';

  @Column({ length: 255 })
  companyName: string = '';

  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultFramework?: string;

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone: string = 'UTC';

  @Column({ type: 'json', nullable: true })
  workflowTour?: {
    skipped: boolean;
    dashboard: boolean;
    deidentification: boolean;
    results: boolean;
    synthetic: boolean;
  };
}
