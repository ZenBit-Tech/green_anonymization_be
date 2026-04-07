import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'user' })
@Index('IDX_USER_EMAIL', ['email'])
export default class User {
  @PrimaryGeneratedColumn('uuid')
  uuid?: string;

  @Column({ length: 500, unique: true, nullable: false })
  email?: string;

  @Column({ length: 255, nullable: true })
  firstName?: string;

  @Column({ length: 255, nullable: true })
  lastName?: string;

  @Column({ length: 255, nullable: true })
  companyName?: string;
}
