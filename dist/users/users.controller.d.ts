import { UsersService } from './users.service';
import { UserModel } from './user.model';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUser(id: string): Promise<UserModel>;
}
