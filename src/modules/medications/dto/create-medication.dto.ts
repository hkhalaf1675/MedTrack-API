import { Type } from "class-transformer";
import { IsArray, IsDate, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min, ValidateIf } from "class-validator";

export enum MedicationRepeat {
  DAILY = 'daily',
  EVERY_X_DAYS = 'every_x_days',
  WEEKLY = 'weekly',
  SPECIFIC_DAYS = 'specific_days',
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
    times: string[];

    @IsOptional()
    @IsNumber()
    userId?: number;
}
