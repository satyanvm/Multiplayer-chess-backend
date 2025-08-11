"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
// web-socket: connection making
const gameManager = new GameManager_1.GameManager();
// --- START: HEARTBEAT LOGIC ---
// Function to handle cleanup when a connection is terminated
function onDisconnect(ws) {
    console.log('🧹 Cleaning up disconnected user.');
    gameManager.removeUser(ws); // Notify GameManager to remove the user
}
// Set up the interval to ping clients
const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        // Augment the WebSocket type to include our custom property
        const wsWithIsAlive = ws;
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
wss.on('connection', function connection(ws) {
    console.log("✅ Client connected.");
    gameManager.addUser(ws);
    // --- Add heartbeat properties to the new connection ---
    const wsWithIsAlive = ws;
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
