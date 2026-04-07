import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'example-user' })
@Index('IDX_USER_EMAIL', ['email'])
export default class ExampleUser {
  @PrimaryGeneratedColumn('uuid')
  uuid?: string;

  @Column({ length: 500, unique: true, nullable: false })
  email?: string;
}
