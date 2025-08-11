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
exports.Game = exports.prisma = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
class Game {
    constructor(player1, player2) {
        // what my guess is this constructor is only called 
        // when this constructor is called?
        // i can understand that this constructor is only called when the game is initialised but how
        // is that done?    
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }
    makeMove(player1Id, player2Id, socket, move) {
        return __awaiter(this, void 0, void 0, function* () {
            // first validate the chess move
            if (this.moveCount % 2 === 0 && socket !== this.player1) {
                console.log("its returning here1");
                return;
            }
            if (this.moveCount % 2 === 1 && socket !== this.player2) {
                console.log("its returning here2");
                return;
            }
            console.log("did not early return");
            console.log("Did not returned in the gamer over thingy");
            console.log("move is ", move);
            try {
                this.board.move({ from: move.from,
                    to: move.to
                });
                const game = yield exports.prisma.games.findFirst({
                    where: {
                        OR: [
                            { player1Id: player1Id },
                            { player2Id: player2Id },
                        ],
                    },
                });
                if (!game) {
                    console.error("can't find game in game.ts");
                    return;
                }
                const gameId = game.id;
                exports.prisma.moves.create({
                    data: {
                        to: move.to,
                        from: move.from,
                        gameId: gameId,
                        createdAtSec: Date.now().toString()
                    }
                });
                console.log("post db push");
            }
            catch (e) {
                console.log("caught in try block of game.ts");
                console.log(e);
                return;
            }
            console.log("move succeeded");
            if (this.moveCount % 2 == 0) {
                this.player2.send(JSON.stringify({
                    type: messages_1.MOVE,
                    payload: {
                        from: move.from,
                        to: move.to
                    }
                }));
            }
            if (this.moveCount % 2 == 1) {
                this.player1.send(JSON.stringify({
                    type: messages_1.MOVE,
                    payload: {
                        from: move.from,
                        to: move.to
                    }
                }));
            }
            console.log("before movecount increment");
            this.moveCount = this.moveCount + 1;
        });
    }
}
exports.Game = Game;
