import { SqliteService } from '../database/sqlite.service';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { GameKeyService } from '../game-key/game-key.service';
export declare class TransactionsService {
    private readonly sqliteService;
    private readonly usersService;
    private readonly gamesService;
    private readonly gameKeyService;
    constructor(sqliteService: SqliteService, usersService: UsersService, gamesService: GamesService, gameKeyService: GameKeyService);
    purchase(body: any): Promise<{
        transactionId: number;
        game: string;
        keyCode: string;
    }>;
    getTransactionsByUserId(userId: number): Promise<any[]>;
}
