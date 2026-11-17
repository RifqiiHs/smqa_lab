import { SqliteService } from '../database/sqlite.service';
import { UsersService } from '../users/users.service';
import { GameModel } from './game.model';
export declare class GamesService {
    private readonly sqliteService;
    private readonly usersService;
    constructor(sqliteService: SqliteService, usersService: UsersService);
    findAll(): Promise<GameModel[]>;
    findOne(id: number): Promise<GameModel>;
    create(body: any): Promise<GameModel>;
    update(id: number, body: any): Promise<GameModel>;
    delete(id: number, requestUserId: number): Promise<{
        message: string;
    }>;
}
