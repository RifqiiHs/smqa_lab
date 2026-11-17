import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class SqliteService implements OnModuleInit, OnModuleDestroy {
    private db;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    run(sql: string, params?: any[]): Promise<{
        lastID: number;
        changes: number;
    }>;
    get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
    all<T = any>(sql: string, params?: any[]): Promise<T[]>;
    exec(sql: string): Promise<void>;
    private initTables;
    private seedData;
}
