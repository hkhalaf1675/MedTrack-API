import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Reminder } from "../../reminders/entities/reminder.entity";

@Entity('Medications')
export class Medication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    dosage?: string;

    @Column({
        type: 'text',
        nullable: true
    })
    instructions?: string;

    @Column({
        type: 'date',
        nullable: true
    })
    startDate?: Date;

    @Column({
        type: 'date',
        nullable: true
    })
    endDate?: Date;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    repeat?: string;

    @Column({
        type: 'json',
        nullable: true
    })
    times?: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.medications, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => Reminder, (reminder) => reminder.medication, { nullable: false, onDelete: 'CASCADE' })
    reminders: Reminder[];
}
