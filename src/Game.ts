import { WebSocket  } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

export class Game {  
  
    public player1: any;         
    public player2: any;     
    private board: Chess;   
    private startTime: Date;     
    private moveCount = 0;
    
    constructor(player1: any, player2: any) {
        
        // what my guess is this constructor is only called 
        // when this constructor is called?
        // i can understand that this constructor is only called when the game is initialised but how
        // is that done?    

        this.player1 = player1;   
        this.player2 = player2;  

        this.board = new Chess();    
        this.startTime = new Date();

        this.player1.send(JSON.stringify({   
            type: INIT_GAME,
            payload: {
                    color: "white"
            } 
        }))  

        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {   
                    color: "black" 
            }
        }))

    }  

   async makeMove(player1Id: any, player2Id: any, socket: WebSocket, move: { 
        from: string; 
        to: string;
    }) {        
        // first validate the chess move
        if(this.moveCount % 2 === 0 && socket !== this.player1) {
            console.log("its returning here1");
            return; 
        } 

        if(this.moveCount % 2 === 1 && socket !== this.player2) {
            console.log("its returning here2");
            return; 
        }

        console.log("did not early return");      
        console.log("Did not returned in the gamer over thingy");
        console.log("move is ", move);

        try{
            this.board.move({from:
                move.from,
                to: move.to
            }); 

            const game = await prisma.games.findFirst({
            where: {
            OR: [
            { player1Id: player1Id },
            { player2Id: player2Id },
            ],
            },
            });
            if(!game){
                console.error("can't find game in game.ts")
                return;
            }
            const gameId = game.id;

            prisma.moves.create({
                data: {
                    to: move.to,
                    from: move.from,
                    gameId: gameId,
                    createdAtSec: Date.now().toString()
                }
                });

                console.log("post db push")

             } catch(e) {
                console.log("caught in try block of game.ts")
                console.log(e);
                return;
             } 
            
             console.log("move succeeded");

            if(this.moveCount % 2 == 0){ 
                this.player2.send(JSON.stringify({
                    type: MOVE,    
                  payload: { 
                      from: move.from,
                      to: move.to
                }
                })) 
            }

            if(this.moveCount % 2 == 1) {
            this.player1.send(JSON.stringify({
                type: MOVE,
             payload: { 
                  from: move.from,
                  to: move.to
            }
            }))
                  } 
            console.log("before movecount increment")
            this.moveCount = this.moveCount + 1;                                                       
                  
      }
}

