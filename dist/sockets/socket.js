"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: '*' },
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getSocket = () => {
    if (!io)
        throw new Error('Socket.io not initialized');
    return io;
};
exports.getSocket = getSocket;
