
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { SqliteService } from '../src/database/sqlite.service';

describe('Transactions E2E', () => {
  let app: INestApplication;
  let sqliteService: SqliteService;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    sqliteService =
      moduleFixture.get<SqliteService>(SqliteService);
  });

  beforeEach(async () => {
    // Reset database state before each test
    await sqliteService.run('DELETE FROM transactions');
    await sqliteService.run(
      "UPDATE game_keys SET status = 'AVAILABLE'",
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // TEST 1: Successful purchase
  it('should successfully purchase a game', async () => {
    const response = await request(app.getHttpServer())
      .post('/transactions/purchase')
      .send({
        userId: 2,
        gameId: 1,
      })
      .expect(201);

    expect(response.body).toHaveProperty('transactionId');
    expect(response.body).toHaveProperty('game');
    expect(response.body).toHaveProperty('keyCode');

    const soldKey = await sqliteService.get<any>(
      'SELECT * FROM game_keys WHERE key_code = ?',
      [response.body.keyCode],
    );

    expect(soldKey).toBeDefined();
    expect(soldKey.status).toBe('SOLD');

    const transaction = await sqliteService.get<any>(
      'SELECT * FROM transactions WHERE id = ?',
      [response.body.transactionId],
    );

    expect(transaction).toBeDefined();
    expect(transaction.user_id).toBe(2);
    expect(transaction.game_id).toBe(1);
  });

  // TEST 2: Out of stock
  it('should reject purchase when game stock is empty', async () => {
    await sqliteService.run(
      "UPDATE game_keys SET status = 'SOLD' WHERE game_id = ?",
      [2],
    );

    const before = await sqliteService.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE game_id = ?',
      [2],
    );

    await request(app.getHttpServer())
      .post('/transactions/purchase')
      .send({
        userId: 2,
        gameId: 2,
      })
      .expect(400);

    const after = await sqliteService.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE game_id = ?',
      [2],
    );

    expect(after?.count).toBe(before?.count);
  });

  // TEST 3: Game not found
  it('should return 404 when game does not exist', async () => {
    await request(app.getHttpServer())
      .post('/transactions/purchase')
      .send({
        userId: 2,
        gameId: 9999,
      })
      .expect(404);
  });
});
