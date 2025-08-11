"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = exports.prisma = void 0;
const Game_1 = require("./Game");
const messages_1 = require("./messages");
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUserId = null;
        this.users = new Map();
        this.pendingUser = null;
    }
    addUser(socket) {
        const userId = Math.random().toString(36).substr(2, 9);
        socket.userId = userId;
        this.users.set(userId, socket);
        this.addHandler(socket);
    }
    // The corrected removeUser function
    removeUser(socket) {
        let userKeyToDelete = null;
        for (const [key, userSocket] of this.users.entries()) {
            if (userSocket === socket) {
                userKeyToDelete = key;
                break;
            }
        }
        if (userKeyToDelete) {
            this.users.delete(userKeyToDelete);
            console.log(`User with key '${userKeyToDelete}' removed. Current users: ${this.users.size}`);
        }
    }
    addHandler(socket) {
        const userId = socket.userId;
        let playerIds = [];
        socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            const message = JSON.parse(data.toString());
            console.log("message is " + message);
            if (message.type === messages_1.INIT_GAME) {
                console.log("inside of message.type check");
                if (this.pendingUser) {
                    // start a game if there is already a pendingUser waiting
                    const game = new Game_1.Game(this.pendingUser, socket);
                    if (game) {
                        this.games.push(game);
                        // const player1Entry = Array.from(this.users.entries()).find(([id, ws]) => {
                        //     ws === this.pendingUser
                        //     playerIds.push(id)
                        // });
                        let playerIds = [];
                        for (const [id, ws] of this.users.entries()) {
                            if (ws === this.pendingUser) {
                                console.log("this.pendingUser is picked here");
                                playerIds.push(id);
                            }
                        }
                        // const player1Id = player1Entry ? player1Entry[1] : null;
                        // const player2Entry = Array.from(this.users.entries()).find(([id, ws]) => {
                        //     ws === this.pendingUser
                        //     playerIds.push(id)
                        // });
                        for (const [id, ws] of this.users.entries()) {
                            if (ws === socket) {
                                playerIds.push(id);
                            }
                        }
                        console.log("playerIds array is ", playerIds);
                        // const player2Id = player1Entry ? player1Entry[0] : null;
                        // import prisma and then do this here
                        const thegame = yield exports.prisma.games.create({
                            data: {
                                id: ((Date.now() & 0x3fffffff) ^ (Math.random() * 0x3fffffff | 0)) | 0, // or use a proper unique id generator
                                player1Id: playerIds[0],
                                player2Id: playerIds[1]
                            }
                        });
                        const gameId = thegame.id;
                        this.pendingUser = null;
                        console.log("Game created. Current games:", this.games.length);
                    }
                    else {
                        // if no pendingUser found, add this user
                        this.pendingUser = socket;
                    }
                }
                else {
                    this.pendingUser = socket;
                }
            }
            else if (message.type === messages_1.MOVE) {
                console.log("Current games array:", this.games);
                const game = this.games.find(game => game.player1.userId === userId || game.player2.userId === userId);
                if (game) {
                    console.log("DEBUG: Payload received:", JSON.stringify(message.payload));
                    game.makeMove(socket, message.payload, game.player1.userId, game.player2.userId);
                }
                else {
                    console.log("Game not found for user:", userId);
                }
            }
        }));
        socket.on("close", () => {
            this.removeUser(socket);
            // Remove games where this socket was a player
            this.games = this.games.filter(game => game.player1 !== socket && game.player2 !== socket);
            // Clear pending user if it's this socket
            if (this.pendingUser === socket) {
                this.pendingUser = null;
            }
        });
    }
}
exports.GameManager = GameManager;
