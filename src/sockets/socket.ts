import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: Server

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

  return io
}

export const getSocket = (): Server => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}
