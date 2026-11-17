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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const sqlite_service_1 = require("../database/sqlite.service");
let UsersService = class UsersService {
    sqliteService;
    constructor(sqliteService) {
        this.sqliteService = sqliteService;
    }
    async findById(id) {
        const user = await this.sqliteService.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async validateAdmin(requestUserId) {
        if (!requestUserId) {
            throw new common_1.ForbiddenException('requestUserId is required for admin actions');
        }
        const user = await this.sqliteService.get('SELECT * FROM users WHERE id = ?', [requestUserId]);
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Admin role required.');
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sqlite_service_1.SqliteService])
], UsersService);
//# sourceMappingURL=users.service.js.map