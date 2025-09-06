import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
import { randomUUID } from "crypto";
export class Game {
  public player1?: any;
  public player2?: any;
  public player3?: any;
  public gameId: any;
  public board: Chess;
  private startTime: Date;
  private moveCount = 0;

  constructor(player1: any, player2: any, player3?: any, gameId?: string) {
    this.player1 = player1;
    this.player2 = player2;
    this.player3 = player3;
    this.gameId = this.gameId ?? randomUUID;
    this.board = new Chess();
    this.startTime = new Date();

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
        },
      }) 
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }

  async updateSecondPlayer(socket: WebSocket){
    this.player2 = socket;

    const users = await prisma.users.findMany({
      where:{
        id: {
          in: [this.player1]
        }
      }
    })
  }
  async makeMove(
    player1Id: any,
    player2Id: any,
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    },
    player3Id?:any,
  ) { 

        console.log(socket===this.player1);
    console.log(socket===this.player2);
    console.log(socket===this.player3); 

    
    if (this.moveCount % 2 === 0 && socket !== this.player1 ) {
      if(socket === this.player3){
        console.log("proceed")
    } else{
      console.log("its returning here1");
      console.log("this.moveCount is ", this.moveCount);
      return;
    }

    } 

    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      if(socket === this.player3){
        console.log("proceed")
    } else{
      console.log("its returning here2"); 
      console.log("this.moveCount is ", this.moveCount);
      return;
    }
    }

    console.log("did not early return");
    console.log("Did not returned in the gamer over thingy");
    console.log("move is ", move);

    try {
      this.board.move({ from: move.from, to: move.to });
      
      const game = await prisma.games.findFirst({
        where: {
          OR: [{ player1Id: player1Id }, { player2Id: player2Id }],
        },
      }); 
      if (!game) {
        console.error("can't find game in game.ts");
        return;
      }
      const gameId = game.id;

      await prisma.moves.create({
        data: {
          to: move.to,  
          from: move.from,
          gameId: gameId,
          createdAtSec: Date.now().toString(),
          moveNumber: this.moveCount 
        },
      });

      console.log("post db push");
    } catch (e) {
      console.log("caught in try block of game.ts");
      console.log(e);
      return;
    }

    console.log("move succeeded");

      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: move.from,
            to: move.to,
          },
        })
      );

            this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: move.from,
            to: move.to,
          },
        })
      );
      if(this.player3){
            this.player3.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: move.from,
            to: move.to,
          },
        })
      );
      }


    // if (this.moveCount % 2 == 0) {
    //   this.player2.send(
    //     JSON.stringify({
    //       type: MOVE,
    //       payload: {
    //         from: move.from,
    //         to: move.to,
    //       },
    //     })
    //   );
    // }

    // if (this.moveCount % 2 == 1) {
    //   this.player1.send(
    //     JSON.stringify({
    //       type: MOVE,
    //       payload: {
    //         from: move.from,
    //         to: move.to,
    //       },
    //     })
    //   );
    // }
    console.log("before movecount increment");
    this.moveCount = this.moveCount + 1;
  }
}
