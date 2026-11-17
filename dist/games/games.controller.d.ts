import { GamesService } from './games.service';
import { GameModel } from './game.model';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    getAllGames(): Promise<GameModel[]>;
    getGameById(id: string): Promise<GameModel>;
    createGame(body: any): Promise<GameModel>;
    updateGame(id: string, body: any): Promise<GameModel>;
    deleteGame(id: string, body: any, queryUserId?: string): Promise<{
        message: string;
    }>;
}
