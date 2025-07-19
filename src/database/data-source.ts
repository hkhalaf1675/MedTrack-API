import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [process.env.DB_ENTITIES_PATH ?? './dist/modules/*/entities/*.entity.js'],
    migrations: [process.env.DB_MIGRATIONS_PATH ?? './dist/database/migrations/*.js'],
    synchronize: false
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
