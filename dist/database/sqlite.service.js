"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteService = void 0;
const common_1 = require("@nestjs/common");
const sqlite3 = __importStar(require("sqlite3"));
const path = __importStar(require("path"));
let SqliteService = class SqliteService {
    db;
    async onModuleInit() {
        const dbPath = path.resolve(process.cwd(), 'boonese-gamestore.sqlite');
        this.db = new (sqlite3.verbose().Database)(dbPath);
        await this.initTables();
        await this.seedData();
    }
    onModuleDestroy() {
        if (this.db) {
            this.db.close();
        }
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async initTables() {
        await this.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS game_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        key_code TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(game_id) REFERENCES games(id)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        game_key_id INTEGER NOT NULL,
        price INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(game_id) REFERENCES games(id),
        FOREIGN KEY(game_key_id) REFERENCES game_keys(id)
      );
    `);
    }
    async seedData() {
        const userCount = await this.get('SELECT COUNT(*) as count FROM users');
        if (userCount && userCount.count === 0) {
            await this.run('INSERT INTO users (id, username, email, role) VALUES (1, ?, ?, ?)', ['admin', 'admin@boonese.com', 'ADMIN']);
            await this.run('INSERT INTO users (id, username, email, role) VALUES (2, ?, ?, ?)', ['user1', 'user1@boonese.com', 'USER']);
            await this.run('INSERT INTO users (id, username, email, role) VALUES (3, ?, ?, ?)', ['user2', 'user2@boonese.com', 'USER']);
        }
        const gameCount = await this.get('SELECT COUNT(*) as count FROM games');
        if (gameCount && gameCount.count === 0) {
            const initialGames = [
                { id: 1, name: 'Grand Theft Auto VI', description: 'Action-adventure game set in the open world state of Leonida.', price: 799000, keyPrefix: 'GTA06' },
                { id: 2, name: 'Monster Hunter Wilds', description: 'Hunting action RPG with dynamic environments and dangerous monsters.', price: 699000, keyPrefix: 'MHWLD' },
                { id: 3, name: 'Elden Ring: Nightreign', description: 'Co-op action RPG expansion in the Lands Between.', price: 599000, keyPrefix: 'ERNTR' },
                { id: 4, name: 'Kingdom Come: Deliverance II', description: 'Story-driven action RPG set in 15th Century Bohemia.', price: 649000, keyPrefix: 'KCD02' },
                { id: 5, name: 'Clair Obscur: Expedition 33', description: 'Turn-based RPG featuring real-time mechanics and painterly visuals.', price: 549000, keyPrefix: 'COE33' },
                { id: 6, name: "Assassin's Creed Shadows", description: 'Stealth action RPG set in feudal Japan featuring Naoe and Yasuke.', price: 699000, keyPrefix: 'ACSDW' },
                { id: 7, name: "Baldur's Gate 3", description: 'Award-winning story-rich RPG set in the Dungeons & Dragons universe.', price: 699000, keyPrefix: 'BG300' },
                { id: 8, name: 'Cyberpunk 2077 Ultimate Edition', description: 'Open-world action adventure featuring the complete Night City story.', price: 749000, keyPrefix: 'CP207' },
                { id: 9, name: 'Hogwarts Legacy', description: 'Immersive open-world action RPG set in the 1800s Wizarding World.', price: 599000, keyPrefix: 'HWLGC' },
                { id: 10, name: 'Red Dead Redemption 2', description: 'Epic tale of honor and loyalty at the dawn of the modern age.', price: 499000, keyPrefix: 'RDR02' }
            ];
            for (const g of initialGames) {
                await this.run('INSERT INTO games (id, name, description, price) VALUES (?, ?, ?, ?)', [g.id, g.name, g.description, g.price]);
                for (let k = 1; k <= 3; k++) {
                    const keyCode = `${g.keyPrefix}-KEY0${k}-AAAAA-BBBBB-C000${k}`;
                    await this.run('INSERT INTO game_keys (game_id, key_code, status) VALUES (?, ?, ?)', [g.id, keyCode, 'AVAILABLE']);
                }
            }
        }
    }
};
exports.SqliteService = SqliteService;
exports.SqliteService = SqliteService = __decorate([
    (0, common_1.Injectable)()
], SqliteService);
//# sourceMappingURL=sqlite.service.js.map