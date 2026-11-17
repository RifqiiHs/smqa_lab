import { GameKeyService } from './game-key.service';
import { GameKeyModel } from './game-key.model';
export declare class GameKeyController {
    private readonly gameKeyService;
    constructor(gameKeyService: GameKeyService);
    createKey(body: any): Promise<GameKeyModel>;
}
