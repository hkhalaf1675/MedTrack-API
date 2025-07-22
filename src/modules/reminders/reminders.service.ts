import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from '../medications/entities/medication.entity';
import { Equal, IsNull, LessThan, MoreThan, MoreThanOrEqual, Or, Raw, Repository } from 'typeorm';
import { Reminder, ReminderStatus } from './entities/reminder.entity';
import { User } from '../users/entities/user.entity';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { MedicationRepeat } from '../medications/dto/create-medication.dto';
import { buildFailResponse, buildPaginationResponse, buildSuccessResponse } from '../../common/utils/api-response';
import { IReminderQuery } from './interfaces/reminder-query.interface';
import { ErrorMessages } from '../../common/constants/error-messages';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async findAll(query: IReminderQuery, user: User) {
    const { total, page, perPage, reminders } = await this.getMany(query, user, false);

    return buildPaginationResponse(total, page, perPage, reminders);
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
      throw new NotFoundException(buildFailResponse(404, [ErrorMessages.REMINDER.NOT_FOUND]));
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

  async findTodays(query: IReminderQuery, user: User) {
    query.page = query.page ?? 1;
    query.perPage = query.perPage ?? 100;

    const cacheKey = `reminders:today:user:${user.id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if(cached){
      return cached;
    }

    const { total, page, perPage, reminders } = await this.getMany({page: query.page, perPage: query.perPage}, user, true);

    const response = buildPaginationResponse(total, page, perPage, reminders);

    await this.cacheManager.set(cacheKey, JSON.stringify(response), 60 * 60 * 12);

    return response;
  }

  async generateNextDayReminders(date: Date) {
    const reminderDate = startOfDay(date);
    let reminderArr: Reminder[] = [];

    const medications = await this.medicationRepository.find({
      relations: { user: true },
      where: {
        endDate: Or(IsNull(), MoreThanOrEqual(reminderDate))
      }
    });

    for (const medication of medications) {
      const shouldCreate = await this.shouldGenerateReminder(medication);
      if(shouldCreate){
        reminderArr.push(...this.createRemindersForMedication(medication, medication.userId, reminderDate));
      }
    }

    await this.reminderRepository.save(reminderArr);
  }

  async checkMissingMedications() {
    const today = startOfDay(new Date());
    const reminders = await this.reminderRepository.find({
      where: {
        status: ReminderStatus.PENDING,
        date: LessThan(today)
      }
    });

    reminders.forEach(reminder => reminder.status = ReminderStatus.MISSED);
    await this.reminderRepository.save(reminders);
  }

  async findRemindersAtSpecificTime(date: Date): Promise<Reminder[]>{
    const dateTime = format(date, 'HH:mm');
    const dateFormated = new Date(date.setHours(0, 0, 0, 0));

    const reminders = await this.reminderRepository.find({
      where: {
        date: dateFormated,
        time: Equal(dateTime),
        status: ReminderStatus.PENDING
      },
      relations: {
        user: true,
        medication: true
      }
    });

    return reminders;
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

  private async getMany(query: IReminderQuery, user: User, today: boolean = true) {
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

    if(today){
      const today = startOfDay(new Date());
      queryBuilder.andWhere('reminder.date = :date', { date: today });
    }
    else if(date){
      queryBuilder.andWhere('reminder.date = :date', { date });
    }

    queryBuilder.leftJoinAndSelect('reminder.medication', 'medication');
    queryBuilder.skip((page - 1) * perPage).take(perPage);
    queryBuilder.orderBy('reminder.id', 'DESC');

    const [reminders, total] = await queryBuilder.getManyAndCount();

    return { reminders, total, page, perPage };
  }
}