import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import ExampleUser from './entities/example.user.entity';
import ComplianceSelection from './entities/compliance-selection.entity';
import User from './entities/user.entity';

config();
const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.getOrThrow<string>('DB_HOST'),
  port: configService.getOrThrow<number>('DB_PORT'),
  username: configService.getOrThrow<string>('DB_USERNAME'),
  password: configService.getOrThrow<string>('DB_PASSWORD'),
  database: configService.getOrThrow<string>('DB_NAME'),
  entities: [ExampleUser, ComplianceSelection, User],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
