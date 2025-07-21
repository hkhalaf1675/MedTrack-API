import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Medication } from "../../medications/entities/medication.entity";

export enum ReminderStatus {
    PENDING = 'pending',
    TAKEN = 'taken',
    MISSED = 'missed'
}

@Entity('Reminders')
export class Reminder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    medicationId: number;

    @Column({
        type: 'date',
        nullable: false
    })
    date: Date;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false
    })
    time: string;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false,
        default: ReminderStatus.PENDING
    })
    status: string;

    @Column({
        type: 'timestamp',
        nullable: true
    })
    takenAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.reminders, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Medication, (medication) => medication.reminders, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'medicationId' })
    medication: Medication;
}
