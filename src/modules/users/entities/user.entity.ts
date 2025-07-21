import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Medication } from "../../medications/entities/medication.entity";
import { Reminder } from "../../reminders/entities/reminder.entity";

export enum UserRole {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
}

@Entity('Users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 100
    })
    name?: string;

    @Column({
        type: 'varchar',
        nullable: false,
        unique: true,
        length: 100
    })
    email: string;

    @Column({
        type: 'varchar',
        nullable: false,
        length: 255,
        select: false
    })
    password: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 20
    })
    phone?: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 100
    })
    address?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.PATIENT
    })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Medication, (medication) => medication.user, { nullable: false, onDelete: 'CASCADE' })
    medications: Medication[];

    @OneToMany(() => Reminder, (reminder) => reminder.user, { nullable: false, onDelete: 'CASCADE' })
    reminders: Reminder[];
}