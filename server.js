import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from 'socket.io'


const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
await connectDB()




// ******* Socket *******

// Initalize socket server
export const io = new Server(server, {
    cors: { origin: "*" }               // all origin's allow
})


// store online users
export const userSocketMap = {}        // { userId: socketId }


// socket connection
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId)

    if(userId) userSocketMap[userId] = socket.id

    // emit online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on("disconnect", ()=>{
        console.log('User disconnected', userId)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })

})





// ******* Middlewares *******
app.use(express.json({ limit: '4mb' }))    //images size limit
app.use(cors())

app.use('/api/status', (req,res)=> res.send('Server is live!'))
app.use('/api/auth', userRouter )
app.use('/api/messages', messageRouter )






// ******* PORT Listen *******
if(process.env.NODE_ENV !== 'production'){
    server.listen( port, () => console.log(`Server is running on port ${port}!`) )
}



// Export server for vercel
export default server