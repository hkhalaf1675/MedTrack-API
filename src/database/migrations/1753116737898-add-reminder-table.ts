import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReminderTable1753116737898 implements MigrationInterface {
    name = 'AddReminderTable1753116737898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Reminders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`medicationId\` int NOT NULL, \`date\` date NOT NULL, \`time\` varchar(50) NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`takenAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Reminders\` ADD CONSTRAINT \`FK_609d74ea1450641b5b11f2e8acd\` FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reminders\` ADD CONSTRAINT \`FK_cec8af30a84c696a5ceb153730c\` FOREIGN KEY (\`medicationId\`) REFERENCES \`Medications\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Reminders\` DROP FOREIGN KEY \`FK_cec8af30a84c696a5ceb153730c\``);
        await queryRunner.query(`ALTER TABLE \`Reminders\` DROP FOREIGN KEY \`FK_609d74ea1450641b5b11f2e8acd\``);
        await queryRunner.query(`DROP TABLE \`Reminders\``);
    }

}