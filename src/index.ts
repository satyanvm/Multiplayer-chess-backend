import { WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import url from 'url';

const wss = new WebSocketServer({ port: 8080 });
// web-socket: connection making

const gameManager = new GameManager();

// --- START: HEARTBEAT LOGIC ---

// Function to handle cleanup when a connection is terminated
function onDisconnect(ws: WebSocket) {
  console.log('🧹 Cleaning up disconnected user.');
  gameManager.removeUser(ws); // Notify GameManager to remove the user
}

// Set up the interval to ping clients
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws: WebSocket) {
    // Augment the WebSocket type to include our custom property
    const wsWithIsAlive = ws as WebSocket & { isAlive: boolean };

    if (wsWithIsAlive.isAlive === false) {
      onDisconnect(wsWithIsAlive);
      return ws.terminate();
    }

    wsWithIsAlive.isAlive = false;
    ws.ping();
  });
}, 30000); // 30 seconds

// Clean up the interval when the server closes
wss.on('close', function close() {
  clearInterval(interval);
});

// --- END: HEARTBEAT LOGIC ---


wss.on('connection', function connection(ws: WebSocket) {
  console.log("✅ Client connected.");


  //  const token: string = url.parse(req.url, true).query.token;


   gameManager.addUser(ws);

  // --- Add heartbeat properties to the new connection ---
  const wsWithIsAlive = ws as WebSocket & { isAlive: boolean };
  wsWithIsAlive.isAlive = true;

  wsWithIsAlive.on('pong', () => {
    wsWithIsAlive.isAlive = true;
  });
  // ---

  // When the connection closes cleanly, also clean up  
  ws.on('close', () => {
    console.log("❌ Client disconnected cleanly.");
    onDisconnect(ws);
  });
});

console.log("🚀 WebSocket Server started on ws://localhost:8080");