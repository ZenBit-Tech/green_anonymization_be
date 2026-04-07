import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountInfo1775178109176 implements MigrationInterface {
  name = 'AccountInfo1775178109176';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`example-user\` ADD \`firstName\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` ADD \`lastName\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` ADD \`companyName\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`example-user\` DROP COLUMN \`companyName\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` DROP COLUMN \`lastName\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` DROP COLUMN \`firstName\``,
    );
  }
}
