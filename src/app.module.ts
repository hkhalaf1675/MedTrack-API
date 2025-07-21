import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MedicationModule } from './modules/medications/medications.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ReminderSchedulerService } from './modules/reminders/reminder-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwt.secret'),
          signOptions: {
            expiresIn: configService.get<string>('jwt.expiresIn')
          }
        }
      }
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    MedicationModule,
    RemindersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
