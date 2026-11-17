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
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const sqlite_service_1 = require("../database/sqlite.service");
const users_service_1 = require("../users/users.service");
let GamesService = class GamesService {
    sqliteService;
    usersService;
    constructor(sqliteService, usersService) {
        this.sqliteService = sqliteService;
        this.usersService = usersService;
    }
    async findAll() {
        const games = await this.sqliteService.all(`
      SELECT g.*, COALESCE(k.availableStock, 0) as availableStock
      FROM games g
      LEFT JOIN (
        SELECT game_id, COUNT(*) as availableStock
        FROM game_keys
        WHERE status = 'AVAILABLE'
        GROUP BY game_id
      ) k ON g.id = k.game_id
      ORDER BY g.id ASC
    `);
        return games.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            price: g.price,
            availableStock: Number(g.availableStock),
        }));
    }
    async findOne(id) {
        const game = await this.sqliteService.get(`
      SELECT g.*, COALESCE(k.availableStock, 0) as availableStock
      FROM games g
      LEFT JOIN (
        SELECT game_id, COUNT(*) as availableStock
        FROM game_keys
        WHERE status = 'AVAILABLE' AND game_id = ?
      ) k ON g.id = k.game_id
      WHERE g.id = ?
    `, [id, id]);
        if (!game) {
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        return {
            id: game.id,
            name: game.name,
            description: game.description,
            price: game.price,
            availableStock: Number(game.availableStock),
        };
    }
    async create(body) {
        if (!body || !body.requestUserId) {
            throw new common_1.BadRequestException('requestUserId is required');
        }
        await this.usersService.validateAdmin(body.requestUserId);
        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            throw new common_1.BadRequestException('Game name is required');
        }
        if (!body.description || typeof body.description !== 'string') {
            throw new common_1.BadRequestException('Game description is required');
        }
        if (body.price === undefined || body.price === null || typeof body.price !== 'number' || body.price < 0) {
            throw new common_1.BadRequestException('Valid game price is required');
        }
        const result = await this.sqliteService.run('INSERT INTO games (name, description, price) VALUES (?, ?, ?)', [body.name.trim(), body.description.trim(), body.price]);
        return this.findOne(result.lastID);
    }
    async update(id, body) {
        if (!body || !body.requestUserId) {
            throw new common_1.BadRequestException('requestUserId is required');
        }
        await this.usersService.validateAdmin(body.requestUserId);
        const existing = await this.sqliteService.get('SELECT * FROM games WHERE id = ?', [id]);
        if (!existing) {
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        const name = body.name !== undefined ? body.name : existing.name;
        const description = body.description !== undefined ? body.description : existing.description;
        const price = body.price !== undefined ? body.price : existing.price;
        await this.sqliteService.run('UPDATE games SET name = ?, description = ?, price = ? WHERE id = ?', [name, description, price, id]);
        return this.findOne(id);
    }
    async delete(id, requestUserId) {
        if (!requestUserId) {
            throw new common_1.BadRequestException('requestUserId is required');
        }
        await this.usersService.validateAdmin(requestUserId);
        const existing = await this.sqliteService.get('SELECT * FROM games WHERE id = ?', [id]);
        if (!existing) {
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        const txCount = await this.sqliteService.get('SELECT COUNT(*) as count FROM transactions WHERE game_id = ?', [id]);
        const soldCount = await this.sqliteService.get('SELECT COUNT(*) as count FROM game_keys WHERE game_id = ? AND status = ?', [id, 'SOLD']);
        if ((txCount && txCount.count > 0) ||
            (soldCount && soldCount.count > 0)) {
            throw new common_1.BadRequestException('Cannot delete game with existing transactions or sold keys');
        }
        await this.sqliteService.run('DELETE FROM game_keys WHERE game_id = ?', [id]);
        await this.sqliteService.run('DELETE FROM games WHERE id = ?', [id]);
        return { message: `Game with ID ${id} has been deleted successfully` };
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sqlite_service_1.SqliteService,
        users_service_1.UsersService])
], GamesService);
//# sourceMappingURL=games.service.js.map