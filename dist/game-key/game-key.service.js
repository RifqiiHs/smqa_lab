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
exports.GameKeyService = void 0;
const common_1 = require("@nestjs/common");
const sqlite_service_1 = require("../database/sqlite.service");
const users_service_1 = require("../users/users.service");
let GameKeyService = class GameKeyService {
    sqliteService;
    usersService;
    constructor(sqliteService, usersService) {
        this.sqliteService = sqliteService;
        this.usersService = usersService;
    }
    async createGameKey(body) {
        if (!body || !body.requestUserId) {
            throw new common_1.BadRequestException('requestUserId is required');
        }
        await this.usersService.validateAdmin(body.requestUserId);
        if (!body.gameId || typeof body.gameId !== 'number') {
            throw new common_1.BadRequestException('Valid gameId is required');
        }
        if (!body.keyCode || typeof body.keyCode !== 'string' || body.keyCode.trim() === '') {
            throw new common_1.BadRequestException('keyCode is required');
        }
        const game = await this.sqliteService.get('SELECT id FROM games WHERE id = ?', [body.gameId]);
        if (!game) {
            throw new common_1.NotFoundException(`Game with ID ${body.gameId} not found`);
        }
        const keyCode = body.keyCode.trim();
        const existingKey = await this.sqliteService.get('SELECT id FROM game_keys WHERE key_code = ?', [keyCode]);
        if (existingKey) {
            throw new common_1.ConflictException(`Game key code '${keyCode}' already exists`);
        }
        const result = await this.sqliteService.run('INSERT INTO game_keys (game_id, key_code, status) VALUES (?, ?, ?)', [body.gameId, keyCode, 'AVAILABLE']);
        return this.getKeyById(result.lastID);
    }
    async getKeyById(id) {
        const key = await this.sqliteService.get('SELECT * FROM game_keys WHERE id = ?', [id]);
        if (!key) {
            throw new common_1.NotFoundException(`Game key with ID ${id} not found`);
        }
        return key;
    }
    async findAvailableKeyForGame(gameId) {
        return this.sqliteService.get('SELECT * FROM game_keys WHERE game_id = ? AND status = ? LIMIT 1', [gameId, 'AVAILABLE']);
    }
    async countAvailableKeys(gameId) {
        const res = await this.sqliteService.get('SELECT COUNT(*) as count FROM game_keys WHERE game_id = ? AND status = ?', [gameId, 'AVAILABLE']);
        return res ? res.count : 0;
    }
    async markKeyAsSold(keyId) {
        await this.sqliteService.run('UPDATE game_keys SET status = ? WHERE id = ?', ['SOLD', keyId]);
    }
};
exports.GameKeyService = GameKeyService;
exports.GameKeyService = GameKeyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sqlite_service_1.SqliteService,
        users_service_1.UsersService])
], GameKeyService);
//# sourceMappingURL=game-key.service.js.map