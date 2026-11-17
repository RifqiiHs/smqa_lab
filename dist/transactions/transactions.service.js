"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const sqlite_service_1 = require("../database/sqlite.service");
const users_service_1 = require("../users/users.service");
const games_service_1 = require("../games/games.service");
const game_key_service_1 = require("../game-key/game-key.service");
let TransactionsService = class TransactionsService {
    sqliteService;
    usersService;
    gamesService;
    gameKeyService;
    constructor(sqliteService, usersService, gamesService, gameKeyService) {
        this.sqliteService = sqliteService;
        this.usersService = usersService;
        this.gamesService = gamesService;
        this.gameKeyService = gameKeyService;
    }
    async purchase(body) {
        if (!body || !body.userId || typeof body.userId !== 'number') {
            throw new common_1.BadRequestException('Valid userId is required');
        }
        if (!body.gameId || typeof body.gameId !== 'number') {
            throw new common_1.BadRequestException('Valid gameId is required');
        }
        await this.usersService.findById(body.userId);
        const game = await this.gamesService.findOne(body.gameId);
        await this.sqliteService.exec('BEGIN TRANSACTION');
        try {
            const availableKey = await this.gameKeyService.findAvailableKeyForGame(body.gameId);
            if (!availableKey) {
                throw new common_1.BadRequestException('No available game keys remaining for this game');
            }
            const createdAt = new Date().toISOString();
            const txResult = await this.sqliteService.run(`INSERT INTO transactions
        (user_id, game_id, game_key_id, price, created_at)
        VALUES (?, ?, ?, ?, ?)`, [
                body.userId,
                body.gameId,
                availableKey.id,
                game.price,
                createdAt,
            ]);
            const transactionId = txResult.lastID;
            await this.gameKeyService.markKeyAsSold(availableKey.id);
            await this.sqliteService.exec('COMMIT');
            return {
                transactionId,
                game: game.name,
                keyCode: availableKey.key_code,
            };
        }
        catch (err) {
            try {
                await this.sqliteService.exec('ROLLBACK');
            }
            catch {
            }
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException(`Purchase transaction failed: ${err.message}`);
        }
    }
    async getTransactionsByUserId(userId) {
        await this.usersService.findById(userId);
        const rows = await this.sqliteService.all(`
      SELECT
        t.id as transaction_id,
        t.user_id,
        t.price,
        t.created_at,
        g.id as game_id,
        g.name as game_name,
        g.description as game_description,
        k.id as key_id,
        k.key_code
      FROM transactions t
      JOIN games g ON t.game_id = g.id
      JOIN game_keys k ON t.game_key_id = k.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      `, [userId]);
        return rows.map((r) => ({
            transactionId: r.transaction_id,
            userId: r.user_id,
            price: r.price,
            createdAt: r.created_at,
            game: {
                id: r.game_id,
                name: r.game_name,
                description: r.game_description,
            },
            key: {
                id: r.key_id,
                keyCode: r.key_code,
            },
        }));
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sqlite_service_1.SqliteService,
        users_service_1.UsersService,
        games_service_1.GamesService,
        game_key_service_1.GameKeyService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map