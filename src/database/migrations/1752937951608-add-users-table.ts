import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersTable1752937951608 implements MigrationInterface {
    name = 'AddUsersTable1752937951608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(20) NULL, \`address\` varchar(100) NULL, \`role\` enum ('doctor', 'caregiver', 'patient') NOT NULL DEFAULT 'patient', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
    }

}
