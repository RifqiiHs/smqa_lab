import { SqliteService } from '../database/sqlite.service';
import { UserModel } from './user.model';
export declare class UsersService {
    private readonly sqliteService;
    constructor(sqliteService: SqliteService);
    findById(id: number): Promise<UserModel>;
    validateAdmin(requestUserId: number): Promise<UserModel>;
}
