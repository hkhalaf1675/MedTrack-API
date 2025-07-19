import { UserRole } from "../entities/user.entity";

export interface IUserQuery {
    page?: number;
    perPage?: number;
    role?: UserRole;
    name?: string;
}