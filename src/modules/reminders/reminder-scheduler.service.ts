import { Injectable, Logger } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { Cron } from '@nestjs/schedule';
import { ReminderGateway } from './reminder.gateway';

@Injectable()
export class ReminderSchedulerService {
    private readonly logger = new Logger('Reminder Generation');

    constructor(
        private readonly reminderService: RemindersService,
        private readonly reminderGateway: ReminderGateway
    ) {}
    
    @Cron('52 18 * * *')
    async handleDailyReminderJob(){
        this.logger.log('Starting reminder generation and Checking old reminders status ..............');

        await this.reminderService.checkMissingMedications();
        
        const now = new Date();
        await this.reminderService.generateNextDayReminders(now);

        this.logger.log('Reminders for tomorrow have been generated .......................');
    }

    @Cron('* * * * *')
    async handleReminderNotifications() {
        this.logger.log('Stating at sending notifications ...........')
        const now = new Date();

        const reminders = await this.reminderService.findRemindersAtSpecificTime(now);

        for (const reminder of reminders) {
            this.reminderGateway.sendReminderToUser(reminder.userId, reminder);
            this.logger.log(`Send medication reminder to user: ${reminder.userId} ...........`);
        }
    }
}
