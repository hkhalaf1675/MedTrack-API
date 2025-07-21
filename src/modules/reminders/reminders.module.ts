import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './entities/reminder.entity';
import { Medication } from '../medications/entities/medication.entity';
import { ReminderSchedulerService } from './reminder-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, Medication])
  ],
  controllers: [RemindersController],
  providers: [RemindersService, ReminderSchedulerService],
  exports: [RemindersService]
})
export class RemindersModule {}
