import { Injectable, Logger } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReminderSchedulerService {
    private readonly logger = new Logger('Reminder Generation');

    constructor(
        private readonly reminderService: RemindersService
    ) {}
    
    @Cron('0 1 * * *')
    async handleDailyReminderJob(){
        this.logger.log('Starting reminder generation and Checking old reminders status ...');

        await this.reminderService.checkMissingMedications();
        
        const now = new Date();
        await this.reminderService.generateNextDayReminders(now);

        this.logger.log('Reminders for tomorrow have been generated ...');
    }
}
