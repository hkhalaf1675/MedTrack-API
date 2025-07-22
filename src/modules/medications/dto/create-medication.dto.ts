import { Type } from "class-transformer";
import { IsArray, IsDate, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, Matches, MaxLength, Min, ValidateIf } from "class-validator";

export enum MedicationRepeat {
  DAILY = 'daily',
  EVERY_X_DAYS = 'every_x_days',
  WEEKLY = 'weekly'
}

export class CreateMedicationDto {
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsNotEmpty()
    @MaxLength(100)
    dosage: string;

    @IsOptional()
    instructions?: string;

    @IsDefined()
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @IsDefined()
    @IsEnum(MedicationRepeat)
    repeat: MedicationRepeat;

    @ValidateIf(med => med.repeat === MedicationRepeat.EVERY_X_DAYS)
    @IsDefined()
    @IsNumber()
    @Min(1)
    interval?: number;

    @IsDefined()
    @IsNotEmpty({ each: true })
    @IsArray()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      each: true,
      message: 'Each time must be in HH:mm format (e.g., "22:00")'
    })
    times: string[];

    @IsOptional()
    @IsNumber()
    userId?: number;
}
