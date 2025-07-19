import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
}

@Entity({
    name: 'Users'
})
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
}