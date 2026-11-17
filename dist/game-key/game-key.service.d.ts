import { SqliteService } from '../database/sqlite.service';
import { UsersService } from '../users/users.service';
import { GameKeyModel } from './game-key.model';
export declare class GameKeyService {
    private readonly sqliteService;
    private readonly usersService;
    constructor(sqliteService: SqliteService, usersService: UsersService);
    createGameKey(body: any): Promise<GameKeyModel>;
    getKeyById(id: number): Promise<GameKeyModel>;
    findAvailableKeyForGame(gameId: number): Promise<GameKeyModel | undefined>;
    countAvailableKeys(gameId: number): Promise<number>;
    markKeyAsSold(keyId: number): Promise<void>;
}
