import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";

import { PrismaClient } from "@prisma/client";
import { User } from "./SocketManager";
import { randomUUID } from "crypto";
import { extractAuthUser } from "./auth";
import { Socket } from "dgram";
export const prisma = new PrismaClient();
export const GAME_JOINED = "game_joined";
export const JOIN_ROOM = "join_room";

export class GameManager {
  private games: Game[];
  private pendingUserId: string | null;
  private pendingUser: WebSocket | null;
  private users: Map<string, WebSocket>;

  constructor() {
    this.games = [];
    this.pendingUserId = null;
    this.users = new Map();
    this.pendingUser = null;

  }

  addUser(socket: WebSocket) {
    const userId = Math.random().toString(36).substr(2, 9);
    (socket as any).userId = userId;
    //@ts-ignore
    this.users.set(userId, socket);
    const firstEntry = this.users.values().next();
    this.addHandler(socket); 
 
  }

  removeUser(socket: WebSocket) {
    let userKeyToDelete: string | null = null;
    for (const [key, userSocket] of this.users.entries()) {
      if (userSocket === socket) {
        userKeyToDelete = key;
        break;
      }
    }

    if (userKeyToDelete) {
      this.users.delete(userKeyToDelete);
      console.log(
        `User with key '${userKeyToDelete}' removed. Current users: ${this.users.size}`
      );
    }
  }

  private addHandler(socket: WebSocket) { 
    const userId = (socket as any).userId; 
    let playerIds: any = [];
    socket.addEventListener('message', async (event) => {
      const message = JSON.parse(event.data.toString());
      console.log("message is " + message); 
    
      if(message.type === JOIN_ROOM){

       const gameId = message.payload.gameId;
        if(!gameId){ 
        return;
       } 

       let availableGame = this.games.find((game) => game.gameId === gameId)
                                       
       const gameFromDb = await prisma.games.findUnique({
      where: {id: gameId}, include: { 
        moves: {
          orderBy: {
            //@ts-ignore
            moveNumber: "asc"
          }
        }
       }
      }
    )
    if(availableGame && !availableGame.player2){
      // availableGame.updateS
    }
    if(!gameFromDb){
      console.log("no game from db found");
      return;
    } 
      }

      if (message.type === INIT_GAME) {   
        console.log("inside of message.type check");

        await prisma.users.create({
          data: {
            id: randomUUID(),
            username: message.username,
            name: message.name
            // email: message.email
                    } 
        })   

        if (this.pendingUser) {

            const game = new Game(this.pendingUser, socket); 
          if (game) {  
            this.games.push(game);  

            let playerIds: string[] = [];
            for (const [id, ws] of this.users.entries()) {
              if (ws === this.pendingUser) {
                console.log("this.pendingUser is picked here");
                playerIds.push(id); 
              }
            }

            for (const [id, ws] of this.users.entries()) { 
              if (ws === (socket as unknown as WebSocket)) {
                playerIds.push(id);
              }
            }

            console.log("playerIds array is ", playerIds);
            const thegame = await prisma.games.create({
              data: {
                id:
                  ((Date.now() & 0x3fffffff) ^
                    ((Math.random() * 0x3fffffff) | 0)) |
                  0, 
                player1Id: playerIds[0],
                player2Id: playerIds[1],
              },
            });
            const gameId = thegame.id;

            console.log("Game created. Current games:", this.games.length);
              socket.send( 
                JSON.stringify({
                  type: GAME_JOINED,
                  payload: {
                    gameId: gameId
                    
                  },
                })
              );
                this.pendingUser.send( 
                JSON.stringify({
                  type: GAME_JOINED,
                  payload: {
                    gameId: gameId
                    
                  },
                })
              );
              this.pendingUser = null;
              //     socket1.send( 
              //   JSON.stringify({
              //     type: GAME_JOINED,
              // //     payload: {
              // //       gameId: gameId
              // //     },
              // //   })
              // // );

          } else { 
            //@ts-ignore
            this.pendingUser = socket;
          }
        } else {
          //@ts-ignore
          this.pendingUser = socket;
        }

      } else if (message.type === MOVE) {
        console.log("Current games array:", this.games);
        const game = this.games.find( 
          (game) =>
            game.player1.userId === userId || game.player2.userId === userId
        );

        if (game) {
          console.log(
            "DEBUG: Payload received:",
            JSON.stringify(message.payload)
          );
          game.makeMove(
            game.player1.userId,
            game.player2.userId,
            socket as unknown as WebSocket,
            message.payload
          );
        } else {
          console.log("Game not found for user:", userId);
        }
      }
    });

    socket.addEventListener("close", () => {
      this.removeUser(socket as unknown as WebSocket);
      this.games = this.games.filter(
        (game) => game.player1 !== socket && game.player2 !== socket
      );
      if (this.pendingUser === socket as unknown as WebSocket) {
        this.pendingUser = null;
      }
    });
  }
}
