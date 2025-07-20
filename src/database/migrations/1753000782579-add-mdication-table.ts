import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMdicationTable1753000782579 implements MigrationInterface {
    name = 'AddMdicationTable1753000782579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Medications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`dosage\` varchar(100) NULL, \`instructions\` text NULL, \`startDate\` date NULL, \`endDate\` date NULL, \`repeat\` varchar(100) NULL, \`times\` json NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Medications\` ADD CONSTRAINT \`FK_80dbf82fdd1596e75405de7291c\` FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Medications\` DROP FOREIGN KEY \`FK_80dbf82fdd1596e75405de7291c\``);
        await queryRunner.query(`DROP TABLE \`Medications\``);
    }

}
