import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from '../medications/entities/medication.entity';
import { IsNull, LessThan, MoreThan, Or, Repository } from 'typeorm';
import { Reminder, ReminderStatus } from './entities/reminder.entity';
import { User } from '../users/entities/user.entity';
import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { MedicationRepeat } from '../medications/dto/create-medication.dto';
import { buildFailResponse, buildPaginationResponse, buildSuccessResponse } from '../../common/utils/api-response';
import { IReminderQuery } from './interfaces/reminder-query.interface';
import { ErrorMessages } from '../../common/constants/error-messages';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>
  ) {}

  async findAll(query: IReminderQuery, user: User) {
    let { page = 1, perPage = 10, medicationId, userId, date } = query;

    const queryBuilder = this.reminderRepository.createQueryBuilder('reminder');

    if(userId){
      queryBuilder.where('reminder.userId = :userId', { userId });
      queryBuilder.leftJoinAndSelect('reminder.user', 'user');
    }
    else{
      queryBuilder.where('reminder.userId = :userId', { userId: user.id });
    }

    if(medicationId){
      queryBuilder.andWhere('reminder.medicationId = :medicationId', { medicationId });
    }

    if(date){
      queryBuilder.andWhere('reminder.date = :date', { date });
    }

    queryBuilder.skip((page - 1) * perPage).take(perPage);
    queryBuilder.orderBy('reminder.id', 'DESC');

    const [reminders, total] = await queryBuilder.getManyAndCount();

    return buildPaginationResponse(total, page, perPage, reminders );
  }

  async findOne(id: number) {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['user', 'medication']
    });

    return buildSuccessResponse('reminder fetched successfully', { reminder });
  }

  async updateStatus(id: number, user: User){
    const reminder = await this.reminderRepository.findOneBy({ id });

    if(!reminder){
      throw new NotFoundException(buildFailResponse(404, [ErrorMessages.REMINDER.NOT_FOUNT]));
    }

    if(reminder.userId !== user.id){
      throw new UnauthorizedException(buildFailResponse(401, [ErrorMessages.AUTH.UNAUTHORIZED]));
    }

    if(reminder.status == ReminderStatus.TAKEN){
      throw new BadRequestException(buildFailResponse(400, [ErrorMessages.REMINDER.ALREADY_TAKEN]));
    }

    reminder.status = ReminderStatus.TAKEN;
    reminder.takenAt = new Date();

    await this.reminderRepository.save(reminder);

    return buildSuccessResponse('Reminder status has been changed successfully', {});
  }

  async generateNextDayReminders() {
    const currentDate = new Date();
    const tomorrow = startOfDay(addDays(currentDate, 1));
    let reminderArr: Reminder[] = [];

    const medications = await this.medicationRepository.find({
      relations: { user: true },
      where: {
        endDate: Or(IsNull(), MoreThan(currentDate))
      }
    });

    for (const medication of medications) {
      const shouldCreate = await this.shouldGenerateReminder(medication);
      if(shouldCreate){
        reminderArr.push(...this.createRemindersForMedication(medication, medication.userId, tomorrow));
      }
    }

    await this.reminderRepository.save(reminderArr);
  }

  async checkMissingMedications() {
    const today = new Date();
    const reminders = await this.reminderRepository.find({
      where: {
        status: ReminderStatus.PENDING,
        date: LessThan(today)
      }
    });

    reminders.forEach(reminder => reminder.status = ReminderStatus.MISSED);
    await this.reminderRepository.save(reminders);
  }

  private async shouldGenerateReminder(medication: Medication): Promise<boolean> {
    if(medication.repeat === MedicationRepeat.DAILY){
      return true;
    }
    
    const lastMedicationReminder = await this.reminderRepository.findOne({
      where: { medicationId: medication.id },
      order: { createdAt: 'DESC' }
    });

    if(!lastMedicationReminder){
      return true;
    }

    const interval = this.getRepeatInterval(medication.repeat);

    return differenceInDays(new Date(), lastMedicationReminder.createdAt) >= interval;
  }

  private getRepeatInterval(repeat: string | undefined): number {
    if(repeat == MedicationRepeat.WEEKLY){
      return 7;
    }

    const match = repeat?.match(/every_(\d+)_days/);

    return match ? parseInt(match[1], 10) : 1;
  }

  private createRemindersForMedication(medication: Medication, userId: number, date: Date): Reminder[]{
    const reminders = (medication.times || []).map(time => {
      return this.reminderRepository.create({
        medicationId: medication.id,
        date,
        userId,
        time
      });
    });

    return reminders;
  }
}