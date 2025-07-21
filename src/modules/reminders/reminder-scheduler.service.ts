import { Injectable, Logger } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReminderSchedulerService {
    private readonly logger = new Logger('Reminder Generation');

    constructor(
        private readonly reminderService: RemindersService
    ) {}
    
    @Cron('0 0 * * *')
    async handleDailyReminderJob(){
        this.logger.log('Starting reminder generation and Checking old reminders status ...');

        await this.reminderService.generateNextDayReminders();

        await this.reminderService.checkMissingMedications();

        this.logger.log('Reminders for tomorrow have been generated ...');
    }
}
