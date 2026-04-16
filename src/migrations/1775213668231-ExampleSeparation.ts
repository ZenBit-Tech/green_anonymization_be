import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExampleSeparation1775213668231 implements MigrationInterface {
  name = 'ExampleSeparation1775213668231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`uuid\` varchar(36) NOT NULL, \`email\` varchar(500) NOT NULL, \`firstName\` varchar(255) NULL, \`lastName\` varchar(255) NULL, \`companyName\` varchar(255) NULL, INDEX \`IDX_USER_EMAIL\` (\`email\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` DROP COLUMN \`companyName\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` DROP COLUMN \`firstName\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` DROP COLUMN \`lastName\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`example-user\` ADD \`lastName\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` ADD \`firstName\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`example-user\` ADD \`companyName\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_USER_EMAIL\` ON \`user\``);
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
