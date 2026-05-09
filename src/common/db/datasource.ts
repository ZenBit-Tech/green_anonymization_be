import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import ContactMessage from './entities/contactMessage.entity';
import ComplianceSelection from './entities/compliance-selection.entity';
import User from './entities/user.entity';
import Documents from './entities/documents.entity';
import PIIEntities from './entities/PIIEntities.entity';

config();
const configService = new ConfigService();

function getDatabaseConfig() {
  const jawsdbUrl = configService.get<string>('JAWSDB_URL');

  if (jawsdbUrl) {
    const url = new URL(jawsdbUrl);
    return {
      type: 'mysql' as const,
      host: url.hostname,
      port: parseInt(url.port, 10) || 3306,
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    };
  }

  return {
    type: 'mysql' as const,
    host: configService.getOrThrow<string>('DB_HOST'),
    port: configService.getOrThrow<number>('DB_PORT'),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
  };
}

const dbConfig = getDatabaseConfig();

export const dataSourceOptions: DataSourceOptions = {
  ...dbConfig,
  entities: [User, ComplianceSelection, ContactMessage, Documents, PIIEntities],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
