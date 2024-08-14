"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
var client_1 = require("@prisma/client");
// import { ValidationError, DatabaseError } from '../types/errors';
var prisma = new client_1.PrismaClient();
var UserService = /** @class */ (function () {
    function UserService() {
    }
    return UserService;
}());
exports.UserService = UserService;
// export default UserService;
