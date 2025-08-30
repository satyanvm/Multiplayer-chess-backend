import { WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import cors from "cors";
import express from "express";
import http from 'http';
import authroute from './auth/auth' 
const PORT= 8080;
const app = express();
app.use(express.json());
app.use(cors()); 

app.get('/', (req, res) => {
    res.send('HTTP server is running!');
});

app.use('/auth', authroute);

const server = http.createServer(app); 
const wss = new WebSocketServer({ server });
const gameManager = new GameManager();
function onDisconnect(ws: WebSocket) {

  console.log('Cleaning up disconnected user.');

  gameManager.removeUser(ws);

}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws: WebSocket) {
    const wsWithIsAlive = ws as WebSocket & { isAlive: boolean };

    if (wsWithIsAlive.isAlive === false) {
      onDisconnect(wsWithIsAlive);
      return ws.terminate();
    }

    wsWithIsAlive.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});

wss.on('connection', function connection(ws: WebSocket) {
  console.log("Client connected.");

  //  const token: any = url.parse(req.url, true).query.token;
  // const user = extractAuthUser(token, ws);
   gameManager.addUser(ws);

  const wsWithIsAlive = ws as WebSocket & { isAlive: boolean };
  wsWithIsAlive.isAlive = true;

  wsWithIsAlive.on('pong', () => {
    wsWithIsAlive.isAlive = true;
  });

  ws.on('close', () => {
    console.log("Client disconnected cleanly.");
    onDisconnect(ws);
  });
});



server.listen(PORT, () => {
    console.log(`🚀 Server (HTTP & WebSocket) is running on http://localhost:${PORT}`);
});

console.log("WebSocket Server started on ws://localhost:8080");
