import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    purchaseGame(body: any): Promise<{
        transactionId: number;
        game: string;
        keyCode: string;
    }>;
    getUserTransactions(userId: string): Promise<any[]>;
}
